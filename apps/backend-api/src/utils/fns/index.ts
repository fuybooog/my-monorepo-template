export const isTargetOrParent = (target: any, child: any) => {
  return target === child || Object.prototype.isPrototypeOf.call(target, child)
}
