/**
 * Dados estaticos da secao "Planos" da nova landing React+Tailwind.
 *
 * Mantido em arquivo proprio (separado de `landingMockData.js`) porque:
 *  1. pricing tem schema distinto (toggle Mensal/Anual + planos + trust);
 *  2. evita inflar o ja grande `landingMockData.js`;
 *  3. facilita revisao independente de copy/precos pelo time de produto.
 *
 * Convencoes:
 *  - precos em string ("R$ 29") pra preservar formatacao pt-BR sem
 *    depender de Intl.NumberFormat (sem ts-jest, sem locale extra);
 *  - `featured: true` no plano Pro garante o destaque visual + badge
 *    "Mais popular";
 *  - `billingNote.annual.save` separa a parte "economize R$ X" pra
 *    receber tonalizacao cyan diferente do resto da nota;
 *  - a re-ordenacao mobile (Pro primeiro) e definida visualmente em
 *    `PricingSection.jsx` via mapping estatico de classes Tailwind
 *    (`PLAN_ORDER_CLASSES`), nao aqui — Tailwind nao detecta classes
 *    montadas dinamicamente em runtime.
 *
 * Nenhum dado aqui aciona checkout/Stripe/gateway — os CTAs delegam ao
 * mesmo callback do "Comecar agora" do hero/header (onStart).
 */

export const pricingToggle = {
  monthly: { id: 'monthly', label: 'Mensal' },
  annual: { id: 'annual', label: 'Anual', badge: '-17%' },
};

export const pricingDefaultBilling = 'monthly';

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para testar em um cliente real, sem compromisso.',
    price: { monthly: 'R$ 0', annual: 'R$ 0' },
    period: '/sempre',
    // Free nao tem nota de billing; para os 2 ciclos. `null` faz com
    // que a UI renderize um placeholder invisivel pra manter altura
    // consistente entre os cards (evita layout shift no toggle).
    billingNote: { monthly: null, annual: null },
    featuresLabel: 'Inclui',
    features: [
      { text: 'Até **3 equipamentos** cadastrados' },
      { text: 'Registros de serviço ilimitados' },
      { text: 'Histórico completo do equipamento' },
      { text: "Relatórios com marca d'água" },
      { text: '**5 envios** via WhatsApp/mês' },
      { text: 'Cadastro por foto (IA): 1 análise/mês' },
      { text: 'Fotos nos registros de serviço' },
      { text: 'Alertas de manutenção preventiva' },
      { text: 'Funciona offline' },
    ],
    cta: { label: 'Começar grátis', variant: 'secondary' },
    note: 'Sem cartão · Para sempre',
    featured: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'Pro técnico autônomo sem limitação chata no dia a dia.',
    price: { monthly: 'R$ 29', annual: 'R$ 24' },
    period: '/mês',
    billingNote: {
      monthly: null,
      annual: { text: 'Cobrado R$ 290/ano · ', save: 'economize R$ 58' },
    },
    featuresLabel: 'Tudo do Free, mais',
    features: [
      { text: 'Até **15 equipamentos** cadastrados' },
      { text: "Relatórios PDF profissionais **sem marca d'água**, ilimitados" },
      { text: '**60 envios** via WhatsApp/mês' },
      { text: 'Cadastro por foto (IA) — até **30 análises/mês**' },
      { text: 'Assinatura digital do cliente no PDF' },
      { text: 'Fotos dos equipamentos (até 3 por equipamento)' },
    ],
    cta: { label: 'Assinar Plus', variant: 'secondary' },
    note: 'Sem fidelidade · Cancele quando quiser',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Mais popular',
    tagline: 'Operação maior — hospital, prédio comercial, muitos clientes fixos.',
    price: { monthly: 'R$ 99', annual: 'R$ 82' },
    period: '/mês',
    billingNote: {
      monthly: null,
      annual: { text: 'Cobrado R$ 990/ano · ', save: 'economize R$ 198' },
    },
    featuresLabel: 'Tudo do Plus, mais',
    features: [
      { text: '**Equipamentos ilimitados**' },
      { text: '**PMOC formal anual** (NBR 13971) com termo de RT' },
      { text: 'PDFs ilimitados' },
      { text: 'WhatsApp ilimitado' },
      { text: 'Cadastro por foto (IA) — até **200 análises/mês**' },
      { text: 'Agrupamento por setores' },
      { text: 'Suporte prioritário' },
    ],
    cta: { label: 'Assinar Pro', variant: 'primary' },
    note: 'Sem fidelidade · Cancele quando quiser',
    featured: true,
  },
];

export const pricingTrust = [
  { id: 'fidelidade', label: 'Sem fidelidade', icon: 'shield' },
  { id: 'cancelamento', label: 'Cancele quando quiser', icon: 'check-circle' },
  { id: 'suporte', label: 'Suporte em português', icon: 'chat' },
];
