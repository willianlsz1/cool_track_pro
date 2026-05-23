import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import {
  missingConfigKeys,
  parseDotEnv,
  resolveCpYConfig,
  storageKeyForSupabaseUrl,
} from './app-v2-real-session-smoke-lib.mjs';

const dotEnvPath = path.resolve(process.cwd(), '.env.local');
const dotEnv = fs.existsSync(dotEnvPath) ? parseDotEnv(fs.readFileSync(dotEnvPath, 'utf8')) : {};
const config = resolveCpYConfig({ env: process.env, dotEnv });
const missing = missingConfigKeys(config);

if (missing.length > 0) {
  console.error('[app-v2 CP-Y] Missing required environment values:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  console.error('');
  console.error('Set APP_V2_TEST_EMAIL and APP_V2_TEST_PASSWORD, then start Vite locally:');
  console.error('npm run dev -- --host 127.0.0.1 --port 5173');
  process.exit(2);
}

const result = await runRealSessionSmoke(config);
console.log(JSON.stringify(result, null, 2));

async function runRealSessionSmoke({ baseUrl, email, password, supabaseAnonKey, supabaseUrl }) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(`Supabase sign-in failed: ${error?.message || 'session not returned'}`);
  }

  const createdAt = new Date().toISOString().replace(/[:.]/g, '-');
  const clienteNome = `Cliente CP-Y ${createdAt}`;
  const equipamentoNome = `Equipamento CP-Y ${createdAt}`;
  const tag = `CPY-${createdAt.slice(0, 16)}`;
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
    { key: storageKeyForSupabaseUrl(supabaseUrl), session: data.session },
  );

  try {
    await page.goto(`${baseUrl.replace(/\/$/, '')}/src/app-v2/authenticated-preview.html`, {
      waitUntil: 'networkidle',
    });
    await page.locator('#app-v2-authenticated-preview').waitFor();
    await page.getByRole('button', { name: 'Equipamentos' }).click();
    await page.getByRole('button', { name: 'Clientes' }).click();
    await page.getByRole('button', { name: 'Novo cliente' }).click();
    await page.getByLabel('Nome do cliente').fill(clienteNome);
    await page.getByLabel(/Telefone/).fill('(31) 99999-0000');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();
    await page.getByRole('button', { name: new RegExp(clienteNome) }).waitFor();

    await page.getByRole('button', { name: 'Equipamentos' }).click();
    await page.getByRole('button', { name: 'Novo equipamento' }).click();
    await page.getByLabel('Nome').fill(equipamentoNome);
    await page.getByLabel('Local').fill('Sala CP-Y');
    await page.getByLabel('Cliente').selectOption({ label: clienteNome });
    await page.getByLabel(/Tag/).fill(tag);
    await page.getByLabel('Tipo de equipamento').fill('Split Hi-Wall');
    await page.getByRole('button', { name: 'Salvar equipamento' }).click();
    await page.getByRole('button', { name: new RegExp(equipamentoNome) }).waitFor();

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
    }

    return {
      ok: true,
      userId: data.user.id,
      email: data.user.email,
      baseUrl,
      created: {
        clienteNome,
        equipamentoNome,
        tag,
      },
    };
  } finally {
    await browser.close();
  }
}
