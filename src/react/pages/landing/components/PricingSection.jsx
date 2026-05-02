import { useState } from 'react';
import {
  pricingPlans,
  pricingToggle,
  pricingDefaultBilling,
  pricingTrust,
} from '../data/pricingData.js';
import { SectionHead } from './SegmentSection.jsx';

/**
 * Secao "Planos" — fundo navy/deep blue com radial gradients sutis,
 * grid discreto de fundo, 3 cards escuros premium e toggle Mensal/Anual.
 *
 * Pricing v3: derivada do mockup `Pricing v2.html` mas SEM icones
 * decorativos no topo dos cards — o preco virou o titulo visual real
 * de cada plano. Nome do plano fica como eyebrow uppercase em cyan,
 * consistente com o eyebrow "PLANOS" do `SectionHead`.
 *
 * Conversao para React + Tailwind:
 *  - sem CSS puro copiado;
 *  - sem HTML estatico em string;
 *  - utility-first com prefixo `tw-`;
 *  - componentes reutilizaveis (`PricingCard`, `BillingToggle`,
 *    `CheckBullet`, `TrustItem`);
 *  - paleta `landing.*` do tailwind.config.cjs sempre que possivel.
 *
 * Interatividade:
 *  - State local `billing` (default Mensal). Toggle real com `<button>` e
 *    `aria-pressed` pra acessibilidade.
 *  - Trocar pra Anual altera os precos exibidos nos cards Plus e Pro
 *    (Free permanece R$ 0) e exibe a "billingNote" com economia.
 *
 * Mobile decision:
 *  - O mockup mostra Pro PRIMEIRO no mobile (puxando atencao pro plano
 *    recomendado). Implementado via Tailwind `tw-order-N` /
 *    `lg:tw-order-N` — DOM order continua [Free, Plus, Pro] (o que
 *    preserva tab order/leitura semantica) e so o visual reordena.
 *
 * CTAs:
 *  - Todos os botoes "Começar grátis" / "Assinar Plus" / "Assinar Pro"
 *    chamam o mesmo `onStart` injetado pela LandingPage — i.e., o mesmo
 *    callback do "Começar agora" do hero/header.
 *  - Sem checkout, sem Stripe, sem nova rota, sem nova aba.
 */
export function PricingSection({ onStart }) {
  const [billing, setBilling] = useState(pricingDefaultBilling);

  return (
    <section
      id="planos"
      className="tw-relative tw-py-16 sm:tw-py-20 lg:tw-py-24 tw-text-white tw-overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 900px 500px at 50% -100px, rgba(59,130,246,0.18) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 50% 100%, rgba(64,196,255,0.06) 0%, transparent 70%), linear-gradient(180deg, #031B4E 0%, #02143b 100%)',
      }}
    >
      {/* Grid discreto de fundo, mascarado em elipse central pra fade
          natural nas bordas (replicando o ::after do mockup HTML). */}
      <div
        className="tw-absolute tw-inset-0 tw-pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 70%)',
        }}
      />

      <div className="tw-relative tw-max-w-[1200px] tw-mx-auto tw-px-6">
        <SectionHead
          dark
          eyebrow="Planos"
          title="Planos para cada fase da sua operação."
          description="Comece grátis e evolua conforme sua rotina cresce no atendimento, controle e geração de relatórios."
        />

        <BillingToggle billing={billing} onChange={setBilling} />

        {/* Grid: mobile 1col, tablet 1col, desktop 3col.
            Mobile re-ordena via tw-order pra Pro aparecer primeiro. */}
        <div
          role="list"
          aria-label="Planos disponíveis"
          className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-5 lg:tw-gap-6 tw-max-w-[1140px] tw-mx-auto"
        >
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} onCtaClick={onStart} />
          ))}
        </div>

        {/* Linha de confiança abaixo dos cards. */}
        <ul className="tw-mt-14 tw-mx-auto tw-max-w-[700px] tw-flex tw-flex-wrap tw-justify-center tw-gap-x-7 tw-gap-y-3 tw-list-none tw-p-0 tw-m-0 tw-text-[#a8bcd9]">
          {pricingTrust.map((item) => (
            <TrustItem key={item.id} icon={item.icon} label={item.label} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Toggle Mensal/Anual — pill com 2 botoes reais (sem div clicavel).
 * `aria-pressed` reflete o estado ativo. Ambos botoes ficam visiveis
 * e acionaveis por teclado (Tab + Enter/Space).
 */
function BillingToggle({ billing, onChange }) {
  return (
    <div className="tw-flex tw-justify-center tw-mt-3 tw-mb-12 sm:tw-mb-14">
      <div
        role="group"
        aria-label="Periodicidade de cobrança"
        className="tw-inline-flex tw-items-center tw-gap-1 tw-p-1.5 tw-rounded-full"
        style={{
          background: 'rgba(8,24,60,0.6)',
          border: '1px solid rgba(96,165,250,0.18)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ToggleButton
          id={pricingToggle.monthly.id}
          label={pricingToggle.monthly.label}
          active={billing === pricingToggle.monthly.id}
          onClick={() => onChange(pricingToggle.monthly.id)}
        />
        <ToggleButton
          id={pricingToggle.annual.id}
          label={pricingToggle.annual.label}
          badge={pricingToggle.annual.badge}
          active={billing === pricingToggle.annual.id}
          onClick={() => onChange(pricingToggle.annual.id)}
        />
      </div>
    </div>
  );
}

function ToggleButton({ id, label, badge, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-billing={id}
      className="tw-inline-flex tw-items-center tw-gap-2 tw-px-5 sm:tw-px-6 tw-py-2.5 tw-rounded-full tw-text-sm tw-font-medium tw-border-0 tw-cursor-pointer tw-transition-all focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-landing-cyan"
      style={
        active
          ? {
              background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
              color: '#fff',
              boxShadow:
                '0 6px 18px -4px rgba(0,109,255,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
              fontWeight: 600,
            }
          : {
              background: 'transparent',
              color: '#94a8c8',
            }
      }
    >
      {label}
      {badge ? (
        <span
          className="tw-text-[11px] tw-font-bold tw-tracking-[0.02em] tw-px-2 tw-py-0.5 tw-rounded-full"
          style={
            active
              ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
              : { background: 'rgba(64,196,255,0.18)', color: '#bfe6ff' }
          }
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Mapeamento estatico das classes de ordem visual por plan.id.
 *
 * IMPORTANTE: Tailwind purge so detecta classes presentes como string
 * literal no fonte. Construir `tw-order-${n}` dinamicamente NAO gera
 * o CSS — por isso o mapping abaixo usa strings completas.
 *
 * Resultado:
 *  - mobile (default): Pro=1 → Plus=2 → Free=3 (Pro primeiro, conforme
 *    mockup);
 *  - desktop (lg): Free=1 → Plus=2 → Pro=3 (ordem natural, esquerda
 *    para direita).
 */
const PLAN_ORDER_CLASSES = {
  free: 'tw-order-3 lg:tw-order-1',
  plus: 'tw-order-2 lg:tw-order-2',
  pro: 'tw-order-1 lg:tw-order-3',
};

/**
 * Card de plano. Renderiza preco/note conforme `billing` ativo.
 *
 * `featured: true` aplica glow azul, badge "Mais popular", CTA primary
 * e — apenas no desktop — um lift de -3px que diferencia o Pro
 * fisicamente sem precisar de icone decorativo.
 *
 * Ordem do topo (Pricing v3, sem icones decorativos):
 *  1. eyebrow uppercase com nome do plano (FREE / PLUS / PRO);
 *  2. preco + sufixo de periodo;
 *  3. nota de cobranca anual (placeholder transparente quando Mensal);
 *  4. descricao curta (tagline).
 *
 * Texto literal "Free / Plus / Pro" no JSX (vem de `plan.name`); o
 * uppercase visual e feito por CSS (`tw-uppercase`), o que preserva
 * o textContent original — testes que checam `.toContain('Free')`
 * continuam passando.
 */
function PricingCard({ plan, billing, onCtaClick }) {
  const price = plan.price[billing];
  const note = plan.billingNote?.[billing] ?? null;

  // Mobile re-order via Tailwind utilities. CSS `order` so altera o
  // visual — DOM order continua [Free, Plus, Pro], o que preserva
  // tab/leitura semantica.
  const orderClass = PLAN_ORDER_CLASSES[plan.id] ?? '';

  // Lift fisico do Pro no desktop (-3px). No mobile NAO aplicamos
  // (poderia desalinhar o empilhamento + a faixa do badge "Mais
  // popular"). Classe estatica como string literal pra Tailwind purge
  // detectar.
  const liftClass = plan.featured ? 'lg:-tw-translate-y-[3px]' : '';

  return (
    <article
      role="listitem"
      data-plan={plan.id}
      className={`${orderClass} ${liftClass} tw-relative tw-rounded-[18px] tw-px-7 tw-pt-9 tw-pb-7 sm:tw-px-8 sm:tw-pt-10 sm:tw-pb-8 tw-flex tw-flex-col tw-transition-transform`}
      style={{
        background: plan.featured
          ? 'linear-gradient(180deg, rgba(30,64,140,0.94) 0%, rgba(16,42,94,0.94) 100%)'
          : 'linear-gradient(180deg, rgba(16,42,94,0.85) 0%, rgba(13,34,77,0.85) 100%)',
        border: plan.featured
          ? '1px solid rgba(59,130,246,0.65)'
          : '1px solid rgba(96,165,250,0.16)',
        // Featured: halo azul mais denso + glow externo mais aberto +
        // inset highlight um pouco mais visivel — compensa a remocao
        // do icone decorativo sem inventar elemento novo.
        boxShadow: plan.featured
          ? '0 0 0 1px rgba(59,130,246,0.32), 0 28px 72px -16px rgba(59,130,246,0.42), inset 0 1px 0 rgba(96,165,250,0.22)'
          : 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      {plan.badge ? (
        <span
          data-plan-badge
          className="tw-absolute tw-top-0 tw-left-1/2 tw-text-[11px] tw-font-bold tw-tracking-[0.14em] tw-uppercase tw-text-white tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3.5 tw-h-[26px] tw-rounded-full"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
            boxShadow: '0 8px 22px -6px rgba(0,109,255,0.65)',
          }}
        >
          <span
            aria-hidden="true"
            className="tw-w-[5px] tw-h-[5px] tw-rounded-full"
            style={{ background: '#40C4FF', boxShadow: '0 0 8px #40C4FF' }}
          />
          {plan.badge}
        </span>
      ) : null}

      {/* 1. Nome do plano como eyebrow uppercase. Substitui o h3 22px
          anterior por um label tipografico pequeno + tracking aberto:
          isso libera o preco para ser o titulo visual real do card. */}
      <span
        data-plan-name
        className="tw-block tw-text-[12px] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-landing-cyan"
      >
        {plan.name}
      </span>
      {/* 2. Preco + periodo. Recua 10px do eyebrow. */}
      <div className="tw-mt-2.5 tw-flex tw-items-baseline tw-gap-1.5">
        <span
          data-price
          className="tw-text-[44px] sm:tw-text-[46px] tw-font-bold tw-tracking-[-0.03em] tw-text-white tw-leading-none"
        >
          {price}
        </span>
        <span className="tw-text-sm tw-font-medium tw-text-[#a8bcd9]">{plan.period}</span>
      </div>

      {/* Billing note: sempre ocupa altura pra evitar layout shift entre
          Mensal (vazio) e Anual (texto). Fica colado ao preco porque
          contextualiza o valor anual. */}
      <p
        data-billing-note
        className="tw-text-[12.5px] tw-leading-[18px] tw-mt-2 tw-h-[18px] tw-font-medium tw-m-0"
        style={{ color: note ? '#7dc8ff' : 'transparent' }}
      >
        {note ? (
          <>
            {note.text}
            <span className="tw-font-semibold" style={{ color: '#bfe6ff' }}>
              {note.save}
            </span>
          </>
        ) : (
          /* placeholder invisivel pra preservar altura */
          ' '
        )}
      </p>

      {/* 3. Descricao curta (tagline). Vem DEPOIS do preco — justifica
          o valor pra um persona especifico. min-height mantem cards
          alinhados quando taglines tem comprimentos diferentes. */}
      <p className="tw-text-[13px] tw-leading-[1.5] tw-text-[#a8bcd9] tw-mt-3 tw-mb-6 sm:tw-min-h-[42px]">
        {plan.tagline}
      </p>

      <div
        className="tw-h-px tw-mb-5"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.16), transparent)',
        }}
      />

      <p className="tw-text-[11px] tw-font-bold tw-tracking-[0.14em] tw-uppercase tw-text-[#6b80a3] tw-mt-0 tw-mb-4">
        {plan.featuresLabel}
      </p>

      <ul className="tw-list-none tw-p-0 tw-m-0 tw-flex tw-flex-col tw-gap-3 tw-mb-7">
        {plan.features.map((f, idx) => (
          <li
            key={`${plan.id}-f-${idx}`}
            className="tw-flex tw-items-start tw-gap-3 tw-text-sm tw-leading-[1.5] tw-text-[#d6e2f5]"
          >
            <CheckBullet featured={plan.featured} />
            <span>{renderFeatureText(f.text)}</span>
          </li>
        ))}
      </ul>

      <div className="tw-mt-auto">
        <button
          type="button"
          onClick={onCtaClick}
          data-plan-cta={plan.id}
          className={
            'tw-w-full tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-3.5 tw-rounded-xl tw-text-[14.5px] tw-font-semibold tw-cursor-pointer tw-transition-all focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-landing-cyan ' +
            (plan.cta.variant === 'primary'
              ? 'tw-text-white tw-border-0 hover:-tw-translate-y-px'
              : 'tw-text-white hover:-tw-translate-y-px')
          }
          style={
            plan.cta.variant === 'primary'
              ? {
                  background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
                  boxShadow:
                    '0 10px 24px -8px rgba(0,109,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(96,165,250,0.28)',
                }
          }
        >
          {plan.cta.label}
          <ArrowIcon size={14} />
        </button>
        <p className="tw-text-center tw-text-[12px] tw-text-[#6b80a3] tw-mt-3.5 tw-mb-0">
          {plan.note}
        </p>
      </div>
    </article>
  );
}

/**
 * Render simples de markdown-light: troca trechos `**bold**` por
 * `<strong>`. Evita dependencia de biblioteca de markdown e mantem o
 * tipo de destaque presente no mockup ("Até **15 equipamentos**").
 */
function renderFeatureText(text) {
  if (!text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="tw-font-semibold tw-text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function CheckBullet({ featured }) {
  return (
    <span
      aria-hidden="true"
      className="tw-flex-none tw-w-[18px] tw-h-[18px] tw-mt-0.5 tw-rounded-full tw-grid tw-place-items-center"
      style={
        featured
          ? {
              background: 'linear-gradient(180deg, #1a82ff 0%, #006DFF 100%)',
              color: '#fff',
            }
          : {
              background: 'rgba(59,130,246,0.18)',
              color: '#7dc8ff',
            }
      }
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8.5L6.5 12L13 4.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ArrowIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrustItem({ icon, label }) {
  return (
    <li className="tw-inline-flex tw-items-center tw-gap-2 tw-text-[13.5px] tw-font-medium">
      <TrustIcon icon={icon} />
      {label}
    </li>
  );
}

function TrustIcon({ icon }) {
  const stroke = '#7dc8ff';
  if (icon === 'shield') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
      </svg>
    );
  }
  if (icon === 'check-circle') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  // chat
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default PricingSection;
