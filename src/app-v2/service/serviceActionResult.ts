export type ServiceActionResult = string | null | Promise<string | null>;

export async function resolveServiceActionResult(
  result: ServiceActionResult,
  fallbackMessage: string,
): Promise<string | null> {
  try {
    return await result;
  } catch (error) {
    return error instanceof Error ? error.message : fallbackMessage;
  }
}
