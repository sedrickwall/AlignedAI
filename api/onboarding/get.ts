import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { getAuth } = await import("firebase-admin/auth");
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const snap = await db.collection("onboarding").doc(uid).get();

    if (!snap.exists) {
      return res.json({
        onboardingComplete: false,
        currentStep: 1,
        identityComplete: false,
        purposeComplete: false,
        pillarsComplete: false,
        visionComplete: false,
        capacityComplete: false,
      });
    }

    const data = snap.data() ?? {};
    const progress = data.progress ?? {};

    return res.json({
      onboardingComplete: progress.onboardingComplete ?? data.onboardingComplete ?? false,
      currentStep: progress.currentStep ?? data.currentStep ?? 1,
      identityComplete: progress.identityComplete ?? data.identityComplete ?? false,
      purposeComplete: progress.purposeComplete ?? data.purposeComplete ?? false,
      pillarsComplete: progress.pillarsComplete ?? data.pillarsComplete ?? false,
      visionComplete: progress.visionComplete ?? data.visionComplete ?? false,
      capacityComplete: progress.capacityComplete ?? data.capacityComplete ?? false,
    });
  } catch (err: any) {
    console.error("Onboarding get error:", err);
    return res.status(500).json({ error: err.message });
  }
}
