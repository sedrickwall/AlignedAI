import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreOnboardingProgress {
  onboardingComplete: boolean;
  currentStep?: number;
  identityComplete?: boolean;
  purposeComplete?: boolean;
  pillarsComplete?: boolean;
  visionComplete?: boolean;
  capacityComplete?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export async function getOnboardingProgress(uid: string): Promise<FirestoreOnboardingProgress> {
  const ref = doc(db, "onboarding", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { onboardingComplete: false, currentStep: 1 };
  }

  return snap.data() as FirestoreOnboardingProgress;
}

export async function updateOnboardingProgress(uid: string, updates: Partial<FirestoreOnboardingProgress>) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, updates, { merge: true });
}

export async function markOnboardingComplete(uid: string) {
  const ref = doc(db, "onboarding", uid);

  await updateDoc(ref, {
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
}
