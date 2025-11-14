const router = require("express").Router();
const admin = require("firebase-admin");

// verify token middleware
async function verify(req, res, next) {
  try {
    const tok = req.headers.authorization?.split(" ")[1];
    if (!tok) return res.status(401).json({ error: "No token" });
    req.user = await admin.auth().verifyIdToken(tok);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// default student (called once after login)
router.post("/default-student", verify, async (req, res) => {
  await admin.auth().setCustomUserClaims(req.user.uid, { role: "student" });
  res.json({ ok: true });
});

// user requests teacher/admin
router.post("/request", verify, async (req, res) => {
  const db = admin.firestore();
  const { targetRole, reason } = req.body || {};
  await db.collection("role_requests").doc(req.user.uid).set(
    {
      uid: req.user.uid,
      email: req.user.email,
      targetRole,
      reason,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  res.json({ ok: true });
});

// admin pulls pending
router.get("/pending", verify, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  const snap = await admin.firestore().collection("role_requests").where("status", "==", "pending").get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

// admin approves
router.post("/approve", verify, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  const { uid, role } = req.body || {};
  const db = admin.firestore();
  await admin.auth().setCustomUserClaims(uid, { role });
  await db.collection("role_requests").doc(uid).update({
    status: "approved",
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.json({ ok: true });
});

module.exports = router;
