import { z } from 'zod'

export const settingsSchema = z.object({
    email: z.string().email(),
    displayName: z.string().min(1).max(200).optional(),
    preferences: z.object({
        defaultCurrency: z.string().length(3).toUpperCase().optional(),
        totalsView: z.enum(['monthly', 'yearly']).optional(),
        remindersEnabled: z.boolean().optional(),
        reminderDays: z.number().int().min(1).max(60).optional(),
    }),
})

export type SettingsPayload = z.infer<typeof settingsSchema>
