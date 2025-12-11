import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    const collections = ["identity", "purpose", "seasonPillars", "vision", "capacity"];

    const results: Record<string, any> = {};

    for (const col of collections) {
      const snap = await db.collection(col).doc(uid as string).get();
      results[col] = snap.exists ? snap.data() : col === "seasonPillars" ? [] : null;
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
