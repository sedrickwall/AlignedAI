// client/src/lib/onboardingFirebase.ts
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

// ------------------------------------------------------
// GET PROGRESS
// ------------------------------------------------------
export async function getOnboardingProgress(
  uid: string
): Promise<FirestoreOnboardingProgress> {
  const ref = doc(db, "onboardingProgress", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Default structure when missing
    return {
      onboardingComplete: false,
      currentStep: 1,
      identityComplete: false,
      purposeComplete: false,
      pillarsComplete: false,
      visionComplete: false,
      capacityComplete: false,
    };
  }

  return snap.data() as FirestoreOnboardingProgress;
}

// ------------------------------------------------------
// UPDATE PROGRESS
// ------------------------------------------------------
export async function updateOnboardingProgress(
  uid: string,
  updates: Partial<FirestoreOnboardingProgress>
) {
  const ref = doc(db, "onboardingProgress", uid);

  await setDoc(
    ref,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

// ------------------------------------------------------
// MARK COMPLETE
// ------------------------------------------------------
export async function markOnboardingComplete(uid: string) {
  const ref = doc(db, "onboardingProgress", uid);

  await updateDoc(ref, {
    onboardingComplete: true,
    capacityComplete: true,
    updatedAt: serverTimestamp(),
  });

  return true;
}
