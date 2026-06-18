export function transPaginateParams<T extends Record<string, unknown>>(
  params: T
): Omit<T, 'current'> & { page: number } {
  const { current = 1, ...others } = params;
  return {
    ...others,
    page: current,
  } as unknown as Omit<T, 'current'> & { page: number };
}