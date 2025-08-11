export interface SubscriptionInput {
    name: string
    amount: number
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily' | 'quarterly' | 'half-yearly'
    nextChargeDate: string // ISO date
    category?: string
    notes?: string
}
