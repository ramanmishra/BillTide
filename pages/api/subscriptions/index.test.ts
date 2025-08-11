import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/middleware/withSession', () => ({
  withSession: (handler: any) => handler,
}))

vi.mock('../../../lib/db/client', () => ({
  db: {},
}))

const handler = (await import('./index')).default

function createRes() {
  const res: any = {}
  res.status = vi.fn().mockImplementation(function (code: number) {
    res.statusCode = code
    return res
  })
  res.json = vi.fn().mockImplementation(function (data: any) {
    res.body = data
    return res
  })
  return res
}

describe('subscriptions API method handling', () => {
  ;['OPTIONS', 'PUT', 'DELETE'].forEach((method) => {
    it(`returns 405 for ${method}`, async () => {
      const req: any = { method, user: { client_id: 'test-user' } }
      const res = createRes()
      await handler(req, res)
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })
})
