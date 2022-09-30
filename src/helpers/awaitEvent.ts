export const awaitEvent = (target: EventTarget, eventName: string, conditionCallback?: (event: any) => boolean): Promise<CustomEvent> => {
  return new Promise((resolve) => {
    target.addEventListener(eventName, (event) => {
      if (conditionCallback) {
        const shouldResolve = conditionCallback(event)
        if (shouldResolve)       
          resolve(event as CustomEvent)
      }
      else {
        resolve(event as CustomEvent)
      }
    })
  })
}