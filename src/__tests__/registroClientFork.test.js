import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registroSource = fs.readFileSync(path.join(root, 'src/ui/views/registro.js'), 'utf8');
const templateSource = fs.readFileSync(path.join(root, 'src/ui/shell/templates/views.js'), 'utf8');
const sheetSource = fs.readFileSync(
  path.join(root, 'src/ui/components/registroClienteForkSheet.js'),
  'utf8',
);

describe('registro cliente fork', () => {
  it('fork aparece sem contexto, seção inline escondida', () => {
    expect(registroSource).toContain('details.hidden = true');
    expect(registroSource).toContain('_resolveRegistroClientFork');
    expect(sheetSource).toContain('Pra quem é esse PDF?');
  });

  it('fork não aparece com contexto, auto-fill funciona, label mostra nome', () => {
    expect(registroSource).toContain('if (!forceClientFork && hasResolvedClient) return true');
    expect(registroSource).toContain("Utils.setVal('r-cliente-nome', context.cliente.nome || '')");
    expect(registroSource).toContain('Salvar e enviar pro ${clienteNome}');
  });

  it('Enviar sem identificar persiste cliente vazio', () => {
    expect(sheetSource).toContain('Enviar sem identificar');
    expect(sheetSource).toContain("clienteNome: ''");
    expect(sheetSource).toContain("clienteContato: ''");
  });

  it('Cliente identificado preenche e salva', () => {
    expect(sheetSource).toContain('Cliente identificado');
    expect(sheetSource).toContain('readIdentifiedClient');
    expect(registroSource).toContain('_applyRegistroClientFields(result)');
  });

  it('Kebab força fork mesmo com contexto', () => {
    expect(templateSource).toContain('save-and-share-other-registro');
    expect(registroSource).toContain('forceClientFork = false');
    expect(registroSource).toContain('forceClientFork });');
  });
});
