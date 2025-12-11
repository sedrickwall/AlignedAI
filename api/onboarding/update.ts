import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { uid, updates } = req.body;

  if (!uid || !updates) {
    return res.status(400).json({ error: "uid and updates required" });
  }

  try {
    await db.collection("onboarding").doc(uid).set(updates, { merge: true });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
