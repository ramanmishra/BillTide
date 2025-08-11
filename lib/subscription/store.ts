// TEMP in-memory store; replace with DB later (Prisma/Drizzle)
type OwnerId = string
type Subscription = { id: string } & import('../../types/subscription').SubscriptionInput

const store = new Map<OwnerId, Subscription[]>()

export function addSubscription(ownerId: OwnerId, sub: Subscription) {
    const list = store.get(ownerId) ?? []
    list.push(sub)
    store.set(ownerId, list)
    return sub
}

export function listSubscriptions(ownerId: OwnerId) {
    return store.get(ownerId) ?? []
}
