import { Database, dbMutex } from '../db.js';

let intervalId: NodeJS.Timeout | null = null;

export async function runHoldCleanup(): Promise<number> {
  const unlock = await dbMutex.acquire();
  try {
    return Database.releaseExpiredHolds();
  } finally {
    unlock();
  }
}

export function startExpirationWorker(intervalMs: number = 5000): void {
  if (intervalId) return;

  console.log(`[Worker] Started Ticket Reservation Expiration background worker (interval: ${intervalMs}ms)`);
  
  // Run once immediately
  runHoldCleanup().catch(console.error);

  intervalId = setInterval(() => {
    runHoldCleanup().catch((err) => {
      console.error('[Worker] Error during hold expiration sweep:', err);
    });
  }, intervalMs);
}

export function stopExpirationWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Worker] Stopped Ticket Reservation Expiration background worker');
  }
}
