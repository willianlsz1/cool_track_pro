// @ts-nocheck
// Deployed with --no-verify-jwt porque este projeto usa ES256 para assinar JWTs
// e o gateway Supabase so valida HS256. A verificacao e feita internamente via
// `verifyUserToken`, que chama .auth.getUser() no Auth server real.
//
// Endpoint: POST /functions/v1/delete-user-account
// Auth:     Authorization: Bearer <user access_token>
//
// LGPD art. 18, VI: remove permanentemente os dados do usuario. Ordem
// fail-closed:
//   1. Storage cleanup em {userId}/** nos buckets do app.
//   2. Deletes manuais em tabelas core.
//   3. admin.deleteUser cascateia o restante.
//
// Storage vem antes de DB/Auth para nao deixar conta ativa com dados de banco ja
// removidos quando list/remove de arquivos falha.
import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUserToken } from '../_shared/auth.ts';
import {
  AccountDeletionError,
  deleteUserAccountLifecycle,
  toPublicAccountDeletionError,
} from './lifecycle.ts';

const DEFAULT_PHOTOS_BUCKET = Deno.env.get('SUPABASE_PHOTOS_BUCKET')?.trim() || 'registro-fotos';
const DEFAULT_REPORTS_BUCKET = Deno.env.get('SUPABASE_REPORTS_BUCKET')?.trim() || 'relatorios';
const STORAGE_BUCKETS = [
  ...new Set([DEFAULT_PHOTOS_BUCKET, DEFAULT_REPORTS_BUCKET].filter(Boolean)),
];

function jsonResponse(req: Request, payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value || !value.trim()) throw new Error(`MISSING_ENV_${name}`);
  return value.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { code: 'METHOD_NOT_ALLOWED' }, 405);
  }

  try {
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY');
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

    const auth = await verifyUserToken(req, supabaseUrl, supabaseAnonKey);
    if (!auth.ok) {
      return jsonResponse(req, { code: auth.code, message: auth.message }, auth.status);
    }
    const userId = auth.user.id;

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const steps = await deleteUserAccountLifecycle(supabaseAdmin, userId, STORAGE_BUCKETS);

    console.log('[delete-user-account] concluido', { steps });

    return jsonResponse(req, { ok: true, steps }, 200);
  } catch (error) {
    if (error instanceof AccountDeletionError) {
      console.error('[delete-user-account] lifecycle failed', {
        code: error.code,
        step: error.step,
        message: error.message,
      });
      return jsonResponse(req, toPublicAccountDeletionError(error), 500);
    }

    console.error(
      '[delete-user-account] erro interno:',
      error instanceof Error ? error.message : error,
    );
    const message = error instanceof Error ? error.message : 'Erro interno';

    if (message.startsWith('MISSING_ENV_')) {
      return jsonResponse(
        req,
        {
          code: 'MISSING_ENV',
          message: 'Configuracao obrigatoria ausente para excluir conta.',
        },
        500,
      );
    }

    return jsonResponse(
      req,
      { code: 'INTERNAL_ERROR', message: 'Erro interno ao excluir conta.' },
      500,
    );
  }
});
