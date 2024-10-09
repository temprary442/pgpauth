const log = console.log;
log("HALLO WORLD");

const input = document.getElementById("input");
const URL   = "http://localhost:3080/login";
const info  = document.getElementById("info");
const fingerprintInput = document.getElementById("fingerprint");
const form  = document.getElementById("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const digest      = input.value; // triming does not work ! (TODO)
    const fingerprint = fingerprintInput.value;
    try {
        const ret = await fetch(URL, {
            headers: {'Content-Type': 'application/json'}, // just add that up for express servers ?
            method : "POST",
            body : JSON.stringify({
                digest : digest,
                fingerprint: fingerprint
            })
        });

        const json = await ret.json();
        log("RET ", json);
        info.innerText = json.msg;
    } catch (e) {
        info.innerText = "Error";
    }
})

const GET = "http://localhost:3080/pk"; // server endpoint to query the public key
const sessionID = ""; // socketID for authentification.
const content = `${GET}|${sessionID}|`;
const div = document.getElementById("qrcode");
log(div);

new QRCode(div, content);