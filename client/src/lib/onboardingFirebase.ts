// client/src/lib/onboardingFirebase.ts
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreOnboardingProgress {
  onboardingComplete: boolean;
  currentStep: number;
  identityComplete: boolean;
  purposeComplete: boolean;
  pillarsComplete: boolean;
  visionComplete: boolean;
  capacityComplete: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreOnboardingDocument {
  progress: FirestoreOnboardingProgress;
  identity?: any;
  purpose?: any;
  seasonPillars?: any[];
  vision?: any;
  capacity?: any;
  createdAt?: any;
  updatedAt?: any;
}

const defaultProgress: FirestoreOnboardingProgress = {
  onboardingComplete: false,
  currentStep: 1,
  identityComplete: false,
  purposeComplete: false,
  pillarsComplete: false,
  visionComplete: false,
  capacityComplete: false,
};

// ✅ READ PROGRESS (supports both top-level fields and nested progress map)
export async function getOnboardingProgress(
  uid: string
): Promise<FirestoreOnboardingProgress> {
  const ref = doc(db, "onboarding", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return defaultProgress;
  }

  const data = snap.data() as any;

  // If there's a nested `progress` map (older structure), prefer it.
  const src = data.progress ?? data;

  return {
    ...defaultProgress,
    onboardingComplete:
      typeof src.onboardingComplete === "boolean"
        ? src.onboardingComplete
        : defaultProgress.onboardingComplete,
    currentStep:
      typeof src.currentStep === "number"
        ? src.currentStep
        : defaultProgress.currentStep,
    identityComplete:
      typeof src.identityComplete === "boolean"
        ? src.identityComplete
        : defaultProgress.identityComplete,
    purposeComplete:
      typeof src.purposeComplete === "boolean"
        ? src.purposeComplete
        : defaultProgress.purposeComplete,
    pillarsComplete:
      typeof src.pillarsComplete === "boolean"
        ? src.pillarsComplete
        : defaultProgress.pillarsComplete,
    visionComplete:
      typeof src.visionComplete === "boolean"
        ? src.visionComplete
        : defaultProgress.visionComplete,
    capacityComplete:
      typeof src.capacityComplete === "boolean"
        ? src.capacityComplete
        : defaultProgress.capacityComplete,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ✅ WRITE PROGRESS (updates both top-level & nested `progress` map)
export async function updateOnboardingProgress(
  uid: string,
  updates: Partial<FirestoreOnboardingProgress>
): Promise<void> {
  const ref = doc(db, "onboarding", uid);

  const payload: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // Keep nested `progress` in sync for older data
  if (Object.keys(updates).length > 0) {
    payload.progress = updates;
  }

  await setDoc(ref, payload, { merge: true });
}

// ✅ MARK COMPLETE USING THE SAME UPDATE FN
export async function markOnboardingComplete(uid: string): Promise<void> {
  await updateOnboardingProgress(uid, {
    onboardingComplete: true,
    capacityComplete: true,
  });
}

// ✅ GET ALL ONBOARDING DATA (progress + profile sections)
export async function getOnboardingAll(uid: string): Promise<{
  progress: FirestoreOnboardingProgress;
  identity?: any;
  purpose?: any;
  seasonPillars?: any[];
  vision?: any;
  capacity?: any;
}> {
  const ref = doc(db, "onboarding", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      progress: defaultProgress,
      identity: undefined,
      purpose: undefined,
      seasonPillars: [],
      vision: undefined,
      capacity: undefined,
    };
  }

  const data = snap.data() as any;
  const src = data.progress ?? data;

  const progress: FirestoreOnboardingProgress = {
    ...defaultProgress,
    onboardingComplete: src.onboardingComplete ?? false,
    currentStep: src.currentStep ?? 1,
    identityComplete: src.identityComplete ?? false,
    purposeComplete: src.purposeComplete ?? false,
    pillarsComplete: src.pillarsComplete ?? false,
    visionComplete: src.visionComplete ?? false,
    capacityComplete: src.capacityComplete ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  return {
    progress,
    identity: data.identity,
    purpose: data.purpose,
    seasonPillars: data.seasonPillars ?? [],
    vision: data.vision,
    capacity: data.capacity,
  };
}

// ✅ SAVE IDENTITY
export async function saveIdentity(uid: string, identity: any): Promise<void> {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, { identity, updatedAt: serverTimestamp() }, { merge: true });
}

// ✅ SAVE PURPOSE
export async function savePurpose(uid: string, purpose: any): Promise<void> {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, { purpose, updatedAt: serverTimestamp() }, { merge: true });
}

// ✅ SAVE VISION
export async function saveVision(uid: string, vision: any): Promise<void> {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, { vision, updatedAt: serverTimestamp() }, { merge: true });
}

// ✅ SAVE CAPACITY
export async function saveCapacity(uid: string, capacity: any): Promise<void> {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, { capacity, updatedAt: serverTimestamp() }, { merge: true });
}

// ✅ SAVE SEASON PILLARS
export async function saveSeasonPillars(uid: string, seasonPillars: any[]): Promise<void> {
  const ref = doc(db, "onboarding", uid);
  await setDoc(ref, { seasonPillars, updatedAt: serverTimestamp() }, { merge: true });
}
