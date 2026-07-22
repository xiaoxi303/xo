type SSEPushFn = (data: { data: string }) => void
const sseClients = new Set<SSEPushFn>()

export function registerSSEClient(pushFn: SSEPushFn) {
  sseClients.add(pushFn)
}

export function unregisterSSEClient(pushFn: SSEPushFn) {
  sseClients.delete(pushFn)
}

export function broadcastAnalyticsChange() {
  const payload = JSON.stringify({ type: 'analytics_update', ts: Date.now() })
  for (const pushFn of Array.from(sseClients)) {
    try {
      pushFn({ data: payload })
    } catch {
      sseClients.delete(pushFn)
    }
  }
}
