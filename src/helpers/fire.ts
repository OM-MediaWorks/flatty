export const fire = (hooks: Array<string>, eventTarget: EventTarget, detail: any) => {
  for (const hook of hooks) {
    eventTarget.dispatchEvent(new CustomEvent(hook, { detail }))
  }
}
