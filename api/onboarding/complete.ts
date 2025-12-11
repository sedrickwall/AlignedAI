import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    await db.collection("onboarding").doc(uid).update({
      onboardingComplete: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
