type PlanCode = 'plus' | 'pro';

const PLAN_VARIANTS: Record<string, PlanCode> = {
  plus: 'plus',
  plus_annual: 'plus',
  pro: 'pro',
  pro_annual: 'pro',
};

export function normalizeMetadataPlan(raw: unknown): PlanCode | null {
  const lower = String(raw || '').toLowerCase();
  return PLAN_VARIANTS[lower] ?? null;
}

export function resolvePlanFromEvent(params: {
  metadata: Record<string, unknown> | null | undefined;
  subscriptionItems?: Array<{ price?: { id?: string | null } | null }> | null;
  priceIdMap: Map<string, PlanCode>;
}): PlanCode | null {
  const fromMeta =
    normalizeMetadataPlan(params.metadata?.resolved_plan) ??
    normalizeMetadataPlan(params.metadata?.requested_plan);
  if (fromMeta) return fromMeta;

  for (const item of params.subscriptionItems ?? []) {
    const priceId = item?.price?.id;
    if (priceId && params.priceIdMap.has(priceId)) {
      return params.priceIdMap.get(priceId) ?? null;
    }
  }

  return null;
}

export function buildCheckoutPendingPatch(params: {
  customerId: string | null;
  subscriptionId: string | null;
}) {
  return {
    billing_provider: 'stripe',
    stripe_customer_id: params.customerId,
    stripe_subscription_id: params.subscriptionId,
    subscription_status: 'pending',
  };
}

export function shouldKeepActiveStatusOnCheckout(currentStatus: unknown): boolean {
  return currentStatus === 'active';
}

export function buildInvoicePaidEntitlementPatch(params: {
  metadata: Record<string, unknown> | null | undefined;
  subscriptionItems?: Array<{ price?: { id?: string | null } | null }> | null;
  priceIdMap: Map<string, PlanCode>;
  customerId: string | null;
  subscriptionId: string;
}) {
  const resolvedPlan = resolvePlanFromEvent(params);
  if (!resolvedPlan) {
    throw new Error(`UNRESOLVED_INVOICE_PAID_PLAN:${params.subscriptionId}`);
  }

  return {
    plan_code: resolvedPlan,
    plan: resolvedPlan,
    subscription_status: 'active',
    billing_provider: 'stripe',
    stripe_customer_id: params.customerId,
    stripe_subscription_id: params.subscriptionId,
  };
}

export function resolveInvoicePaidTarget(params: {
  subscriptionId: string;
  subscriptionMetadata: Record<string, unknown> | null | undefined;
}): { kind: 'user_id' | 'subscription_id'; value: string } {
  const userId = params.subscriptionMetadata?.supabase_user_id;
  if (typeof userId === 'string' && userId.trim()) {
    return { kind: 'user_id', value: userId.trim() };
  }

  return { kind: 'subscription_id', value: params.subscriptionId };
}
