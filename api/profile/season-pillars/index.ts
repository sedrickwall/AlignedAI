import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "../../utils/initAdmin";

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

    const ref = db.collection("onboarding").doc(uid);
    const snap = await ref.get();
    const existing = snap.data() ?? {};
    const pillars: any[] = existing.seasonPillars ?? [];

    if (req.method === "GET") {
      return res.json(pillars);
    }

    if (req.method === "POST") {
      const newPillar = req.body;
      pillars.push(newPillar);

      await ref.set(
        { 
          seasonPillars: pillars,
          progress: {
            pillarsComplete: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      return res.json(pillars);
    }

    if (req.method === "PATCH") {
      const { id, updates } = req.body;
      const updated = pillars.map((p) => (p.id === id ? { ...p, ...updates } : p));

      await ref.set(
        { 
          seasonPillars: updated,
          progress: {
            pillarsComplete: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      return res.json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      const filtered = pillars.filter((p) => p.id !== id);

      await ref.set({ seasonPillars: filtered }, { merge: true });

      return res.json(filtered);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Pillars API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
