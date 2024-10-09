/* config */ 
const PORT_HTTP = 3000 +  80;
const PK_PATH   = "./static/key.pub";
const SK_PATH   = "./key.secret";
const PP_PATH   = "./pass";
/* config */

const err     = console.error;
const log     = console.log;
const express = require('express');
const openpgp = require('openpgp');
const fs      = require('fs');
const app     = express();
const http    = require('http');
const server  = http.createServer(app);
const bodyParser = require('body-parser');

//openpgp.config.allow_insecure_decryption_with_signing_keys = true

let DBu = {
  /* fingerprint : username */
};
let DBk = {
  /* fingerprint : pubkey */
}

log("LOADING pubkey");
const PUB_KEY = fs.readFileSync(PK_PATH, "utf-8");

log("LOADING secret key");
const SECRET_KEY = fs.readFileSync(SK_PATH, "utf-8").trim();
const pass       = fs.readFileSync(PP_PATH, "utf-8").trim();

const fingerprint = async (armored) => {
  const publicKey = await openpgp.readKey({armoredKey : armored});
  return publicKey.getFingerprint();
}
const verify = async (string, publicKey) => {
  const message = await openpgp.readMessage({
    armoredMessage: string
  });
  // at each call, privateKey is loaded
  // seems inefficient (TODO)
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: SECRET_KEY }),
    passphrase: pass
  });

  const { data: decrypted, signatures } = await openpgp.decrypt({
    message: message,
    verificationKeys: publicKey,
    decryptionKeys: privateKey,
  });

  return [decrypted, signatures];
}

app.use(express.static('static'))
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.get('/', (req, res) => {
  res.sendFile("index.html")
})
app.post("/user", async (req, res) => {
  log("[/user] ", req.body);
  const pubkey = req.body.pubkey.trim();
  const username = req.body.username.trim();

  try {
    const fingerprint_ = await fingerprint(pubkey);
    DBu[fingerprint_] = username;
    DBk[fingerprint_] = pubkey;
    log("[/user] Saved DBu and DBk");
  } catch (e) {
    err("Something went wrong ", e.message);
  }

  res.send({msg : "_"});
})
app.get("/pk", (req, res) => {
  /* sends public key of the website */
  res.send({pk : PUB_KEY});
})
app.post("/login", async (req, res) => {
  log("[/login] ", req.body);

  const fingerprint = req.body.fingerprint.toLowerCase();
  const digest_ = req.body.digest.trim();
  const username = "";

  // do quick lookup (DBusers and DBkeys)
  if (DBu[fingerprint] && DBk[fingerprint]) {
    log("[/login] ", DBk[fingerprint]);

    try {
      const publicKey = await openpgp.readKey({
        armoredKey: DBk[fingerprint],
      });

      const [decrypted, signs] = await verify(digest_, publicKey);

      await signs[0].verified; // throws on invalid signature
      console.log('Signature is valid {', decrypted, signs, '}');
    } catch (e) {
      err('Something went wrong: ' + e.message);
    }

    res.send({
      msg: "Welcome " + username,
      auth: "OK!"
    });
  } else {
    res.send({
      msg : "NO Public Key ?", 
      auth: "GET OUT!",
    });
  }
})

/* FOR HTTPS
server2.listen(PORT_HTTPS, () => {
  console.log(`App listening @ https://localhost:${PORT_HTTPS}/`);
});
*/
server.listen(PORT_HTTP, () => {
  console.log(`App listening http://localhost:${PORT_HTTP}/`);
})