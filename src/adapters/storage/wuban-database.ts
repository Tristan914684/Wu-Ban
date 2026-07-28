export const DATABASE_NAME = "wuban-local-v1";
export const DATABASE_VERSION = 2;
export const SESSION_STORE_NAME = "session-summaries";
export const GRANT_STORE_NAME = "supporter-grants";
export const SEND_AUDIT_STORE_NAME = "check-in-send-audits";

function ensureStore(
  database: IDBDatabase,
  name: string,
  options: IDBObjectStoreParameters,
): void {
  if (!database.objectStoreNames.contains(name)) {
    database.createObjectStore(name, options);
  }
}

export function openWubanDatabase(
  onVersionChange: () => void = () => {},
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let openingFailed = false;
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      ensureStore(database, SESSION_STORE_NAME, { keyPath: "sessionId" });
      ensureStore(database, GRANT_STORE_NAME, { keyPath: "grantId" });
      ensureStore(database, SEND_AUDIT_STORE_NAME, {
        keyPath: "commandId",
      });
    });
    request.addEventListener("success", () => {
      if (openingFailed) {
        request.result.close();
        return;
      }
      request.result.addEventListener("versionchange", () => {
        request.result.close();
        onVersionChange();
      });
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      openingFailed = true;
      reject(request.error ?? new Error("Could not open local data."));
    });
    request.addEventListener("blocked", () => {
      openingFailed = true;
      reject(new Error("Local data upgrade is blocked by another tab."));
    });
  });
}

type DatabaseOpener = (
  onVersionChange: () => void,
) => Promise<IDBDatabase>;

export class WubanDatabaseConnection {
  private databasePromise: Promise<IDBDatabase> | null = null;

  constructor(
    private readonly openDatabase: DatabaseOpener = openWubanDatabase,
  ) {}

  open(): Promise<IDBDatabase> {
    if (this.databasePromise !== null) {
      return this.databasePromise;
    }

    const opening = this.openDatabase(() => {
      this.databasePromise = null;
    });
    const recoverable = opening.catch((error: unknown) => {
      if (this.databasePromise === recoverable) {
        this.databasePromise = null;
      }
      throw error;
    });
    this.databasePromise = recoverable;
    return recoverable;
  }
}

export function transactionComplete(
  transaction: IDBTransaction,
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => {
      resolve();
    });
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    });
  });
}

export function unknownArrayResult(request: IDBRequest): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      const result: unknown = request.result;
      if (Array.isArray(result)) {
        resolve(result);
        return;
      }
      reject(new Error("Stored record list has an invalid shape."));
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    });
  });
}

export function unknownResult(request: IDBRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result as unknown);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    });
  });
}
