import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface OnboardingProgress {
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

export async function getOnboardingProgress(uid: string): Promise<OnboardingProgress> {
  const ref = doc(db, "onboardingProgress", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { onboardingComplete: false, currentStep: 1 };
  }

  return snap.data() as OnboardingProgress;
}

export async function markOnboardingComplete(uid: string) {
  const ref = doc(db, "onboardingProgress", uid);
  await setDoc(ref, {
    onboardingComplete: true,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
