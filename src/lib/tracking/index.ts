import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  type Analytics,
} from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase";

let analytics: Analytics | null | undefined;

async function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
  if (analytics !== undefined) return analytics;

  const supported = await isSupported();
  if (!supported) {
    analytics = null;
    return null;
  }

  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}

export async function trackScreenView(screenName: string) {
  const instance = await getClientAnalytics();
  if (!instance) return;

  logEvent(instance, "screen_view", {
    firebase_screen: screenName,
    firebase_screen_class: screenName,
  });
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  const instance = await getClientAnalytics();
  if (!instance) return;

  logEvent(instance, name, params);
}

export async function setAnalyticsUser(uid: string | null) {
  const instance = await getClientAnalytics();
  if (!instance) return;

  setUserId(instance, uid);
}

export const AnalyticsEvents = {
  login: () => trackEvent("login"),
  logout: () => trackEvent("logout"),
  projectCreated: () => trackEvent("project_created"),
  partyCreated: (partyType: string) =>
    trackEvent("party_created", { party_type: partyType }),
  transactionCreated: (transactionType: string) =>
    trackEvent("transaction_created", { transaction_type: transactionType }),
  contactAdded: () => trackEvent("contact_added"),
  partyAssigned: (assignmentType: string) =>
    trackEvent("party_assigned", { assignment_type: assignmentType }),
} as const;
