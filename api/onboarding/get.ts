import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, doc, getDoc } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { uid } = req.query;

  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    const ref = doc(db, "onboarding", uid as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
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
