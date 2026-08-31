import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type Timestamp,
  where,
} from 'firebase/firestore';
import {httpsCallable} from 'firebase/functions';

import {
  analysisResultSchema,
  analysisStatusSchema,
  createAnalysisResponseSchema,
  upsertCheckInResponseSchema,
  type AnalysisResult,
  type AnalysisStatus,
  type CreateAnalysisRequest,
  type CreateAnalysisResponse,
  type UpsertCheckInRequest,
  type UpsertCheckInResponse,
} from '@shared/contracts';
import {db, functions} from '@/lib/firebaseData';

export interface AnalysisRecord {
  id: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  createdAt?: Date;
  errorCode?: string;
}

const createAnalysisCallable = httpsCallable<CreateAnalysisRequest, CreateAnalysisResponse>(
  functions,
  'createAnalysis',
  {timeout: 120_000, limitedUseAppCheckTokens: true},
);
const deleteAnalysisCallable = httpsCallable<{analysisId: string}, {deleted: true}>(
  functions,
  'deleteAnalysis',
  {timeout: 30_000, limitedUseAppCheckTokens: true},
);
const deleteMyDataCallable = httpsCallable<Record<string, never>, {deleted: true}>(
  functions,
  'deleteMyData',
  {timeout: 120_000, limitedUseAppCheckTokens: true},
);
const upsertCheckInCallable = httpsCallable<UpsertCheckInRequest, UpsertCheckInResponse>(
  functions,
  'upsertCheckIn',
  {timeout: 30_000, limitedUseAppCheckTokens: true},
);

const inFlightAnalysisJobs = new Map<string, Promise<CreateAnalysisResponse>>();

export async function createAnalysisJob(
  request: CreateAnalysisRequest,
): Promise<CreateAnalysisResponse> {
  const existingJob = inFlightAnalysisJobs.get(request.idempotencyKey);
  if (existingJob) return existingJob;

  const job = createAnalysisCallable(request)
    .then((response) => createAnalysisResponseSchema.parse(response.data))
    .finally(() => inFlightAnalysisJobs.delete(request.idempotencyKey));
  inFlightAnalysisJobs.set(request.idempotencyKey, job);
  return job;
}

function parseAnalysisRecord(id: string, value: Record<string, unknown>): AnalysisRecord {
  const status = analysisStatusSchema.parse(value.status);
  const parsedResult = value.result ? analysisResultSchema.safeParse(value.result) : undefined;
  const timestamp = value.createdAt as Timestamp | undefined;
  const errorCode = typeof value.errorCode === 'string' ? value.errorCode : undefined;

  return {
    id,
    status,
    ...(parsedResult?.success ? {result: parsedResult.data} : {}),
    ...(timestamp?.toDate ? {createdAt: timestamp.toDate()} : {}),
    ...(errorCode ? {errorCode} : {}),
  };
}

export async function getAnalysisRecord(analysisId: string): Promise<AnalysisRecord | null> {
  const snapshot = await getDoc(doc(db, 'analyses', analysisId));
  if (!snapshot.exists()) return null;
  return parseAnalysisRecord(snapshot.id, snapshot.data());
}

export async function getAnalysisHistory(userId: string): Promise<AnalysisRecord[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20),
    ),
  );
  return snapshot.docs.map((item) => parseAnalysisRecord(item.id, item.data()));
}

export async function deleteAnalysisRecord(analysisId: string): Promise<void> {
  await deleteAnalysisCallable({analysisId});
}

export async function saveCheckIn(request: UpsertCheckInRequest): Promise<UpsertCheckInResponse> {
  const response = await upsertCheckInCallable(request);
  return upsertCheckInResponseSchema.parse(response.data);
}

export async function deleteCurrentUserData(): Promise<void> {
  await deleteMyDataCallable({});
}
