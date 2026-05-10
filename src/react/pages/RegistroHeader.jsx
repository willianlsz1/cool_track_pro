import { REGISTRO_ACTIONS, REGISTRO_MODES } from '../../ui/viewModels/registroContracts.js';

const QUICK_TEMPLATES = Object.freeze([
  {
    id: 'limpeza',
    color: 'cyan',
    icon: 'ri-sparkles',
    label: 'Limpeza',
    small: 'preventiva',
  },
  {
    id: 'recarga_gas',
    color: 'amber',
    icon: 'ri-bolt',
    label: 'Recarga',
    small: 'de gás',
  },
  {
    id: 'troca_filtro',
    color: 'teal',
    icon: 'ri-filter',
    label: 'Troca',
    small: 'de filtro',
  },
  {
    id: 'inspecao',
    color: 'violet',
    icon: 'ri-eye',
    label: 'Inspeção',
    small: 'técnica',
  },
  {
    id: 'manutencao_corretiva',
    color: 'red',
    icon: 'ri-wrench',
    label: 'Manutenção',
    small: 'corretiva',
  },
]);

const TIPO_OPTIONS = Object.freeze([
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Limpeza de Filtros',
  'Carga de Gás Refrigerante',
  'Troca de Compressor',
  'Troca de Capacitor',
  'Limpeza de Condensador',
  'Limpeza de Evaporador',
  'Verificação Elétrica',
  'Ajuste de Dreno',
  'Inspeção Geral',
  'Outro',
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function SpriteIcon({ id }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

function InlineSvg({
  children,
  className,
  width = 16,
  height = 16,
  viewBox = '0 0 24 24',
  strokeWidth = 1.7,
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Hero({ viewModel }) {
  const progress = viewModel?.progress || {};
  const total = Number(progress.total || 5) || 5;
  const filled = Math.max(0, Math.min(total, Number(progress.filled || 0) || 0));
  const state = text(
    progress.state,
    filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial',
  );
  const mode = text(viewModel?.mode, REGISTRO_MODES.create);
  const label = mode === REGISTRO_MODES.edit ? 'Editando serviço' : 'Novo registro';

  return (
    <section
      className="registro-hero registro-hero--compact"
      id="registro-hero"
      data-state={state}
      aria-labelledby="registro-hero-pill-text"
    >
      <span className="registro-hero__pill">
        <SpriteIcon id="ri-clipboard" />
        <span id="registro-hero-pill-text">{label}</span>
      </span>
      <div className="registro-hero__progress" aria-label="Progresso dos campos obrigatorios">
        <div
          className="registro-hero__meter"
          id="registro-hero-meter"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax={total}
          aria-valuenow={filled}
        >
          {Array.from({ length: total }).map((_, index) => (
            <span
              className={classNames('registro-hero__seg', index < filled && 'is-filled')}
              key={index}
            ></span>
          ))}
        </div>
        <div className="registro-hero__count">
          <b id="form-progress-count">{filled}</b>/{total}
        </div>
      </div>
      <p className="registro-hero__sub" id="registro-hero-sub" hidden></p>
    </section>
  );
}

function QuickTemplates() {
  return (
    <>
      <div className="registro-kicker">Ações rápidas</div>
      <div className="registro-quick" role="group" aria-label="Modelos rápidos de serviço">
        {QUICK_TEMPLATES.map((template) => (
          <button
            type="button"
            className="registro-quick__tile"
            data-action={REGISTRO_ACTIONS.quickTemplate}
            data-template={template.id}
            data-color={template.color}
            aria-pressed="false"
            key={template.id}
          >
            <span className="registro-quick__icon" aria-hidden="true">
              <SpriteIcon id={template.icon} />
            </span>
            <span className="registro-quick__label">
              {template.label}
              <small>{template.small}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function EquipmentField({ form, selectedEquipamento, equipmentOptions }) {
  const options = asArray(equipmentOptions);
  const selectedName = text(selectedEquipamento?.nome, 'Selecione o equipamento...');
  const selectedMeta = text(selectedEquipamento?.meta);
  const hasSelected = Boolean(text(form?.equipId));

  return (
    <div className="registro-field registro-field--equip-picker">
      <label className="registro-field__label" htmlFor="r-equip-trigger">
        Em qual equipamento?<span className="req">*</span>
      </label>
      <button
        type="button"
        className="registro-equip-trigger"
        id="r-equip-trigger"
        data-r-action="open-equip-picker"
        aria-haspopup="dialog"
        aria-expanded="false"
      >
        <span className="registro-equip-trigger__icon" aria-hidden="true">
          <InlineSvg width={18} height={18}>
            <path d="m14.6 6.3 3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 0 3 3l6.91-6.91a6 6 0 0 0 7.94-7.94l-3.77 3.77-3-3Z" />
          </InlineSvg>
        </span>
        <span className="registro-equip-trigger__body">
          <span
            className={classNames(
              'registro-equip-trigger__name',
              !hasSelected && 'registro-equip-trigger__name--placeholder',
            )}
            id="r-equip-name"
          >
            {selectedName}
          </span>
          <span className="registro-equip-trigger__meta" id="r-equip-meta" hidden={!selectedMeta}>
            {selectedMeta}
          </span>
        </span>
        <InlineSvg className="registro-equip-trigger__chev" width={16} height={16}>
          <polyline points="6 9 12 15 18 9" />
        </InlineSvg>
      </button>
      <select
        key={`equip-${text(form?.equipId)}`}
        id="r-equip"
        className="registro-field__select registro-field__select--hidden"
        required
        aria-required="true"
        aria-hidden="true"
        tabIndex="-1"
        defaultValue={text(form?.equipId)}
      >
        <option value="">Selecione o equipamento...</option>
        {options.map((option) => (
          <option value={text(option?.id)} key={text(option?.id)}>
            {text(option?.label)}
          </option>
        ))}
      </select>
    </div>
  );
}

function MainFields({ viewModel, equipmentOptions, technicianOptions }) {
  const form = viewModel?.form || {};
  const tipoCustomVisible = text(form.tipo) === 'Outro';

  return (
    <>
      <div className="registro-kicker">O serviço</div>
      <section className="registro-bloco registro-bloco--required">
        <div className="registro-bloco__header">
          <h2 className="registro-bloco__title">Dados do atendimento</h2>
          <span className="registro-bloco__required-tag">
            <SpriteIcon id="ri-check" /> Obrigatório
          </span>
        </div>
        <p className="registro-bloco__hint">Preencha os 5 campos para liberar o PDF do cliente.</p>

        <EquipmentField
          form={form}
          selectedEquipamento={viewModel?.selectedEquipamento}
          equipmentOptions={equipmentOptions}
        />

        <div className="registro-field__row">
          <div className="registro-field">
            <label className="registro-field__label" htmlFor="r-data">
              Quando foi?<span className="req">*</span>
            </label>
            <div className="registro-field__datetime" id="registro-datetime-wrap">
              <button
                type="button"
                className="registro-field__datetime-now"
                id="r-data-now-btn"
                aria-pressed="true"
                title="Usa a data e hora deste momento"
              >
                <SpriteIcon id="ri-calendar" />
                <span id="r-data-now-label">Hoje agora</span>
              </button>
              <button
                type="button"
                className="registro-field__datetime-edit"
                id="r-data-edit-btn"
                title="Mudar data e hora"
              >
                <InlineSvg width={13} height={13} strokeWidth={1.8}>
                  <path d="M14 4l6 6-11 11H3v-6L14 4z" />
                </InlineSvg>
                <span>Mudar</span>
              </button>
              <input
                key={`data-${text(form.data)}`}
                id="r-data"
                className="registro-field__input registro-field__input--datetime-hidden"
                type="datetime-local"
                required
                aria-required="true"
                aria-label="Data e hora do servico"
                defaultValue={text(form.data)}
              />
            </div>
          </div>
          <div className="registro-field registro-field--select">
            <label className="registro-field__label" htmlFor="r-tipo">
              O que foi feito?<span className="req">*</span>
            </label>
            <select
              key={`tipo-${text(form.tipo)}`}
              id="r-tipo"
              className="registro-field__select"
              required
              aria-required="true"
              defaultValue={text(form.tipo)}
            >
              <option value="">Selecione o tipo...</option>
              {TIPO_OPTIONS.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="registro-field registro-field--tipo-custom"
          id="r-tipo-custom-wrap"
          hidden={!tipoCustomVisible}
        >
          <label className="registro-field__label" htmlFor="r-tipo-custom">
            Qual serviço?<span className="req">*</span>
          </label>
          <input
            key={`tipo-custom-${text(form.tipoCustom)}`}
            id="r-tipo-custom"
            className="registro-field__input"
            type="text"
            maxLength="40"
            autoComplete="off"
            placeholder="Ex: Teste de estanqueidade, alinhamento de ventilador..."
            defaultValue={text(form.tipoCustom)}
            required={tipoCustomVisible}
            aria-required={tipoCustomVisible ? 'true' : undefined}
          />
          <p className="registro-field__help">Descreva em poucas palavras (até 40 caracteres).</p>
        </div>

        <div className="registro-field">
          <label className="registro-field__label" htmlFor="r-obs">
            Detalhes pro cliente
          </label>
          <textarea
            key={`obs-${text(form.obs)}`}
            id="r-obs"
            className="registro-field__textarea registro-obs"
            placeholder="Ex.: limpei filtros e verifiquei pressão de sucção — tudo ok."
            defaultValue={text(form.obs)}
          ></textarea>
          <p className="registro-field__help">
            Em poucas palavras. Esse texto vai no relatório que você envia ao cliente.
          </p>
        </div>

        <div className="registro-field">
          <label className="registro-field__label" htmlFor="r-tecnico">
            Quem fez?<span className="req">*</span>
          </label>
          <div className="registro-field__with-icon">
            <SpriteIcon id="ri-user" />
            <input
              key={`tecnico-${text(form.tecnico)}`}
              id="r-tecnico"
              className="registro-field__input"
              list="lista-tecnicos"
              type="text"
              placeholder="Seu nome ou o nome do técnico..."
              autoComplete="off"
              required
              aria-required="true"
              defaultValue={text(form.tecnico)}
            />
            <datalist id="lista-tecnicos">
              {asArray(technicianOptions).map((option) => (
                <option value={text(option)} key={text(option)} />
              ))}
            </datalist>
          </div>
        </div>
      </section>
    </>
  );
}

function ContextCard({ context }) {
  const data = context || {};
  const hasContext = Boolean(data.hasCompanyContext);
  const equipamento = data.equipamento || {};
  const equipName = text(equipamento.nome, 'Não informado');
  const equipTag = text(equipamento.tag);
  const equipLabel = equipTag ? `${equipName} · TAG ${equipTag}` : equipName;
  const showHint = Boolean(data.missingEquipFromParams || data.shouldWarnEquipmentOnly);
  const hint = data.missingEquipFromParams
    ? 'Equipamento não encontrado. Confira o cadastro ou escolha outro equipamento.'
    : data.shouldWarnEquipmentOnly
      ? 'Este serviço ficará apenas no histórico do equipamento.'
      : '';

  return (
    <>
      <div className="registro-context-card" id="registro-context-card" hidden={!hasContext}>
        <div className="registro-context-card__title">Atendimento em</div>
        <div className="registro-context-card__line">
          <strong>Cliente:</strong>{' '}
          <span id="registro-context-cliente">{text(data.cliente?.nome, 'Não informado')}</span>
        </div>
        <div className="registro-context-card__line">
          <strong>Setor/local:</strong>{' '}
          <span id="registro-context-setor">{text(data.setor?.nome, 'Não informado')}</span>
        </div>
        <div className="registro-context-card__line">
          <strong>Equipamento:</strong> <span id="registro-context-equip">{equipLabel}</span>
        </div>
      </div>
      <p className="registro-context-hint" id="registro-context-hint" hidden={!showHint}>
        {hint}
      </p>
    </>
  );
}

export function RegistroHeader({ viewModel = {}, equipmentOptions = [], technicianOptions = [] }) {
  return (
    <>
      <Hero viewModel={viewModel} />
      <QuickTemplates />
      <MainFields
        viewModel={viewModel}
        equipmentOptions={equipmentOptions}
        technicianOptions={technicianOptions}
      />
      <ContextCard context={viewModel?.context} />
    </>
  );
}
