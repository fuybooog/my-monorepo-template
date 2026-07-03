export const isTargetOrParent = (target: any, leaf: any) => {
  // return target === leaf ||  target.isPrototypeOf(leaf)
  return target === leaf || Object.prototype.isPrototypeOf.call(target, leaf)
}
