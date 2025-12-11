import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, doc, getDoc } from "firebase-admin/firestore";
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
      const snap = await getDoc(doc(db, col, uid as string));
      results[col] = snap.exists() ? snap.data() : col === "seasonPillars" ? [] : null;
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
