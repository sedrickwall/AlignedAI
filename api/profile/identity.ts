import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

    if (req.method === "GET") {
      const snap = await db.collection("identity").doc(uid).get();
      return res.json(snap.exists ? snap.data() : null);
    }

    if (req.method === "PATCH") {
      const data = req.body;
      await db.collection("identity").doc(uid).set(
        { ...data, userId: uid, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      const updated = await db.collection("identity").doc(uid).get();
      return res.json(updated.data());
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Identity API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
