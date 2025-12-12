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

    const ref = db.collection("onboarding").doc(uid);

    if (req.method === "GET") {
      const snap = await ref.get();
      const data = snap.exists ? snap.data() : null;
      return res.json(data?.identity ?? null);
    }

    if (req.method === "PATCH") {
      await ref.set(
        {
          identity: req.body,
          progress: { 
            identityComplete: true, 
            updatedAt: FieldValue.serverTimestamp() 
          },
        },
        { merge: true }
      );

      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Identity API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
