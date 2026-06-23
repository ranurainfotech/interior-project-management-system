import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

export async function reauthenticateWithPassword(password: string): Promise<void> {
  const auth = getClientAuth();
  const user = auth.currentUser;

  if (!user?.email) {
    throw new Error("You must be signed in with email and password.");
  }

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}
