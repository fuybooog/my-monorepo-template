export const isTargetOrParent = (target: any, leaf: any) => {
  let current = target
  while (current) {
    if (current === leaf) return true
    current = Object.getPrototypeOf(current)
  }
  return false
}
