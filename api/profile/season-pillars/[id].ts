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

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing pillar ID" });
  }

  try {
    const { getAuth } = await import("firebase-admin/auth");
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const docRef = db.collection("seasonPillars").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Pillar not found" });
    }

    const pillarData = snap.data();
    if (pillarData?.userId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === "GET") {
      return res.json({ id: snap.id, ...pillarData });
    }

    if (req.method === "PATCH") {
      const updates = req.body;
      await docRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
      const updated = await docRef.get();
      return res.json({ id: updated.id, ...updated.data() });
    }

    if (req.method === "DELETE") {
      await docRef.delete();
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Season pillar API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
