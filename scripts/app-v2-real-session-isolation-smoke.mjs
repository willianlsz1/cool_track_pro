import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import {
  missingIsolationConfigKeys,
  parseDotEnv,
  resolveCpYIsolationConfig,
  storageKeyForSupabaseUrl,
} from './app-v2-real-session-smoke-lib.mjs';

const dotEnvPath = path.resolve(process.cwd(), '.env.local');
const dotEnv = fs.existsSync(dotEnvPath) ? parseDotEnv(fs.readFileSync(dotEnvPath, 'utf8')) : {};
const config = resolveCpYIsolationConfig({ env: process.env, dotEnv });
const missing = missingIsolationConfigKeys(config);

if (missing.length > 0) {
  console.error('[app-v2 CP-Y isolation] Missing required environment values:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  console.error('');
  console.error('Set two test accounts before running this opt-in isolation smoke.');
  process.exit(2);
}

const result = await runRealSessionIsolationSmoke(config);
console.log(JSON.stringify(result, null, 2));

async function runRealSessionIsolationSmoke({
  baseUrl,
  primaryEmail,
  primaryPassword,
  secondaryEmail,
  secondaryPassword,
  supabaseAnonKey,
  supabaseUrl,
}) {
  const primary = await signIn({
    email: primaryEmail,
    password: primaryPassword,
    supabaseAnonKey,
    supabaseUrl,
  });
  const secondary = await signIn({
    email: secondaryEmail,
    password: secondaryPassword,
    supabaseAnonKey,
    supabaseUrl,
  });

  if (primary.user.id === secondary.user.id) {
    throw new Error('Isolation smoke requires two different authenticated users.');
  }

  await deletePrimarySmokeRows(primary);

  const createdAt = new Date().toISOString().replace(/[:.]/g, '-');
  const clienteNome = `Cliente CP-Y isolamento ${createdAt}`;
  const equipamentoNome = `Equipamento CP-Y isolamento ${createdAt}`;
  const tag = `CPY-ISO-${createdAt.slice(0, 16)}`;

  const created = await createPrimaryRows({
    clienteNome,
    equipamentoNome,
    primary,
    tag,
  });
  const secondaryVisibleRows = await readRowsAsSecondary({
    clienteId: created.clienteId,
    equipamentoId: created.equipamentoId,
    secondary,
  });

  if (secondaryVisibleRows.clientes.length > 0 || secondaryVisibleRows.equipamentos.length > 0) {
    throw new Error('Isolation failed: secondary user can read primary user CP-Y rows.');
  }

  await assertRowsHiddenInSecondaryBrowser({
    baseUrl,
    clienteNome,
    equipamentoNome,
    secondary,
    supabaseUrl,
  });

  return {
    ok: true,
    primaryUserId: primary.user.id,
    primaryEmail: primary.user.email,
    secondaryUserId: secondary.user.id,
    secondaryEmail: secondary.user.email,
    created,
    secondaryVisibleRows,
  };
}

async function deletePrimarySmokeRows(primary) {
  const { error: equipamentosError } = await primary.client
    .from('equipamentos')
    .delete()
    .eq('user_id', primary.user.id)
    .ilike('nome', 'Equipamento CP-Y%');

  if (equipamentosError) {
    throw new Error(`Could not clean primary CP-Y equipments: ${equipamentosError.message}`);
  }

  const { error: clientesError } = await primary.client
    .from('clientes')
    .delete()
    .eq('user_id', primary.user.id)
    .ilike('nome', 'Cliente CP-Y%');

  if (clientesError) {
    throw new Error(`Could not clean primary CP-Y clients: ${clientesError.message}`);
  }
}

async function signIn({ email, password, supabaseAnonKey, supabaseUrl }) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new Error(
      `Supabase sign-in failed for configured account: ${error?.message || 'session not returned'}`,
    );
  }

  return { client, session: data.session, user: data.user };
}

async function createPrimaryRows({ clienteNome, equipamentoNome, primary, tag }) {
  const { data: cliente, error: clienteError } = await primary.client
    .from('clientes')
    .insert({
      user_id: primary.user.id,
      nome: clienteNome,
      contato: '(31) 99999-0000',
    })
    .select('id,nome,user_id')
    .single();

  if (clienteError || !cliente) {
    throw new Error(
      `Could not create primary isolation client: ${clienteError?.message || 'no data returned'}`,
    );
  }

  const { data: equipamento, error: equipamentoError } = await primary.client
    .from('equipamentos')
    .insert({
      id: globalThis.crypto.randomUUID(),
      user_id: primary.user.id,
      cliente_id: cliente.id,
      nome: equipamentoNome,
      local: 'Sala CP-Y isolamento',
      status: 'ok',
      tag,
      tipo: 'Split Hi-Wall',
      modelo: null,
      fluido: null,
      componente: null,
      criticidade: 'media',
      prioridade_operacional: 'normal',
      periodicidade_preventiva_dias: null,
      dados_placa: {},
    })
    .select('id,nome,user_id,cliente_id,tag')
    .single();

  if (equipamentoError || !equipamento) {
    throw new Error(
      `Could not create primary isolation equipment: ${equipamentoError?.message || 'no data returned'}`,
    );
  }

  return {
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    equipamentoId: equipamento.id,
    equipamentoNome: equipamento.nome,
    tag: equipamento.tag,
  };
}

async function readRowsAsSecondary({ clienteId, equipamentoId, secondary }) {
  const { data: clientes, error: clientesError } = await secondary.client
    .from('clientes')
    .select('id,nome,user_id')
    .eq('id', clienteId);

  if (clientesError) {
    throw new Error(`Could not query client as secondary user: ${clientesError.message}`);
  }

  const { data: equipamentos, error: equipamentosError } = await secondary.client
    .from('equipamentos')
    .select('id,nome,user_id')
    .eq('id', equipamentoId);

  if (equipamentosError) {
    throw new Error(`Could not query equipment as secondary user: ${equipamentosError.message}`);
  }

  return {
    clientes: clientes ?? [],
    equipamentos: equipamentos ?? [],
  };
}

async function assertRowsHiddenInSecondaryBrowser({
  baseUrl,
  clienteNome,
  equipamentoNome,
  secondary,
  supabaseUrl,
}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  await page.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
      localStorage.setItem('cooltrack-ftx-done', '1');
      localStorage.setItem('cooltrack-tour-done', '1');
    },
    { key: storageKeyForSupabaseUrl(supabaseUrl), session: secondary.session },
  );

  try {
    await page.goto(`${baseUrl.replace(/\/$/, '')}/src/app-v2/authenticated-preview.html`, {
      waitUntil: 'networkidle',
    });
    await page.locator('#app-v2-authenticated-preview').waitFor();
    await page.locator('aside[aria-label]').getByRole('button', { name: 'Equipamentos' }).click();

    if ((await page.getByText(clienteNome, { exact: false }).count()) > 0) {
      throw new Error('Isolation failed: secondary browser can see primary client name.');
    }

    if ((await page.getByText(equipamentoNome, { exact: false }).count()) > 0) {
      throw new Error('Isolation failed: secondary browser can see primary equipment name.');
    }

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
    }
  } finally {
    await browser.close();
  }
}
