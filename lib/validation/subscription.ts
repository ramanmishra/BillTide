import { z } from 'zod'

export const subscriptionSchema = z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string().length(3).toUpperCase(),
    billingCycle: z.enum(['monthly', 'yearly', 'quarterly', 'daily', 'half-yearly', 'weekly']),
    nextChargeDate: z.string().refine(
        (v) => !Number.isNaN(Date.parse(v)),
        { message: 'Invalid date' }
    ),
    category: z.string().optional(),
    notes: z.string().max(500).optional(),
})

export type SubscriptionPayload = z.infer<typeof subscriptionSchema>
