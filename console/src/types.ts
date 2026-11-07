// Shapes of the Airlock Cloud API. Type-only imports: nothing from the server contract (or zod) is bundled.
export type {
  ApiKeyInfo,
  ErrorBody,
  FailureReason,
  QuotaInfo,
  RequestLogEntry,
  RunDetail,
  RunStatus,
  RunSummary,
  StepResult,
  UsageInfo,
} from '../../cloud/shared/contract';

export interface Me {
  user: { id: string; email: string; name?: string | null };
  workspace: { id: string; name: string; plan: string; createdAt?: string; limits?: { dailyRuns?: number } };
}
