import { createEventStream, defineEventHandler } from 'h3'
import { registerSSEClient, unregisterSSEClient } from '../../utils/broadcaster'

export default defineEventHandler((event) => {
  const eventStream = createEventStream(event)

  const pushFn = (payload: any) => {
    eventStream.push({
      event: 'update',
      data: JSON.stringify(payload)
    }).catch(() => {})
  }

  registerSSEClient(pushFn)

  eventStream.onClosed(() => {
    unregisterSSEClient(pushFn)
  })

  return eventStream.send()
})
