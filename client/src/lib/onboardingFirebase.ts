// client/src/lib/onboardingFirebase.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

export async function getOnboardingProgress(
  uid: string
): Promise<FirestoreOnboardingProgress> {
  const ref = doc(db, "onboardingProgress", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // default: not onboarded, start at step 1
    return {
      onboardingComplete: false,
      currentStep: 1,
    };
  }

  const data = snap.data() as FirestoreOnboardingProgress;

  // Safety: ensure the flag exists
  if (typeof data.onboardingComplete !== "boolean") {
    data.onboardingComplete = false;
  }

  return data;
}

export async function updateOnboardingProgress(
  uid: string,
  data: Partial<FirestoreOnboardingProgress>
) {
  const ref = doc(db, "onboardingProgress", uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function markOnboardingComplete(uid: string) {
  const ref = doc(db, "onboardingProgress", uid);
  await setDoc(
    ref,
    {
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
