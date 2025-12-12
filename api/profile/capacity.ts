import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Validate Firebase auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split("Bearer ")[1];
    const { getAuth } = await import("firebase-admin/auth");
    const decodedUser = await getAuth().verifyIdToken(token);
    const uid = decodedUser.uid;

    // ------------------------------------------
    // GET CAPACITY (from onboarding/{uid}/capacity)
    // ------------------------------------------
    if (req.method === "GET") {
      const docRef = db.collection("onboarding").doc(uid);
      const snap = await docRef.get();
      const data = snap.exists ? snap.data() : null;

      return res.json(data?.capacity ?? null);
    }

    // ------------------------------------------
    // PATCH CAPACITY (update onboarding/{uid}.capacity)
    // ------------------------------------------
    if (req.method === "PATCH") {
      const updates = req.body;

      const docRef = db.collection("onboarding").doc(uid);

      await docRef.set(
        {
          capacity: {
            ...updates,
          },
          progress: {
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      const updatedDoc = await docRef.get();
      return res.json(updatedDoc.data()?.capacity ?? {});
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Capacity API error:", err);
    return res.status(500).json({
      error: "SERVER_CAPACITY_FAILURE",
      message: err?.message,
    });
  }
}
