import { createEventStream, defineEventHandler } from 'h3'
import { registerSSEClient, unregisterSSEClient } from '../../utils/broadcaster'

export default defineEventHandler((event) => {
  const eventStream = createEventStream(event)

  const pushFn = (data: { data: string }) => {
    eventStream.push(data.data).catch(() => {})
  }

  registerSSEClient(pushFn)

  eventStream.onClosed(() => {
    unregisterSSEClient(pushFn)
  })

  return eventStream.send()
})
