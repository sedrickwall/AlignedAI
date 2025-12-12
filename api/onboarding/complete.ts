import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "../utils/initAdmin";

initAdmin();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    await ref.set(
      {
        progress: {
          onboardingComplete: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Onboarding complete error:", err);
    return res.status(500).json({ error: err.message });
  }
}
