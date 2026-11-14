/**
 * Thin compatibility layer. The real engine now lives in
 * llmService.ts (multi-provider failover). Exports keep the
 * same names worksheetService already imports.
 */
import {
  LlmError,
  LlmRequest,
  LlmQuestion,
  llmGenerate,
} from "./llmService";

export { LlmError as GeminiError };

export function generateQuestions(
  request: LlmRequest
): Promise<LlmQuestion[]> {
  return llmGenerate(request);
}
