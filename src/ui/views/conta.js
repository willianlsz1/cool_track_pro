/**
 * /conta — Página completa "Minha conta" (substitui o popover accountModal).
 *
 * Layout do mockup aprovado pelo Willian:
 *   1. Hero do plano (badge PLANO·ATIVO + brand + tagline + chips de feature
 *      + 2 cards inferiores: progresso de equipamentos + renovação)
 *   2. Identity card (avatar grande + nome + role + email + Ver perfil público)
 *   3. Section cards agrupados (CONTA · ASSINATURA · DADOS · ZONA DE RISCO)
 *   4. Footer LGPD ("Seus dados estão seguros" + Saiba mais → /privacidade)
 *
 * Os dados vêm de:
 *   - Profile.get()       → nome, role
 *   - Auth.getUser()      → email
 *   - billingProfile      → plano efetivo + subscription_current_period_end
 *   - getState()          → contagem de equipamentos
 *
 * Ações destrutivas (Sair / Excluir) reusam Auth.signOut e deleteUserAccount.
 */

import { Profile } from '../../features/profile.js';
import { Auth } from '../../core/auth.js';
import {
  getEffectivePlan,
  PLAN_CATALOG,
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
  PLAN_CODE_PRO,
} from '../../core/plans/subscriptionPlans.js';
import { fetchMyProfileBilling } from '../../core/plans/monetization.js';
import { goTo } from '../../core/router.js';
import { getState } from '../../core/state.js';
import { Toast } from '../../core/toast.js';
import { exportUserData, deleteUserAccount } from '../../features/userData.js';
import { ProfileModal } from '../components/onboarding.js';
import { PushOptInCard } from '../components/pushOptInCard.js';
import { USAGE_RESOURCE_WHATSAPP_SHARE, getMonthlyUsageSnapshot } from '../../core/usageLimits.js';
import { NAV_MODE_EMPRESA, getNavigationMode } from '../shell/navigationMode.js';

const VIEW_ID = 'view-conta';

/* ───────────────────────────── helpers ────────────────────────────── */

function _getInitials(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'U';
  return trimmed
    .split(/\s+/)
    .map((n) => n[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function _escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _formatDateBR(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function _equipmentCount() {
  try {
    const state = getState();
    return Array.isArray(state?.equipamentos) ? state.equipamentos.length : 0;
  } catch (_e) {
    return 0;
  }
}

function _currentMonthServiceCount(registros = []) {
  if (!Array.isArray(registros)) return 0;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return registros.filter((r) => {
    const d = new Date(r?.data || '');
    return !Number.isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
  }).length;
}

function _resolveClienteCount(state = {}) {
  const explicit = Array.isArray(state?.clientes) ? state.clientes.length : 0;
  if (explicit > 0) return explicit;
  const fromEquip = new Set(
    (state?.equipamentos || [])
      .map((e) => e?.clienteId)
      .filter((id) => typeof id === 'string' && id),
  );
  return fromEquip.size;
}

/* ───────────────────────────── ícones ─────────────────────────────── */

const ICON_CROWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z"/></svg>`;
const ICON_SPARK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></svg>`;
const ICON_CHECK_CIRCLE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>`;
const ICON_INFO = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>`;
const ICON_CALENDAR = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`;
const ICON_EXTERNAL = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M10 14L20 4"/><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>`;
const ICON_CHEV = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>`;
const ICON_USER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`;
const ICON_CARD = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>`;
const ICON_DOWNLOAD = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const ICON_LOGOUT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/></svg>`;
const ICON_TRASH = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m6 6 1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>`;
const ICON_MAIL = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`;
const ICON_SHIELD = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`;
const ICON_WRENCH = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 1.5-2-2 1.5-3z"/></svg>`;
const ICON_TOOLS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 1.5-2-2 1.5-3z"/><path d="M16 7l3-3"/><path d="M15 8l1 1"/></svg>`;
const ICON_FILE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;
const ICON_PACKAGE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4"/><path d="M12 11v10"/></svg>`;
const ICON_BUILDING = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h.01M9 13h.01M9 17h.01"/></svg>`;

/* ─────────────────────────── plan helpers ─────────────────────────── */

function _planBadgeIcon(planCode) {
  if (planCode === PLAN_CODE_PRO) return ICON_CROWN;
  if (planCode === PLAN_CODE_PLUS) return ICON_CHECK_CIRCLE;
  return ICON_SPARK;
}

function _planBadgeLabel(planCode, planLabel) {
  if (planCode === PLAN_CODE_FREE) return 'PLANO ATUAL';
  return `${planLabel.toUpperCase()} · ATIVO`;
}

function _planTagline(planCode, planData) {
  if (planCode === PLAN_CODE_FREE) {
    return 'Use o fluxo completo no gratuito. Faça upgrade quando precisar de escala.';
  }
  if (planCode === PLAN_CODE_PLUS) {
    return 'Seu plano está ativo e os recursos profissionais liberados.';
  }
  if (planCode === PLAN_CODE_PRO) {
    return 'Seu plano está ativo e com todos os recursos liberados.';
  }
  return planData?.accountTagline || '';
}

// 3 chips de destaque por plano. Reuso o accountChips do catálogo, mas
// adapto pra ficarem curtos e legíveis no card hero (max ~22 chars cada).
function _planFeatureChips(planCode) {
  if (planCode === PLAN_CODE_FREE) {
    return ['Até 3 equipamentos', 'PDF com marca d’água', 'Relatórios + WhatsApp'];
  }
  if (planCode === PLAN_CODE_PLUS) {
    return ['Até 15 equipamentos', 'PDF profissional', '60 envios WhatsApp/mês'];
  }
  return ['Equipamentos ilimitados', 'PMOC formal NBR 13971', 'Suporte prioritário'];
}

/* ───────────────────────── render: hero plano ─────────────────────── */

function _renderHeroPlan({ planCode, planData, billingProfile }) {
  const badgeLabel = _planBadgeLabel(planCode, planData.label);
  const tagline = _planTagline(planCode, planData);
  const isPaid = planCode !== PLAN_CODE_FREE;
  const chips = _planFeatureChips(planCode);

  // Equipment usage (Plus = barra real, Pro = ilimitado, Free = sobre limite)
  const count = _equipmentCount();
  const limit = planData.limits.equipamentos;
  const isUnlimited = !Number.isFinite(limit);
  const usageValueLabel = isUnlimited ? `${count} / ilimitado` : `${count} / ${limit}`;
  const usageScaleMarks = isUnlimited
    ? ['0', '50', 'Ilimitado']
    : ['0', String(Math.floor(limit / 2)), String(limit)];
  const percent = isUnlimited
    ? Math.min(100, Math.max(8, count * 4)) // visual só (4% por equip)
    : Math.min(100, Math.max(4, Math.round((count / limit) * 100)));

  // Renewal date (só pra planos pagos com data válida)
  const renewIso = isPaid ? billingProfile?.subscription_current_period_end : null;
  const renewBR = _formatDateBR(renewIso);
  const hasRenew = Boolean(renewBR);

  const chipsHtml = chips
    .map(
      (chip) => `
        <span class="conta-hero__chip">
          <span class="conta-hero__chip-ic" aria-hidden="true">${ICON_CHECK_CIRCLE}</span>
          ${chip}
        </span>`,
    )
    .join('');

  // Bottom cards: usage + renewal (somente quando paid). No Free, o slot
  // de renewal vira CTA de upgrade.
  const renewalCardHtml = hasRenew
    ? `
        <div class="conta-hero__stat conta-hero__stat--renew">
          <div class="conta-hero__stat-icon" aria-hidden="true">${ICON_CALENDAR}</div>
          <div class="conta-hero__stat-body">
            <div class="conta-hero__stat-label">Renovação em</div>
            <div class="conta-hero__stat-value conta-hero__stat-value--accent">${renewBR}</div>
            <div class="conta-hero__stat-foot">
              Cobrança automática ativada
              <span class="conta-hero__stat-foot-ic" aria-hidden="true">${ICON_CHECK_CIRCLE}</span>
            </div>
          </div>
        </div>`
    : isPaid
      ? ''
      : `
        <button type="button" class="conta-hero__upgrade-cta" data-conta-action="upgrade">
          <span aria-hidden="true">${ICON_CROWN}</span>
          <span>Conhecer planos pagos</span>
        </button>`;

  return `
    <section class="conta-hero conta-hero--${planCode}" aria-labelledby="conta-hero-title">
      <span class="conta-hero__orb conta-hero__orb--a" aria-hidden="true"></span>
      <span class="conta-hero__orb conta-hero__orb--b" aria-hidden="true"></span>

      <span class="conta-hero__crown-art" aria-hidden="true">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 130 L40 50 L80 90 L100 30 L120 90 L160 50 L180 130 Z"
            stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" fill="none" opacity="0.9"/>
          <circle cx="40" cy="50" r="3" fill="currentColor" opacity="0.95"/>
          <circle cx="100" cy="30" r="3.2" fill="currentColor" opacity="0.95"/>
          <circle cx="160" cy="50" r="3" fill="currentColor" opacity="0.95"/>
          <line x1="20" y1="138" x2="180" y2="138" stroke="currentColor" stroke-width="2" opacity="0.9"/>
          <circle cx="178" cy="22" r="1.6" fill="currentColor" opacity="0.85"/>
          <path d="M174 14 L178 18 M178 18 L182 22 M178 18 L174 22 M178 18 L182 14"
            stroke="currentColor" stroke-width="1" opacity="0.7"/>
        </svg>
      </span>

      <span class="conta-hero__plan-badge">
        <span class="conta-hero__plan-badge-ic" aria-hidden="true">${_planBadgeIcon(planCode)}</span>
        ${badgeLabel}
      </span>

      <h1 class="conta-hero__title" id="conta-hero-title">
        <span class="conta-hero__title-brand">CoolTrack</span>
        <span class="conta-hero__title-tier">${planData.label}</span>
      </h1>

      <p class="conta-hero__tagline">${tagline}</p>

      <div class="conta-hero__chips">${chipsHtml}</div>

      <div class="conta-hero__stats">
        <div class="conta-hero__stat conta-hero__stat--usage">
          <div class="conta-hero__stat-head">
            <span class="conta-hero__stat-label">
              Equipamentos cadastrados
              <span class="conta-hero__stat-info" aria-hidden="true" title="Quantos equipamentos você já cadastrou no app, dentro do limite do plano.">${ICON_INFO}</span>
            </span>
          </div>
          <div class="conta-hero__usage-value-line">
            <span class="conta-hero__usage-big">${count}</span>
            <span class="conta-hero__usage-frac">/ ${isUnlimited ? 'ilimitado' : limit}</span>
            <div class="conta-hero__usage-bar" aria-hidden="true">
              <div class="conta-hero__usage-fill" style="width:${percent}%"></div>
            </div>
          </div>
          <div class="conta-hero__usage-scale" aria-hidden="true">
            <span>${usageScaleMarks[0]}</span>
            <span>${usageScaleMarks[1]}</span>
            <span>${usageScaleMarks[2]}</span>
          </div>
          <span class="conta-hero__usage-sr" aria-live="polite">
            ${usageValueLabel}
          </span>
        </div>
        ${renewalCardHtml}
      </div>
    </section>`;
}

/* ─────────────────── render: identity card (avatar) ───────────────── */

function _renderIdentity({ name, email, role, planCode, mode }) {
  const initials = _getInitials(name);
  const safeName = _escapeHtml(name || 'Usuário');
  const safeRole = _escapeHtml(role || 'Técnico em Refrigeração');
  const safeEmail = _escapeHtml(email || '');
  const safePlanCode = _escapeHtml(String(planCode || '').toUpperCase());
  const subtitle =
    mode === NAV_MODE_EMPRESA || planCode === PLAN_CODE_PRO
      ? 'Operando com clientes'
      : 'Técnico em refrigeração';
  return `
    <section class="conta-identity" aria-label="Sua identidade">
      <div class="conta-identity__avatar" aria-hidden="true">${initials}</div>
      <div class="conta-identity__info">
        <div class="conta-identity__name-row">
          <span class="conta-identity__name">${safeName}</span>
          <span class="conta-hero__plan-badge conta-hero__plan-badge--inline">
            <span class="conta-hero__plan-badge-ic" aria-hidden="true">${_planBadgeIcon(planCode)}</span>
            ${safePlanCode}
          </span>
        </div>
        <div class="conta-identity__role">${safeRole}</div>
        <div class="conta-identity__sub">${subtitle}</div>
        <div class="conta-identity__email">
          <span class="conta-identity__email-ic" aria-hidden="true">${ICON_MAIL}</span>
          <span>${safeEmail}</span>
        </div>
      </div>
      <button type="button" class="conta-identity__pub" data-conta-action="edit-profile" aria-label="Editar perfil">
        <span>Editar perfil</span>
        <span aria-hidden="true">${ICON_EXTERNAL}</span>
      </button>
    </section>`;
}

function _renderUsageCard({
  planCode,
  serviceCount = 0,
  equipmentCount = 0,
  equipmentLimit = null,
  reportsSent = null,
  clientsCount = 0,
  pmocStatus = '',
}) {
  const isPro = planCode === PLAN_CODE_PRO;
  const reportMetric =
    typeof reportsSent === 'number'
      ? `<div class="conta-kpi"><strong>${reportsSent}</strong><span>Relatórios enviados</span></div>`
      : '';
  const clientsMetric = isPro
    ? `<div class="conta-kpi"><strong>${clientsCount}</strong><span>Clientes ativos</span></div>`
    : '';
  const limitLine =
    Number.isFinite(equipmentLimit) && !isPro
      ? `<p class="conta-usage__hint">Limite do plano: ${equipmentLimit} equipamentos.</p>`
      : '';
  const pmocLine = isPro
    ? `<p class="conta-usage__hint">${pmocStatus || 'PMOC sem dados ainda'}</p>`
    : '';
  return `
    <section class="conta-usage" aria-label="Seu uso este mês">
      <div class="conta-section__kicker">SEU USO ESTE MÊS</div>
      <div class="conta-usage__grid">
        <div class="conta-kpi"><strong>${serviceCount}</strong><span>Serviços</span></div>
        ${reportMetric}
        ${clientsMetric}
        <div class="conta-kpi"><strong>${equipmentCount}</strong><span>Equipamentos</span></div>
      </div>
      ${limitLine}
      ${pmocLine}
    </section>`;
}

function _renderPlanCard({ planCode }) {
  if (planCode === PLAN_CODE_PRO) {
    return `
      <section class="conta-plan-card" aria-label="Plano atual">
        <div class="conta-section__kicker">PLANO ATUAL</div>
        <h2>CoolTrack Pro</h2>
        <p>Clientes, setores, PMOC e operação completa liberados.</p>
        <ul>
          <li>clientes organizados</li><li>setores por local</li><li>equipamentos ilimitados</li>
          <li>PMOC formal</li><li>suporte prioritário</li>
        </ul>
        <button type="button" class="btn btn--outline btn--sm" data-conta-action="manage-plan">Gerenciar assinatura</button>
      </section>`;
  }
  if (planCode === PLAN_CODE_PLUS) {
    return `
      <section class="conta-plan-card" aria-label="Plano atual">
        <div class="conta-section__kicker">PLANO ATUAL</div>
        <h2>Plano Plus</h2>
        <p>Feito para técnico autônomo.</p>
        <ul>
          <li>até 15 equipamentos</li><li>relatórios profissionais</li><li>assinatura digital</li>
          <li>IA para cadastro por foto</li><li>envio via WhatsApp</li>
        </ul>
        <button type="button" class="btn btn--outline btn--sm" data-conta-action="upgrade">Ver Pro</button>
      </section>`;
  }
  return `
    <section class="conta-plan-card" aria-label="Plano atual">
      <div class="conta-section__kicker">PLANO ATUAL</div>
      <h2>Plano Gratuito</h2>
      <p>Você já consegue testar o fluxo básico.</p>
      <ul>
        <li>até 3 equipamentos</li><li>registros de serviço</li><li>relatório com marca d'água</li>
        <li>funciona offline</li>
      </ul>
      <button type="button" class="btn btn--primary btn--sm" data-conta-action="upgrade">Ver planos</button>
    </section>`;
}

function _renderQuickActions({ planCode }) {
  const items =
    planCode === PLAN_CODE_PRO
      ? [
          { icon: ICON_BUILDING, label: 'Clientes', action: 'go-clientes' },
          { icon: ICON_TOOLS, label: 'Gerar PMOC', action: 'go-pmoc' },
          { icon: ICON_FILE, label: 'Relatórios', action: 'go-relatorio' },
          { icon: ICON_WRENCH, label: 'Registrar serviço', action: 'go-registro' },
        ]
      : [
          { icon: ICON_WRENCH, label: 'Registrar serviço', action: 'go-registro' },
          { icon: ICON_PACKAGE, label: 'Ver equipamentos', action: 'go-equipamentos' },
          { icon: ICON_FILE, label: 'Ver relatórios', action: 'go-relatorio' },
          { icon: ICON_CARD, label: 'Ver planos', action: 'upgrade' },
        ];
  return `<section class="conta-quick" aria-label="Ações rápidas">
      <div class="conta-section__kicker">AÇÕES RÁPIDAS</div>
      <div class="conta-quick__grid">
        ${items
          .map(
            (
              item,
            ) => `<button type="button" class="conta-quick__btn" data-conta-action="${item.action}">
              <span aria-hidden="true">${item.icon}</span><span>${item.label}</span>
            </button>`,
          )
          .join('')}
      </div>
    </section>`;
}

/* ─────────────────────────── section cards ────────────────────────── */

/**
 * Cada section card = label kicker + 1 ou mais action rows.
 * row = { id, icon, title, sub, tone: 'neutral'|'danger', action: dataset action,
 *         iconTint: 'cyan'|'violet'|'teal'|'amber'|'red' }
 */
function _renderSection({ label, rows }) {
  return `
    <section class="conta-section" aria-label="${label}">
      <div class="conta-section__kicker">${label}</div>
      <div class="conta-section__rows">
        ${rows
          .map(
            (row) => `
            <button type="button" class="conta-row conta-row--${row.tone || 'neutral'}"
              id="${row.id}" data-conta-action="${row.action}">
              <span class="conta-row__icon conta-row__icon--${row.iconTint || 'cyan'}" aria-hidden="true">${row.icon}</span>
              <span class="conta-row__body">
                <span class="conta-row__title">${row.title}</span>
                <span class="conta-row__sub">${row.sub}</span>
              </span>
              <span class="conta-row__chev" aria-hidden="true">${ICON_CHEV}</span>
            </button>`,
          )
          .join('')}
      </div>
    </section>`;
}

function _renderAllSections({ planCode }) {
  const manageLabel = planCode === PLAN_CODE_FREE ? 'Conhecer planos' : 'Gerenciar assinatura';
  const manageSub =
    planCode === PLAN_CODE_FREE
      ? 'Veja todos os planos pagos e o que vem em cada um.'
      : 'Veja detalhes do plano, cobrança e métodos de pagamento.';

  const conta = _renderSection({
    label: 'CONTA',
    rows: [
      {
        id: 'conta-row-edit-profile',
        icon: ICON_USER,
        iconTint: 'cyan',
        title: 'Editar perfil',
        sub: 'Atualize suas informações pessoais e de contato.',
        action: 'conta-edit-profile',
        tone: 'neutral',
      },
    ],
  });

  const assinatura = _renderSection({
    label: 'ASSINATURA',
    rows: [
      {
        id: 'conta-row-manage',
        icon: ICON_CARD,
        iconTint: 'violet',
        title: manageLabel,
        sub: manageSub,
        action: 'conta-manage-plan',
        tone: 'neutral',
      },
    ],
  });

  const dados = _renderSection({
    label: 'DADOS',
    rows: [
      {
        id: 'conta-row-export',
        icon: ICON_DOWNLOAD,
        iconTint: 'teal',
        title: 'Exportar meus dados',
        sub: 'Baixe seus dados e relatórios gerados no CoolTrack.',
        action: 'conta-export-data',
        tone: 'neutral',
      },
      {
        id: 'conta-row-notification',
        icon: ICON_CHECK_CIRCLE,
        iconTint: 'violet',
        title: 'Notificações push',
        sub: 'Gerencie lembretes e alertas operacionais.',
        action: 'conta-notifications',
        tone: 'neutral',
      },
    ],
  });

  const risco = _renderSection({
    label: 'ZONA DE RISCO',
    rows: [
      {
        id: 'conta-row-signout',
        icon: ICON_LOGOUT,
        iconTint: 'amber',
        title: 'Sair da conta',
        sub: 'Encerre sua sessão neste dispositivo.',
        action: 'conta-signout',
        tone: 'danger-soft',
      },
      {
        id: 'conta-row-delete',
        icon: ICON_TRASH,
        iconTint: 'red',
        title: 'Excluir minha conta',
        sub: 'Ação permanente. Todos os seus dados serão apagados.',
        action: 'conta-delete-account',
        tone: 'danger',
      },
    ],
  });

  return `${conta}${assinatura}${dados}${risco}`;
}

/* ───────────────────────── footer LGPD ────────────────────────────── */

function _renderLgpdFooter() {
  return `
    <section class="conta-lgpd" aria-label="Privacidade e segurança">
      <div class="conta-lgpd__icon" aria-hidden="true">${ICON_SHIELD}</div>
      <div class="conta-lgpd__body">
        <div class="conta-lgpd__title">Seus dados estão seguros</div>
        <p class="conta-lgpd__desc">
          Utilizamos criptografia e seguimos a LGPD para proteger suas informações.
        </p>
      </div>
      <button type="button" class="conta-lgpd__cta" data-conta-action="open-privacy">
        Saiba mais
        <span aria-hidden="true">${ICON_CHEV}</span>
      </button>
    </section>`;
}

/* ───────────────────────── render principal ───────────────────────── */

function _renderShell(html) {
  const view = document.getElementById(VIEW_ID);
  if (!view) return;
  view.innerHTML = html;

  // Push opt-in card: renderiza no fim das seções (assíncrono — depende
  // de Notification.permission + getSubscription()).
  const pushHost = view.querySelector('.conta-sections');
  if (pushHost) {
    PushOptInCard.render(pushHost).catch((err) => {
      console.warn('[conta] PushOptInCard render falhou:', err);
    });
  }
}

function _renderLoading() {
  _renderShell(`
    <div class="conta-loading" role="status" aria-live="polite">
      <div class="conta-loading__shimmer"></div>
      <p class="conta-loading__text">Carregando sua conta…</p>
    </div>`);
}

let _bound = false;
function _bindOnce() {
  if (_bound) return;
  _bound = true;
  // Delegação local na própria view (idempotente). Usa data-action pra
  // fluxo unificado com o resto do app, mas com namespace 'conta-*' pra
  // não colidir.
  const view = document.getElementById(VIEW_ID);
  if (!view) return;
  view.addEventListener('click', async (event) => {
    const target = event.target.closest?.('[data-conta-action]');
    if (!target || !view.contains(target)) return;
    const action = target.getAttribute('data-conta-action');
    switch (action) {
      case 'edit-profile':
      case 'public-profile':
      case 'conta-edit-profile':
        ProfileModal.open();
        break;
      case 'manage-plan':
      case 'upgrade':
      case 'conta-manage-plan':
        goTo('pricing');
        break;
      case 'go-registro':
        goTo('registro');
        break;
      case 'go-equipamentos':
        goTo('equipamentos');
        break;
      case 'go-relatorio':
        goTo('relatorio');
        break;
      case 'go-clientes':
      case 'go-pmoc':
        goTo('clientes');
        break;
      case 'export-data':
      case 'conta-export-data':
        await _handleExport(target);
        break;
      case 'signout':
      case 'conta-signout':
        Auth.signOut();
        break;
      case 'delete-account':
      case 'conta-delete-account':
        _openDeleteDialog();
        break;
      case 'conta-notifications':
        Toast.info('Use o card de notificações abaixo para ajustar o push.');
        break;
      case 'open-privacy':
        goTo('privacidade');
        break;
      default:
        break;
    }
  });
}

async function _handleExport(btnEl) {
  const labelEl = btnEl.querySelector('.conta-row__title');
  const originalLabel = labelEl?.textContent;
  btnEl.classList.add('is-loading');
  if (labelEl) labelEl.textContent = 'Exportando…';
  try {
    const result = await exportUserData();
    if (result?.ok) {
      Toast.success('Download iniciado. Verifique sua pasta de downloads.');
    } else {
      Toast.error(result?.message || 'Não foi possível exportar os dados.');
    }
  } finally {
    btnEl.classList.remove('is-loading');
    if (labelEl && originalLabel) labelEl.textContent = originalLabel;
  }
}

/* ─────────────── delete confirmation dialog (dupla) ───────────────── */

const DELETE_CONFIRM_PHRASE = 'EXCLUIR MINHA CONTA';
const DELETE_DIALOG_ID = 'conta-delete-dialog';

function _openDeleteDialog() {
  document.getElementById(DELETE_DIALOG_ID)?.remove();
  const dialog = document.createElement('div');
  dialog.id = DELETE_DIALOG_ID;
  dialog.className = 'modal-overlay is-open conta-delete-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'conta-delete-title');
  dialog.dataset.blockingLayer = 'conta-delete';

  dialog.innerHTML = `
    <div class="conta-delete-dialog__backdrop" data-conta-action="close-delete" aria-hidden="true"></div>
    <div class="conta-delete-dialog__card" role="document">
      <h2 class="conta-delete-dialog__title" id="conta-delete-title">
        Excluir conta permanentemente?
      </h2>
      <p class="conta-delete-dialog__lead">
        Esta ação <strong>não pode ser desfeita</strong>. Todos os seus equipamentos,
        registros, fotos e assinaturas serão removidos imediatamente dos servidores.
      </p>
      <p class="conta-delete-dialog__hint">
        Se ainda não exportou seus dados, cancele e use <strong>"Exportar meus dados"</strong> antes.
      </p>
      <label class="conta-delete-dialog__label" for="conta-delete-input">
        Para confirmar, digite <code>${DELETE_CONFIRM_PHRASE}</code> abaixo:
      </label>
      <input type="text" id="conta-delete-input" class="conta-delete-dialog__input"
        autocomplete="off" autocapitalize="characters" spellcheck="false"
        placeholder="${DELETE_CONFIRM_PHRASE}" />
      <div class="conta-delete-dialog__actions">
        <button type="button" class="conta-delete-dialog__cancel"
          data-conta-action="close-delete">Cancelar</button>
        <button type="button" class="conta-delete-dialog__confirm"
          id="conta-delete-confirm" disabled>Excluir minha conta</button>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const input = dialog.querySelector('#conta-delete-input');
  const confirmBtn = dialog.querySelector('#conta-delete-confirm');

  input?.addEventListener('input', () => {
    if (confirmBtn) confirmBtn.disabled = input.value.trim() !== DELETE_CONFIRM_PHRASE;
  });

  const closeDialog = () => dialog.remove();

  dialog.addEventListener('click', (event) => {
    if (event.target.closest?.('[data-conta-action="close-delete"]')) {
      event.preventDefault();
      event.stopPropagation();
      closeDialog();
    }
  });

  confirmBtn?.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Excluindo…';
    const result = await deleteUserAccount();
    if (result?.ok) {
      closeDialog();
      Toast.success('Conta excluída com sucesso.');
      setTimeout(() => window.location.reload(), 500);
    } else {
      Toast.error(result?.message || 'Não foi possível excluir a conta.');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Excluir minha conta';
    }
  });

  setTimeout(() => input?.focus(), 50);
}

/* ─────────────────────────── entry point ──────────────────────────── */

export async function renderConta() {
  _renderLoading();

  // Resolve user + billing em paralelo. Se billing falhar (offline/erro),
  // segue com fallback do localProfile.
  let user = null;
  let billingProfile = null;
  try {
    user = await Auth.getUser();
  } catch (_e) {
    /* sem user — segue com profile local */
  }
  try {
    const result = await fetchMyProfileBilling();
    billingProfile = result?.profile || null;
  } catch (_e) {
    /* offline ou erro de rede — billingProfile fica null e usamos localProfile */
  }

  const localProfile = Profile.get() || {};
  const navMode = getNavigationMode();
  const state = getState() || {};
  const planSource = billingProfile || localProfile;
  const planCode = getEffectivePlan(planSource);
  const planData = PLAN_CATALOG[planCode] || PLAN_CATALOG[PLAN_CODE_FREE];
  const name = localProfile.nome || localProfile.empresa || 'Usuário';
  const role = localProfile.cargo || 'Técnico em Refrigeração';
  const email = user?.email || localProfile.email || '';
  const equipmentCount = Array.isArray(state?.equipamentos) ? state.equipamentos.length : 0;
  const serviceCount = _currentMonthServiceCount(state?.registros || []);
  const clientsCount = _resolveClienteCount(state);
  let reportsSent;
  try {
    const usage = await getMonthlyUsageSnapshot(user?.id || '');
    reportsSent =
      typeof usage?.[USAGE_RESOURCE_WHATSAPP_SHARE] === 'number'
        ? usage[USAGE_RESOURCE_WHATSAPP_SHARE]
        : null;
  } catch {
    reportsSent = undefined;
  }
  const pmocStatus =
    planCode === PLAN_CODE_PRO
      ? clientsCount > 0
        ? 'PMOC em acompanhamento'
        : 'PMOC sem dados ainda'
      : '';

  const html = `
    <div class="conta-page">
      ${_renderIdentity({ name, email, role, planCode, mode: navMode })}
      ${_renderUsageCard({
        planCode,
        serviceCount,
        equipmentCount,
        equipmentLimit: planData?.limits?.equipamentos,
        reportsSent,
        clientsCount,
        pmocStatus,
      })}
      ${_renderPlanCard({ planCode })}
      ${_renderQuickActions({ planCode })}
      <div class="conta-sections">
        ${_renderAllSections({ planCode })}
      </div>
      ${_renderLgpdFooter()}
    </div>`;

  _renderShell(html);
  _bindOnce();
}

// Plus-aware re-export pra possibilitar testes ou pre-carregamento.
export const __test__ = {
  _renderIdentity,
  _renderUsageCard,
  _renderPlanCard,
  _renderQuickActions,
  _renderAllSections,
  _renderLgpdFooter,
  _currentMonthServiceCount,
  _resolveClienteCount,
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
  PLAN_CODE_PRO,
};
