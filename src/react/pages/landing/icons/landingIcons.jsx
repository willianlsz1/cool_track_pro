/**
 * Conjunto de icones SVG para a landing React.
 *
 * Recriacao dos sprites visuais aprovados (`minimalist_app_icon_set_design`
 * e `refrigeration_and_air_conditioning_icons`) como componentes JSX
 * inline. Mantem o estilo line-art azul minimalista das imagens, com
 * detalhes em fill `landing-blue-vivid` / cyan onde o original tem.
 *
 * Convencoes:
 *  - todas as funcoes aceitam `size` (default 28) e propagam `...props`;
 *  - cores sao fixas (azul escuro stroke + light blue fill + cyan
 *    accent) para ficarem consistentes em qualquer fundo claro;
 *  - `aria-hidden="true"` por padrao — os componentes pais cuidam de
 *    acessibilidade textual (nome do card).
 *
 * Cores:
 *  - stroke principal: #1e40af (azul escuro / landing-navy-3)
 *  - fill secundario: #cfe5ff (azul muito claro)
 *  - accent: #40C4FF (landing-cyan, usado em snowflakes e checks)
 */

const STROKE = '#1e40af';
const FILL_LIGHT = '#cfe5ff';
const ACCENT = '#40C4FF';
const FILL_SOLID = '#3b82f6';

function Icon({ size = 28, viewBox = '0 0 64 64', children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// ============================================================================
// FEATURES (6 icones)
// ============================================================================

export function ClientesIcon(props) {
  return (
    <Icon {...props}>
      {/* Pessoa principal (frente) */}
      <circle cx="24" cy="22" r="8" fill={FILL_SOLID} stroke={STROKE} strokeWidth="2.5" />
      <path
        d="M10 50 c0-8 6-14 14-14 s14 6 14 14"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Pessoa secundaria (atras) */}
      <circle cx="42" cy="26" r="6" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      <path
        d="M34 48 c0-6 5-12 11-12 s11 6 11 12 v2"
        fill={FILL_LIGHT}
        stroke={STROKE}
        strokeWidth="2.5"
      />
    </Icon>
  );
}

export function EquipamentosIcon(props) {
  return (
    <Icon {...props}>
      {/* Caixa do equipamento */}
      <rect
        x="8"
        y="14"
        width="48"
        height="36"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Pés */}
      <line x1="14" y1="50" x2="14" y2="55" stroke={STROKE} strokeWidth="2.5" />
      <line x1="50" y1="50" x2="50" y2="55" stroke={STROKE} strokeWidth="2.5" />
      {/* Ventilador / circulo principal */}
      <circle cx="22" cy="32" r="10" fill="#0b1b33" stroke={STROKE} strokeWidth="2" />
      <circle cx="22" cy="32" r="7" fill="none" stroke={ACCENT} strokeWidth="1.2" />
      {/* Snowflake no centro do ventilador */}
      <g stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round">
        <line x1="22" y1="27" x2="22" y2="37" />
        <line x1="17" y1="32" x2="27" y2="32" />
        <line x1="18.5" y1="28.5" x2="25.5" y2="35.5" />
        <line x1="25.5" y1="28.5" x2="18.5" y2="35.5" />
      </g>
      {/* Display lateral */}
      <line x1="38" y1="24" x2="50" y2="24" stroke={STROKE} strokeWidth="2.2" />
      <line x1="38" y1="30" x2="50" y2="30" stroke={STROKE} strokeWidth="2.2" />
      <line x1="38" y1="36" x2="48" y2="36" stroke={STROKE} strokeWidth="2.2" />
    </Icon>
  );
}

export function OrdensServicoIcon(props) {
  return (
    <Icon {...props}>
      {/* Clipboard */}
      <rect
        x="14"
        y="10"
        width="36"
        height="46"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Pinça do topo */}
      <rect
        x="24"
        y="6"
        width="16"
        height="8"
        rx="2"
        fill={FILL_LIGHT}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Item 1 com check */}
      <circle cx="22" cy="24" r="3" fill={ACCENT} stroke={STROKE} strokeWidth="1.5" />
      <path d="M20.5 24 l1.3 1.3 l2.7 -2.6" stroke="#fff" strokeWidth="1.6" fill="none" />
      <line x1="29" y1="24" x2="44" y2="24" stroke={STROKE} strokeWidth="2.5" />
      {/* Item 2 com check */}
      <circle cx="22" cy="34" r="3" fill={ACCENT} stroke={STROKE} strokeWidth="1.5" />
      <path d="M20.5 34 l1.3 1.3 l2.7 -2.6" stroke="#fff" strokeWidth="1.6" fill="none" />
      <line x1="29" y1="34" x2="44" y2="34" stroke={STROKE} strokeWidth="2.5" />
      {/* Item 3 sem check */}
      <circle cx="22" cy="44" r="3" fill="none" stroke={STROKE} strokeWidth="2" />
      <line x1="29" y1="44" x2="40" y2="44" stroke={STROKE} strokeWidth="2.5" />
    </Icon>
  );
}

export function PreventivasIcon(props) {
  return (
    <Icon {...props}>
      {/* Calendario */}
      <rect
        x="8"
        y="14"
        width="44"
        height="42"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Topo do calendario */}
      <path
        d="M8 22 v-5 a3 3 0 0 1 3 -3 h38 a3 3 0 0 1 3 3 v5 z"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Anéis */}
      <line x1="18" y1="8" x2="18" y2="18" stroke={STROKE} strokeWidth="3" />
      <line x1="42" y1="8" x2="42" y2="18" stroke={STROKE} strokeWidth="3" />
      {/* Grid de dias (3x3) */}
      <rect x="14" y="28" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      <rect x="22" y="28" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      <rect x="30" y="28" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      <rect x="14" y="36" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      <rect x="22" y="36" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      <rect x="30" y="36" width="6" height="5" rx="1" fill={FILL_LIGHT} />
      {/* Check circle */}
      <circle cx="44" cy="48" r="8" fill={ACCENT} stroke={STROKE} strokeWidth="2" />
      <path d="M40.5 48 l2.5 2.5 l5 -5" stroke="#fff" strokeWidth="2.2" fill="none" />
    </Icon>
  );
}

export function RelatoriosIcon(props) {
  return (
    <Icon {...props}>
      {/* Documento */}
      <path
        d="M14 6 h26 l10 10 v40 a2 2 0 0 1 -2 2 h-34 a2 2 0 0 1 -2 -2 v-48 a2 2 0 0 1 2 -2 z"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Dobra do canto */}
      <path d="M40 6 v10 h10" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      {/* Linhas de texto */}
      <line x1="18" y1="22" x2="34" y2="22" stroke={STROKE} strokeWidth="2.2" />
      <line x1="18" y1="28" x2="38" y2="28" stroke={STROKE} strokeWidth="2.2" />
      {/* Barras do grafico */}
      <rect x="18" y="44" width="5" height="8" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2" />
      <rect x="26" y="38" width="5" height="14" fill={FILL_SOLID} stroke={STROKE} strokeWidth="2" />
      <rect x="34" y="34" width="5" height="18" fill={FILL_SOLID} stroke={STROKE} strokeWidth="2" />
    </Icon>
  );
}

export function DashboardIcon(props) {
  return (
    <Icon {...props}>
      {/* Janela */}
      <rect
        x="6"
        y="10"
        width="52"
        height="44"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Barra de titulo */}
      <line x1="6" y1="18" x2="58" y2="18" stroke={STROKE} strokeWidth="2.5" />
      <circle cx="11" cy="14" r="1" fill={STROKE} />
      <circle cx="15" cy="14" r="1" fill={STROKE} />
      <circle cx="19" cy="14" r="1" fill={STROKE} />
      {/* Pie chart */}
      <circle cx="20" cy="36" r="9" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2" />
      <path
        d="M20 36 L20 27 A9 9 0 0 1 28.5 39 Z"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Bar chart na direita */}
      <rect
        x="36"
        y="42"
        width="4"
        height="6"
        fill={FILL_LIGHT}
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <rect
        x="42"
        y="38"
        width="4"
        height="10"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <rect
        x="48"
        y="34"
        width="4"
        height="14"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="1.5"
      />
      {/* Linhas da legenda */}
      <line x1="36" y1="26" x2="52" y2="26" stroke={STROKE} strokeWidth="2" />
      <line x1="36" y1="30" x2="48" y2="30" stroke={STROKE} strokeWidth="2" />
    </Icon>
  );
}

// ============================================================================
// SEGMENTOS (6 icones)
// ============================================================================

export function ArSplitIcon(props) {
  return (
    <Icon {...props}>
      {/* Corpo do split hi-wall */}
      <rect
        x="6"
        y="20"
        width="52"
        height="20"
        rx="4"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Louvers/saida de ar */}
      <line x1="10" y1="36" x2="42" y2="36" stroke={STROKE} strokeWidth="2.5" />
      <line x1="10" y1="32" x2="38" y2="32" stroke={STROKE} strokeWidth="1.6" opacity="0.6" />
      {/* Snowflake */}
      <g stroke={ACCENT} strokeWidth="2" strokeLinecap="round" fill="none">
        <g transform="translate(48, 30)">
          <line x1="0" y1="-5" x2="0" y2="5" />
          <line x1="-5" y1="0" x2="5" y2="0" />
          <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" />
          <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" />
        </g>
      </g>
      {/* LED */}
      <circle cx="52" cy="30" r="1.2" fill={ACCENT} />
    </Icon>
  );
}

export function ArComercialIcon(props) {
  return (
    <Icon {...props}>
      {/* Cassete de teto (visao trapezoidal) */}
      <path d="M10 18 h44 l-4 14 h-36 z" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      {/* Compartimento central / louvers */}
      <rect
        x="20"
        y="22"
        width="24"
        height="14"
        rx="1"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="2"
      />
      <line x1="22" y1="26" x2="42" y2="26" stroke="#fff" strokeWidth="1.6" />
      <line x1="22" y1="30" x2="42" y2="30" stroke="#fff" strokeWidth="1.6" />
      <line x1="22" y1="34" x2="42" y2="34" stroke="#fff" strokeWidth="1.6" />
      {/* Saida de ar laterais */}
      <rect x="10" y="33" width="6" height="6" fill={ACCENT} opacity="0.7" />
      <rect x="48" y="33" width="6" height="6" fill={ACCENT} opacity="0.7" />
      {/* Suporte */}
      <line x1="32" y1="36" x2="32" y2="42" stroke={STROKE} strokeWidth="2.5" />
      <line x1="22" y1="42" x2="42" y2="42" stroke={STROKE} strokeWidth="2.5" />
    </Icon>
  );
}

export function CamaraFriaIcon(props) {
  return (
    <Icon {...props}>
      {/* Cubo isometrico — face frontal */}
      <path d="M12 22 v32 h28 v-32 z" fill="#fff" stroke={STROKE} strokeWidth="2.5" />
      {/* Face superior (perspectiva) */}
      <path d="M12 22 l8 -8 h28 l-8 8 z" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      {/* Face lateral direita */}
      <path d="M40 22 l8 -8 v32 l-8 8 z" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      {/* Porta com dobradicas */}
      <rect x="14" y="26" width="4" height="3" fill={STROKE} />
      <rect x="14" y="46" width="4" height="3" fill={STROKE} />
      {/* Maçaneta */}
      <circle cx="36" cy="38" r="1.5" fill={STROKE} />
      {/* Snowflake na porta */}
      <g stroke={ACCENT} strokeWidth="2" strokeLinecap="round" fill="none">
        <g transform="translate(26, 38)">
          <line x1="0" y1="-6" x2="0" y2="6" />
          <line x1="-6" y1="0" x2="6" y2="0" />
          <line x1="-4" y1="-4" x2="4" y2="4" />
          <line x1="4" y1="-4" x2="-4" y2="4" />
        </g>
      </g>
    </Icon>
  );
}

export function FreezerIcon(props) {
  return (
    <Icon {...props}>
      {/* Corpo vertical */}
      <rect
        x="14"
        y="6"
        width="36"
        height="52"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Display LED no topo */}
      <rect
        x="20"
        y="11"
        width="24"
        height="6"
        rx="1.5"
        fill="#0b1b33"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <circle cx="40" cy="14" r="1" fill={ACCENT} />
      <circle cx="36" cy="14" r="1" fill={ACCENT} />
      {/* Linha divisoria (porta superior + inferior) */}
      <line x1="14" y1="32" x2="50" y2="32" stroke={STROKE} strokeWidth="2" opacity="0.5" />
      {/* Maçaneta vertical */}
      <rect x="44" y="22" width="3" height="8" rx="1" fill={STROKE} />
      <rect x="44" y="40" width="3" height="8" rx="1" fill={STROKE} />
      {/* Snowflake no centro */}
      <g stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <g transform="translate(28, 42)">
          <line x1="0" y1="-7" x2="0" y2="7" />
          <line x1="-7" y1="0" x2="7" y2="0" />
          <line x1="-5" y1="-5" x2="5" y2="5" />
          <line x1="5" y1="-5" x2="-5" y2="5" />
        </g>
      </g>
      {/* Pés */}
      <line x1="20" y1="58" x2="20" y2="62" stroke={STROKE} strokeWidth="2" />
      <line x1="44" y1="58" x2="44" y2="62" stroke={STROKE} strokeWidth="2" />
    </Icon>
  );
}

export function IndustrialIcon(props) {
  return (
    <Icon {...props}>
      {/* Base */}
      <rect
        x="6"
        y="42"
        width="52"
        height="14"
        rx="2"
        fill={FILL_LIGHT}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Tanque/cilindro vertical (esquerda) */}
      <rect
        x="10"
        y="22"
        width="14"
        height="20"
        rx="2"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      <ellipse cx="17" cy="22" rx="7" ry="2.5" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2" />
      {/* Tubo conectando */}
      <rect
        x="22"
        y="30"
        width="10"
        height="4"
        fill={FILL_SOLID}
        stroke={STROKE}
        strokeWidth="1.6"
      />
      {/* Compressor central (caixa retangular) */}
      <rect
        x="30"
        y="20"
        width="14"
        height="22"
        rx="2"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      <line x1="32" y1="26" x2="42" y2="26" stroke={STROKE} strokeWidth="1.5" />
      <line x1="32" y1="30" x2="42" y2="30" stroke={STROKE} strokeWidth="1.5" />
      {/* Ventilador (direita) */}
      <circle cx="52" cy="30" r="8" fill={FILL_LIGHT} stroke={STROKE} strokeWidth="2.5" />
      <circle cx="52" cy="30" r="2" fill={STROKE} />
      <g stroke={STROKE} strokeWidth="1.5" fill="none">
        <line x1="52" y1="24" x2="52" y2="28" />
        <line x1="52" y1="32" x2="52" y2="36" />
        <line x1="46" y1="30" x2="50" y2="30" />
        <line x1="54" y1="30" x2="58" y2="30" />
      </g>
    </Icon>
  );
}

export function PmocIcon(props) {
  return (
    <Icon {...props}>
      {/* Clipboard */}
      <rect
        x="10"
        y="10"
        width="36"
        height="46"
        rx="3"
        fill="#fff"
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* Pinça */}
      <rect
        x="20"
        y="6"
        width="16"
        height="8"
        rx="2"
        fill={FILL_LIGHT}
        stroke={STROKE}
        strokeWidth="2.5"
      />
      {/* 3 itens com check */}
      <rect x="16" y="22" width="3" height="3" fill={ACCENT} stroke={STROKE} strokeWidth="1" />
      <line x1="22" y1="24" x2="40" y2="24" stroke={STROKE} strokeWidth="2.2" />
      <rect x="16" y="30" width="3" height="3" fill={ACCENT} stroke={STROKE} strokeWidth="1" />
      <line x1="22" y1="32" x2="40" y2="32" stroke={STROKE} strokeWidth="2.2" />
      <rect x="16" y="38" width="3" height="3" fill={ACCENT} stroke={STROKE} strokeWidth="1" />
      <line x1="22" y1="40" x2="40" y2="40" stroke={STROKE} strokeWidth="2.2" />
      {/* Check circle grande no canto */}
      <circle cx="48" cy="48" r="10" fill={ACCENT} stroke={STROKE} strokeWidth="2" />
      <path d="M43 48 l3 3 l7 -7" stroke="#fff" strokeWidth="2.5" fill="none" />
    </Icon>
  );
}

// ============================================================================
// PROBLEMAS (6 icones)
// ============================================================================
//
// Diferente dos icones acima (que ficam em cards brancos), os icones de
// problemas ficam em cards navy escuros translucidos. Por isso usam
// paleta com stroke claro (cyan + light blue) — desenho do sprite
// `a_set_of_six_minimalistic_vector_icons_highlights.png` aprovado.

const DARK_STROKE = '#7dc8ff'; // azul claro para visibilidade no fundo navy
const DARK_FILL = 'rgba(64,196,255,0.18)'; // cyan translucido
const DARK_ACCENT = '#40C4FF'; // landing-cyan

function DarkIcon({ size = 28, viewBox = '0 0 64 64', children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function OsSemPadraoIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Clipboard com itens irregulares (X markers indicando inconsistencia) */}
      <rect
        x="14"
        y="10"
        width="36"
        height="46"
        rx="3"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <rect
        x="24"
        y="6"
        width="16"
        height="8"
        rx="2"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      {/* Linha 1: campo preenchido */}
      <line x1="20" y1="24" x2="32" y2="24" stroke={DARK_ACCENT} strokeWidth="2.5" />
      <line x1="34" y1="24" x2="44" y2="24" stroke={DARK_STROKE} strokeWidth="2" opacity="0.5" />
      {/* Linha 2: campo faltando (apenas tracejado) */}
      <line
        x1="20"
        y1="32"
        x2="44"
        y2="32"
        stroke={DARK_STROKE}
        strokeWidth="2"
        strokeDasharray="3 3"
        opacity="0.6"
      />
      {/* Linha 3: campo com X (erro) */}
      <line x1="20" y1="40" x2="28" y2="40" stroke={DARK_STROKE} strokeWidth="2" />
      <path d="M32 38l4 4M36 38l-4 4" stroke={DARK_ACCENT} strokeWidth="2.2" />
      {/* Linha 4: vazia */}
      <line x1="20" y1="48" x2="40" y2="48" stroke={DARK_STROKE} strokeWidth="2" opacity="0.4" />
    </DarkIcon>
  );
}

export function HistoricoPerdidoIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Sino de notificacao com clock no canto (historico perdido) */}
      <path
        d="M14 44 c0-2 2-4 4-5 v-6 a14 14 0 0 1 28 0 v6 c2 1 4 3 4 5 z"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      {/* Badrenz do sino */}
      <path d="M27 50 a5 5 0 0 0 10 0" fill="none" stroke={DARK_STROKE} strokeWidth="2.2" />
      {/* Topo do sino */}
      <line x1="32" y1="11" x2="32" y2="15" stroke={DARK_STROKE} strokeWidth="2.5" />
      {/* Pequeno relogio no canto inferior direito (historico) */}
      <circle cx="46" cy="46" r="9" fill="#0b1b33" stroke={DARK_ACCENT} strokeWidth="2" />
      <line x1="46" y1="40" x2="46" y2="46" stroke={DARK_ACCENT} strokeWidth="1.8" />
      <line x1="46" y1="46" x2="50" y2="48" stroke={DARK_ACCENT} strokeWidth="1.8" />
    </DarkIcon>
  );
}

export function RelatoriosImprovisadosIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Pie chart com fatias soltas (improvisado) */}
      <circle cx="32" cy="32" r="20" fill={DARK_FILL} stroke={DARK_STROKE} strokeWidth="2.2" />
      {/* Fatia preenchida (top) */}
      <path
        d="M32 32 L32 12 A20 20 0 0 1 49.32 42 Z"
        fill={DARK_ACCENT}
        fillOpacity="0.55"
        stroke={DARK_STROKE}
        strokeWidth="2"
      />
      {/* Fatia secundaria (bottom-left) */}
      <path
        d="M32 32 L14.68 22 A20 20 0 0 0 14.68 42 Z"
        fill={DARK_ACCENT}
        fillOpacity="0.25"
        stroke={DARK_STROKE}
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="3" fill={DARK_STROKE} />
    </DarkIcon>
  );
}

export function PreventivasEsquecidasIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Calendario com relogio sobreposto (atrasado) */}
      <rect
        x="8"
        y="14"
        width="40"
        height="38"
        rx="3"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      {/* Topo do calendario */}
      <path
        d="M8 22 v-5 a3 3 0 0 1 3 -3 h34 a3 3 0 0 1 3 3 v5 z"
        fill={DARK_ACCENT}
        fillOpacity="0.6"
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <line x1="18" y1="9" x2="18" y2="17" stroke={DARK_STROKE} strokeWidth="2.5" />
      <line x1="38" y1="9" x2="38" y2="17" stroke={DARK_STROKE} strokeWidth="2.5" />
      {/* Grid de dias */}
      <rect x="14" y="28" width="5" height="4" fill={DARK_STROKE} opacity="0.4" />
      <rect x="22" y="28" width="5" height="4" fill={DARK_STROKE} opacity="0.4" />
      <rect x="30" y="28" width="5" height="4" fill={DARK_STROKE} opacity="0.4" />
      <rect x="14" y="36" width="5" height="4" fill={DARK_STROKE} opacity="0.4" />
      {/* Relogio no canto direito (alarm/atraso) */}
      <circle cx="46" cy="46" r="11" fill="#0b1b33" stroke={DARK_ACCENT} strokeWidth="2.2" />
      <line x1="46" y1="40" x2="46" y2="46" stroke={DARK_ACCENT} strokeWidth="2" />
      <line x1="46" y1="46" x2="51" y2="48" stroke={DARK_ACCENT} strokeWidth="2" />
    </DarkIcon>
  );
}

export function FotosEspalhadasIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Tres fotos sobrepostas/desalinhadas */}
      {/* Foto traseira (esquerda) */}
      <rect
        x="8"
        y="14"
        width="28"
        height="22"
        rx="2"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2"
        transform="rotate(-8, 22, 25)"
      />
      {/* Foto traseira (direita) */}
      <rect
        x="28"
        y="12"
        width="28"
        height="22"
        rx="2"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2"
        transform="rotate(6, 42, 23)"
      />
      {/* Foto frontal centro com paisagem */}
      <rect
        x="16"
        y="28"
        width="32"
        height="26"
        rx="3"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <circle cx="24" cy="36" r="2.5" fill={DARK_ACCENT} />
      <path
        d="M18 50 l8 -8 l5 5 l6 -7 l9 9"
        fill="none"
        stroke={DARK_ACCENT}
        strokeWidth="2"
        opacity="0.85"
      />
    </DarkIcon>
  );
}

export function DadosTecnicosSoltosIcon(props) {
  return (
    <DarkIcon {...props}>
      {/* Cilindros de banco de dados (database stack) */}
      <ellipse
        cx="32"
        cy="14"
        rx="18"
        ry="5"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <path
        d="M14 14 v12 a18 5 0 0 0 36 0 v-12"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <ellipse
        cx="32"
        cy="26"
        rx="18"
        ry="5"
        fill="none"
        stroke={DARK_STROKE}
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        d="M14 26 v12 a18 5 0 0 0 36 0 v-12"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <ellipse
        cx="32"
        cy="38"
        rx="18"
        ry="5"
        fill="none"
        stroke={DARK_STROKE}
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        d="M14 38 v12 a18 5 0 0 0 36 0 v-12"
        fill={DARK_FILL}
        stroke={DARK_STROKE}
        strokeWidth="2.2"
      />
      <ellipse
        cx="32"
        cy="50"
        rx="18"
        ry="5"
        fill="none"
        stroke={DARK_STROKE}
        strokeWidth="1.6"
        opacity="0.7"
      />
      {/* LED indicadores soltos */}
      <circle cx="20" cy="20" r="1.5" fill={DARK_ACCENT} />
      <circle cx="20" cy="32" r="1.5" fill={DARK_ACCENT} />
      <circle cx="20" cy="44" r="1.5" fill={DARK_ACCENT} />
    </DarkIcon>
  );
}
