import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { uid } = req.query;

  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    const snap = await db.collection("onboarding").doc(uid as string).get();

    if (!snap.exists) {
      return res.json({
        onboardingComplete: false,
        currentStep: 1,
      });
    }

    return res.json(snap.data());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
