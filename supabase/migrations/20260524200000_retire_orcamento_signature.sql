-- CoolTrack Pro - Retire legacy orcamento digital signature surface.
--
-- The app-v2 quotes flow will be rebuilt natively later. This migration removes
-- the v1 public token/RPC signature path while preserving regular orcamentos.

drop function if exists public.sign_orcamento_by_token(uuid, text, text, text);
drop function if exists public.get_orcamento_by_token(uuid);

do $$
begin
  if to_regclass('public.orcamentos') is not null then
    update public.orcamentos
       set status = 'enviado',
           updated_at = timezone('utc', now())
     where status = 'aguardando_assinatura';

    drop index if exists public.orcamentos_share_token_idx;

    alter table public.orcamentos
      drop constraint if exists orcamentos_status_check;

    alter table public.orcamentos
      add constraint orcamentos_status_check check (
        status in ('rascunho', 'enviado', 'aprovado', 'recusado', 'expirado', 'convertido')
      );

    alter table public.orcamentos
      drop column if exists share_token,
      drop column if exists share_token_expires_at,
      drop column if exists assinatura_cliente_dataurl,
      drop column if exists assinado_em,
      drop column if exists assinado_nome,
      drop column if exists assinado_user_agent;
  end if;
end $$;

notify pgrst, 'reload schema';
