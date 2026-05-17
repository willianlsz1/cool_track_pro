import type { AppV2MockSnapshot } from '../data/appV2MockStore';
import type { Cliente } from '../domain/types';

export interface SaveClientDraft {
  id: string;
  nome: string;
  mode?: 'create' | 'edit';
  razaoSocial?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
}

export function saveClient(snapshot: AppV2MockSnapshot, draft: SaveClientDraft): AppV2MockSnapshot {
  const client = buildClientPayload(draft);
  const currentIndex = snapshot.clientes.findIndex((item) => item.id === client.id);
  const shouldEdit = draft.mode === 'edit' || currentIndex >= 0;

  if (shouldEdit && currentIndex < 0) {
    throw new Error('Cliente não encontrado para edição.');
  }

  const clientes = shouldEdit
    ? snapshot.clientes.map((item) => (item.id === client.id ? { ...item, ...client } : item))
    : [...snapshot.clientes, client];

  return {
    ...snapshot,
    clientes,
  };
}

function buildClientPayload(draft: SaveClientDraft): Cliente {
  const id = draft.id.trim();
  const nome = draft.nome.trim();

  if (!id) {
    throw new Error('Não foi possível identificar o cliente.');
  }

  if (!nome) {
    throw new Error('Informe o nome do cliente.');
  }

  return {
    id,
    nome,
    ...(trimOptional(draft.razaoSocial) ? { razaoSocial: trimOptional(draft.razaoSocial) } : {}),
    ...(trimOptional(draft.documento) ? { documento: trimOptional(draft.documento) } : {}),
    ...(trimOptional(draft.contato) ? { contato: trimOptional(draft.contato) } : {}),
    ...(trimOptional(draft.endereco) ? { endereco: trimOptional(draft.endereco) } : {}),
  };
}

function trimOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
