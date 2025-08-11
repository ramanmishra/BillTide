import { z } from 'zod'

export const profileUpdateSchema = z.object({
    displayName: z.string().min(1).max(200).optional(),
    email: z.string().email(),
    avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
    bio: z.string().max(500).optional().or(z.literal('')),
})

export const passwordSchema = z.object({
    password: z.string().min(9),
})
