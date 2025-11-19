const admin = require("firebase-admin");
const readline = require("readline");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter UID: ", function(uid) {
  rl.question("Enter role (student/teacher/admin): ", async function(role) {
    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      console.log(` Role '${role}' set for user: ${uid}`);
    } catch (err) {
      console.error(" Error setting role:", err);
    }
    rl.close();
  });
});
