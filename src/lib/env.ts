/** True only when running `next dev` on localhost (not on Vercel). */
export function isLocalDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Dangerous test utilities (e.g. delete all data) are local-only. */
export function isDeleteAllDataEnabled(): boolean {
  return isLocalDevEnvironment();
}
