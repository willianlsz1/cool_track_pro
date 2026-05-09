import { test } from 'vitest';

import {
  buildCheckoutPendingPatch,
  buildInvoicePaidEntitlementPatch,
  resolveInvoicePaidTarget,
  shouldKeepActiveStatusOnCheckout,
} from '../../supabase/functions/stripe-webhook/entitlement.ts';

describe('stripe webhook entitlement hardening', () => {
  test('checkout.session.completed with pending payment only links billing ids', () => {
    const patch = buildCheckoutPendingPatch({
      customerId: 'cus_123',
      subscriptionId: 'sub_123',
    });

    expect(patch).toEqual({
      billing_provider: 'stripe',
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      subscription_status: 'pending',
    });
    expect(patch).not.toHaveProperty('plan');
    expect(patch).not.toHaveProperty('plan_code');
  });

  test('checkout.session.completed does not downgrade an already active profile to pending', () => {
    expect(shouldKeepActiveStatusOnCheckout('active')).toBe(true);
    expect(shouldKeepActiveStatusOnCheckout('pending')).toBe(false);
    expect(shouldKeepActiveStatusOnCheckout(null)).toBe(false);
  });

  test('invoice.paid with known price promotes entitlement to paid active plan', () => {
    const priceIdMap = new Map([['price_pro', 'pro']]);
    const patch = buildInvoicePaidEntitlementPatch({
      metadata: {},
      subscriptionItems: [{ price: { id: 'price_pro' } }],
      priceIdMap,
      customerId: 'cus_paid',
      subscriptionId: 'sub_paid',
    });

    expect(patch).toEqual({
      plan_code: 'pro',
      plan: 'pro',
      subscription_status: 'active',
      billing_provider: 'stripe',
      stripe_customer_id: 'cus_paid',
      stripe_subscription_id: 'sub_paid',
    });
  });

  test('invoice.paid with unknown price fails closed', () => {
    expect(() =>
      buildInvoicePaidEntitlementPatch({
        metadata: {},
        subscriptionItems: [{ price: { id: 'price_unknown' } }],
        priceIdMap: new Map([['price_pro', 'pro']]),
        customerId: 'cus_paid',
        subscriptionId: 'sub_paid',
      }),
    ).toThrow('UNRESOLVED_INVOICE_PAID_PLAN:sub_paid');
  });

  test('invoice.paid can resolve target user from subscription metadata when checkout event is late', () => {
    expect(
      resolveInvoicePaidTarget({
        subscriptionId: 'sub_paid',
        subscriptionMetadata: { supabase_user_id: 'user-1' },
      }),
    ).toEqual({ kind: 'user_id', value: 'user-1' });

    expect(
      resolveInvoicePaidTarget({
        subscriptionId: 'sub_paid',
        subscriptionMetadata: {},
      }),
    ).toEqual({ kind: 'subscription_id', value: 'sub_paid' });
  });
});
