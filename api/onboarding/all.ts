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
        identity: null,
        purpose: null,
        seasonPillars: [],
        vision: null,
        capacity: null,
      });
    }

    const data = snap.data() ?? {};

    return res.json({
      identity: data.identity ?? null,
      purpose: data.purpose ?? null,
      seasonPillars: data.seasonPillars ?? [],
      vision: data.vision ?? null,
      capacity: data.capacity ?? null,
    });
  } catch (err: any) {
    console.error("Onboarding all error:", err);
    return res.status(500).json({ error: err.message });
  }
}
