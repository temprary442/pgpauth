console.log("HELLO WORLD");

const URL = "http://localhost:3080/user";
const form    = document.getElementById("form");
const input   = document.getElementById("input");
const info    = document.getElementById("info");
const tainput = document.getElementById("tainput");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = input.value.trim();
    const pubkey   = tainput.value.trim();

    try {
        const ret = await fetch(URL, {
            headers: {'Content-Type': 'application/json'}, // just add that up for express servers ?
            method : "POST",
            body : JSON.stringify({
                username : username,
                pubkey   : pubkey
            })
        });
        const json = await ret.json();
        info.innerText = json.msg;
    } catch (e) {
        info.innerText = "ERROR!";
    }
})