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

    if (req.method === "GET") {
      const snap = await db.collection("seasonPillars").where("userId", "==", uid).get();
      const pillars = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json(pillars);
    }

    if (req.method === "POST") {
      const data = req.body;
      const docRef = await db.collection("seasonPillars").add({
        ...data,
        userId: uid,
        isActive: true,
        order: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
      const created = await docRef.get();
      return res.status(201).json({ id: docRef.id, ...created.data() });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Season pillars API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
