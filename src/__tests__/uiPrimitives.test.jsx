import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ActionBar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusPill,
  Table,
  Tabs,
} from '../react/components/ui/index.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let currentRoot = null;

async function renderPrimitive(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  currentRoot = createRoot(host);

  await act(async () => {
    currentRoot.render(element);
  });

  return host;
}

describe('React UI primitives', () => {
  afterEach(async () => {
    if (currentRoot) {
      await act(async () => {
        currentRoot.unmount();
      });
    }
    currentRoot = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders Button variants with a safe default button type', async () => {
    const host = await renderPrimitive(<Button>Salvar</Button>);
    const button = host.querySelector('button');

    expect(button?.textContent).toBe('Salvar');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.className).toContain('tw-bg-[var(--ct-brand)]');
  });

  it('allows Button submit type, variant, size, fullWidth, disabled and extra className', async () => {
    const host = await renderPrimitive(
      <Button
        type="submit"
        variant="danger"
        size="lg"
        fullWidth
        disabled
        className="tw-custom-hook"
      >
        Excluir
      </Button>,
    );
    const button = host.querySelector('button');

    expect(button?.getAttribute('type')).toBe('submit');
    expect(button?.disabled).toBe(true);
    expect(button?.className).toContain('tw-bg-[var(--ct-error)]');
    expect(button?.className).toContain('tw-h-11');
    expect(button?.className).toContain('tw-w-full');
    expect(button?.className).toContain('tw-custom-hook');
  });

  it('preserves Button events, data attributes and aria attributes', async () => {
    const onClick = vi.fn();
    const host = await renderPrimitive(
      <Button
        onClick={onClick}
        data-action="save-registro"
        data-nav="registro"
        data-id="reg-1"
        aria-label="Salvar registro"
      >
        Salvar
      </Button>,
    );
    const button = host.querySelector('button');

    button?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button?.dataset.action).toBe('save-registro');
    expect(button?.dataset.nav).toBe('registro');
    expect(button?.dataset.id).toBe('reg-1');
    expect(button?.getAttribute('aria-label')).toBe('Salvar registro');
  });

  it('renders Card with children, className and semantic element', async () => {
    const host = await renderPrimitive(
      <Card as="article" variant="raised" className="tw-card-hook" data-id="card-1">
        Cliente ativo
      </Card>,
    );
    const card = host.querySelector('article');

    expect(card?.textContent).toBe('Cliente ativo');
    expect(card?.dataset.id).toBe('card-1');
    expect(card?.className).toContain('tw-bg-[var(--ct-surface-raised)]');
    expect(card?.className).toContain('tw-card-hook');
  });

  it('renders Badge children and applies tone, size and extra className', async () => {
    const host = await renderPrimitive(
      <Badge tone="premium" size="sm" className="tw-custom-badge">
        Pro
      </Badge>,
    );
    const badge = host.querySelector('span');

    expect(badge?.textContent).toBe('Pro');
    expect(badge?.className).toContain('tw-bg-[rgba(217,164,65,0.14)]');
    expect(badge?.className).toContain('tw-text-xs');
    expect(badge?.className).toContain('tw-custom-badge');
  });

  it('preserves Badge title, data attributes and aria attributes', async () => {
    const host = await renderPrimitive(
      <Badge title="Plano atual" data-tier="pro" data-id="plan-1" aria-label="Plano Pro">
        Pro
      </Badge>,
    );
    const badge = host.querySelector('span');

    expect(badge?.getAttribute('title')).toBe('Plano atual');
    expect(badge?.dataset.tier).toBe('pro');
    expect(badge?.dataset.id).toBe('plan-1');
    expect(badge?.getAttribute('aria-label')).toBe('Plano Pro');
  });

  it('renders StatusPill variants with optional dot and safe truncation', async () => {
    const host = await renderPrimitive(
      <StatusPill tone="success" dot data-status="ativo" className="tw-status-hook">
        Em dia
      </StatusPill>,
    );
    const pill = host.querySelector('span');

    expect(pill?.textContent).toBe('Em dia');
    expect(pill?.dataset.status).toBe('ativo');
    expect(pill?.className).toContain('tw-bg-[var(--ct-success-soft)]');
    expect(pill?.className).toContain('tw-truncate');
    expect(pill?.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('preserves Input native props, value changes and aria attributes', async () => {
    const onChange = vi.fn();
    const host = await renderPrimitive(
      <Input
        id="cliente-busca"
        name="busca"
        value="Carlos"
        onChange={onChange}
        placeholder="Buscar cliente"
        aria-label="Busca de clientes"
        data-mode="clientes"
      />,
    );
    const input = host.querySelector('input');

    await act(async () => {
      input.value = 'Carlos Silva';
      Simulate.change(input);
    });

    expect(input?.id).toBe('cliente-busca');
    expect(input?.name).toBe('busca');
    expect(input?.value).toBe('Carlos');
    expect(input?.dataset.mode).toBe('clientes');
    expect(input?.getAttribute('aria-label')).toBe('Busca de clientes');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('preserves Select native props and children', async () => {
    const onChange = vi.fn();
    const host = await renderPrimitive(
      <Select id="status" name="status" value="ativo" onChange={onChange} aria-label="Status">
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </Select>,
    );
    const select = host.querySelector('select');

    select?.dispatchEvent(new Event('change', { bubbles: true }));

    expect(select?.id).toBe('status');
    expect(select?.name).toBe('status');
    expect(select?.value).toBe('ativo');
    expect(select?.getAttribute('aria-label')).toBe('Status');
    expect(select?.children).toHaveLength(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders Tabs with role, aria-selected and data-mode preserved', async () => {
    const host = await renderPrimitive(
      <Tabs aria-label="Período">
        <Tabs.Item active data-mode="7d">
          Últimos 7 dias
        </Tabs.Item>
        <Tabs.Item data-mode="all">Tudo</Tabs.Item>
      </Tabs>,
    );
    const tablist = host.querySelector('[role="tablist"]');
    const tabs = host.querySelectorAll('[role="tab"]');

    expect(tablist?.getAttribute('aria-label')).toBe('Período');
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]?.dataset.mode).toBe('7d');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('false');
  });

  it('renders ActionBar preserving children', async () => {
    const host = await renderPrimitive(
      <ActionBar className="tw-action-hook">
        <Button>Registrar serviço</Button>
        <Button variant="secondary">Cadastrar equipamento</Button>
      </ActionBar>,
    );
    const bar = host.querySelector('div');

    expect(bar?.className).toContain('tw-action-hook');
    expect(host.querySelectorAll('button')).toHaveLength(2);
  });

  it('renders PageHeader title, description, actions and filters', async () => {
    const host = await renderPrimitive(
      <PageHeader
        title="Clientes"
        description="Carteira ativa"
        actions={<Button>Novo cliente</Button>}
        filters={<Tabs.Item active>Todos</Tabs.Item>}
      />,
    );

    expect(host.querySelector('h1')?.textContent).toBe('Clientes');
    expect(host.textContent).toContain('Carteira ativa');
    expect(host.textContent).toContain('Novo cliente');
    expect(host.textContent).toContain('Todos');
  });

  it('renders EmptyState title, description, icon and action', async () => {
    const host = await renderPrimitive(
      <EmptyState
        icon={<span data-testid="empty-icon">!</span>}
        title="Nenhum cliente"
        description="Cadastre o primeiro cliente para começar."
        action={<Button>Novo cliente</Button>}
      />,
    );

    expect(host.textContent).toContain('Nenhum cliente');
    expect(host.textContent).toContain('Cadastre o primeiro cliente');
    expect(host.textContent).toContain('Novo cliente');
    expect(host.querySelector('[data-testid="empty-icon"]')).not.toBeNull();
  });

  it('renders Modal base overlay, dialog, header, body and footer', async () => {
    const onClose = vi.fn();
    const host = await renderPrimitive(
      <Modal open title="Novo equipamento" onClose={onClose} footer={<Button>Salvar</Button>}>
        Dados técnicos
      </Modal>,
    );
    const dialog = host.querySelector('[role="dialog"]');

    expect(host.querySelector('[data-ui="modal-overlay"]')).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(host.textContent).toContain('Novo equipamento');
    expect(host.textContent).toContain('Dados técnicos');
    expect(host.textContent).toContain('Salvar');

    host
      .querySelector('[data-action="close-modal"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Table wrapper preserving native table children', async () => {
    const host = await renderPrimitive(
      <Table className="tw-table-hook">
        <thead>
          <tr>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Felício Rocho</td>
          </tr>
        </tbody>
      </Table>,
    );
    const table = host.querySelector('table');

    expect(table?.className).toContain('tw-table-hook');
    expect(table?.textContent).toContain('Felício Rocho');
  });

  it('does not use unsafe HTML APIs or legacy CSS dependencies', () => {
    const sources = [
      'src/react/components/ui/Button.jsx',
      'src/react/components/ui/Badge.jsx',
      'src/react/components/ui/Card.jsx',
      'src/react/components/ui/StatusPill.jsx',
      'src/react/components/ui/Input.jsx',
      'src/react/components/ui/Select.jsx',
      'src/react/components/ui/Modal.jsx',
      'src/react/components/ui/Tabs.jsx',
      'src/react/components/ui/Table.jsx',
      'src/react/components/ui/ActionBar.jsx',
      'src/react/components/ui/PageHeader.jsx',
      'src/react/components/ui/EmptyState.jsx',
      'src/react/components/ui/index.js',
    ]
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    expect(sources).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
    expect(sources).not.toMatch(/components\.css|redesign\.css|styles\/components/);
    expect(sources).toMatch(/tw-/);
  });
});
