import { apiClient } from "./client";
import type { ImportBatchResponse } from "@forevue/api-client";

export async function getImportBatch(importBatchId: string): Promise<ImportBatchResponse> {
  const { data } = await apiClient.get<ImportBatchResponse>(`/imports/${importBatchId}`);
  return data;
}
