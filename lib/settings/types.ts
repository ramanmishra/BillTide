export interface UserSettings {
    email: string
    displayName?: string
    preferences: {
        defaultCurrency?: string
        totalsView?: 'monthly' | 'yearly'
        remindersEnabled?: boolean
        reminderDays?: number
    }
}
