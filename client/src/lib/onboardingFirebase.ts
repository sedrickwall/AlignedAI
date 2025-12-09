// client/src/lib/onboardingFirebase.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { OnboardingProgress } from "@shared/schema";

/**
 * Read onboarding progress for a given Firebase user.
 * Stored in Firestore at: onboardingProgress/{uid}
 */
export async function getOnboardingProgress(
  uid: string
): Promise<OnboardingProgress> {
  const ref = doc(db, "onboardingProgress", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Default "not onboarded" state, fill required fields gracefully
    return {
      id: "",
      userId: uid,
      createdAt: null,
      updatedAt: null,
      currentStep: 1,
      identityComplete: false,
      purposeComplete: false,
      pillarsComplete: false,
      visionComplete: false,
      capacityComplete: false,
      onboardingComplete: false,
    };
  }

  const data = snap.data() as Partial<OnboardingProgress>;

  return {
    id: data.id ?? "",
    userId: data.userId ?? uid,
    createdAt: (data as any).createdAt ?? null,
    updatedAt: (data as any).updatedAt ?? null,
    currentStep: data.currentStep ?? 1,
    identityComplete: data.identityComplete ?? false,
    purposeComplete: data.purposeComplete ?? false,
    pillarsComplete: data.pillarsComplete ?? false,
    visionComplete: data.visionComplete ?? false,
    capacityComplete: data.capacityComplete ?? false,
    onboardingComplete: data.onboardingComplete ?? false,
  };
}

/**
 * Update onboarding progress for the user.
 * You only pass the fields you want to change.
 */
export async function updateOnboardingProgress(
  uid: string,
  updates: Partial<OnboardingProgress>
) {
  const ref = doc(db, "onboardingProgress", uid);

  await setDoc(
    ref,
    {
      ...updates,
      userId: uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Mark onboarding as complete.
 */
export async function markOnboardingComplete(uid: string) {
  await updateOnboardingProgress(uid, {
    onboardingComplete: true,
    capacityComplete: true,
  });
}
