'use client';

import { CreditCard, Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    users: '5 seats',
    features: ['Lead management', 'Basic scoring', 'Email sequences', 'Pipeline view', 'Basic analytics'],
  },
  {
    name: 'Professional',
    price: '$79',
    users: '15 seats',
    features: ['Everything in Starter', 'AI lead scoring', 'Workflow automation', 'Advanced analytics', 'API access', 'Integrations'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    users: 'Unlimited',
    features: ['Everything in Professional', 'Predictive AI', 'Dedicated support', 'Custom integrations', 'SSO/SAML', 'SLA guarantee'],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Billing</h1>
        <p className="text-surface-500 mt-1">Manage your subscription plan</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`card relative ${plan.popular ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-surface-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-surface-900 mt-2">{plan.price}<span className="text-base font-normal text-surface-400">/mo</span></p>
              <p className="text-sm text-surface-500 mt-1">{plan.users}</p>
            </div>
            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full mt-6 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
              {plan.popular ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
