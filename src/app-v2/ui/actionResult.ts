export type AppV2ActionResult = string | null | Promise<string | null>;

export async function resolveAppV2ActionResult(
  result: AppV2ActionResult,
  fallbackMessage: string,
): Promise<string | null> {
  try {
    return await result;
  } catch (error) {
    return error instanceof Error ? error.message : fallbackMessage;
  }
}
