// lib/db/schema.ts
import { pgTable, varchar, numeric, timestamp, text, jsonb } from 'drizzle-orm/pg-core'

export const subscriptions = pgTable('subscriptions', {
    id: varchar('id', { length: 36 }).primaryKey(),           // crypto.randomUUID()
    ownerId: varchar('owner_id', { length: 120 }).notNull(),   // from token (client_id)
    name: varchar('name', { length: 200 }).notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    billingCycle: varchar('billing_cycle', { length: 50 }).notNull(), // 'monthly' | 'yearly'
    nextChargeDate: varchar('next_charge_date', { length: 30 }).notNull(), // ISO string
    category: varchar('category', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const users = pgTable('users', {
    ownerId: varchar('owner_id', { length: 120 }).primaryKey(),         // username / client_id
    email: varchar('email', { length: 320 }).notNull(),
    displayName: varchar('display_name', { length: 200 }),
    preferences: jsonb('preferences').$type<{
        defaultCurrency?: string
        totalsView?: 'monthly' | 'yearly'
        remindersEnabled?: boolean
        reminderDays?: number
    }>().default({}),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    bio: text('bio'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})