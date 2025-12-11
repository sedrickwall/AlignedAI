// client/src/lib/onboardingFirebase.ts
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type {
  OnboardingProgress,
  IdentityProfile,
  PurposeProfile,
  SeasonPillar,
  VisionMap,
  CapacityProfile,
} from "@shared/schema";

export interface FirestoreOnboardingDocument {
  progress: OnboardingProgress;
  identity?: IdentityProfile;
  purpose?: PurposeProfile;
  seasonPillars?: SeasonPillar[];
  vision?: VisionMap;
  capacity?: CapacityProfile;
  createdAt?: any;
  updatedAt?: any;
}

// ---------- Helpers ----------

function defaultProgress(): OnboardingProgress {
  return {
    currentStep: 1,
    onboardingComplete: false,
    identityComplete: false,
    purposeComplete: false,
    pillarsComplete: false,
    visionComplete: false,
    capacityComplete: false,
  };
}

// ---------- READ ALL ONBOARDING DATA ----------

export async function getOnboardingAll(uid: string): Promise<FirestoreOnboardingDocument> {
  const ref = doc(db, "onboarding", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      progress: defaultProgress(),
      identity: undefined,
      purpose: undefined,
      seasonPillars: [],
      vision: undefined,
      capacity: undefined,
      createdAt: null,
      updatedAt: null,
    };
  }

  const data = snap.data() as Partial<FirestoreOnboardingDocument>;

  return {
    progress: data.progress ?? defaultProgress(),
    identity: data.identity,
    purpose: data.purpose,
    seasonPillars: data.seasonPillars ?? [],
    vision: data.vision,
    capacity: data.capacity,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ---------- PROGRESS ONLY ----------

export async function getOnboardingProgress(uid: string): Promise<OnboardingProgress> {
  const ref = doc(db, "onboarding", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return defaultProgress();
  }

  const data = snap.data() as Partial<FirestoreOnboardingDocument>;
  return data.progress ?? defaultProgress();
}

export async function updateOnboardingProgress(
  uid: string,
  updates: Partial<OnboardingProgress>
) {
  const ref = doc(db, "onboarding", uid);
  const current = await getOnboardingProgress(uid);

  const merged: OnboardingProgress = {
    ...current,
    ...updates,
  };

  await setDoc(
    ref,
    {
      progress: merged,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return merged;
}

export async function markOnboardingComplete(uid: string) {
  const ref = doc(db, "onboarding", uid);
  await updateDoc(ref, {
    "progress.onboardingComplete": true,
    "progress.capacityComplete": true,
    updatedAt: serverTimestamp(),
  });
}

// ---------- SECTION UPDATERS (identity, purpose, etc.) ----------

export async function saveIdentity(
  uid: string,
  identity: Partial<IdentityProfile>
) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(
    ref,
    {
      identity,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function savePurpose(
  uid: string,
  purpose: Partial<PurposeProfile>
) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(
    ref,
    {
      purpose,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveVision(
  uid: string,
  vision: Partial<VisionMap>
) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(
    ref,
    {
      vision,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveCapacity(
  uid: string,
  capacity: Partial<CapacityProfile>
) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(
    ref,
    {
      capacity,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveSeasonPillars(
  uid: string,
  seasonPillars: SeasonPillar[]
) {
  const ref = doc(db, "onboarding", uid);
  await setDoc(
    ref,
    {
      seasonPillars,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
