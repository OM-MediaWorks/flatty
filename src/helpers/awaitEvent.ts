export const awaitEvent = (target: EventTarget, eventName: string): Promise<CustomEvent> => {
  return new Promise((resolve) => {
    target.addEventListener(eventName, (event) => {
      resolve(event as CustomEvent)
    })
  })
}