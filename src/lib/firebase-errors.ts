export function getFirestoreErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error
        ? String((error as { message: unknown }).message)
        : "Something went wrong loading data.";

  if (message.includes("currently building")) {
    return "Firestore indexes are still building. Wait a few minutes, then refresh the page.";
  }

  if (message.includes("requires an index")) {
    return "A database index is missing or still building. Check the Firebase console, then refresh.";
  }

  if (message.includes("permission") || message.includes("Permission")) {
    return "Permission denied. Sign in again or contact support if this continues.";
  }

  return message;
}

export function isIndexBuildingError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  return message.includes("currently building");
}
