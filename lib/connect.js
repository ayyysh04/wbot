const { default: WASocket, DisconnectReason, useSingleFileAuthState, fetchLatestBaileysVersion, default: makeWASocket, delay } = require("@adiwajshing/baileys");
const Pino = require("pino");
const djs = require("@discordjs/collection");
const fs = require("fs");
const path = require("path").join;
const { Boom } = require("@hapi/boom");
const { color } = require("../utils");
const { session } = require("../config.json");
const joinHandler = require("../event/group_event");
// const fileAuth = useSingleFileAuthState;
// const express = require('express');
const { downloadFile, uploadFile } = require("./driveAccess");
const chatHandler = require("../event/chat_event");
// const app = express();
// app.get('/', (req, res) => {
//     res
//         .status(200)
//         .send('Hello server is running')
//         .end();
// });

// Start the server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`App listening on port ${PORT}`);
//     console.log('Press Ctrl+C to quit.');
// });

djs.commands = new djs.Collection();
djs.prefix = '!';

const readCommand = () => {
    let rootDir = path(__dirname, "../command");
    let dir = fs.readdirSync(rootDir);
    dir.forEach(async (res) => {
        const commandFiles = fs.readdirSync(`${rootDir}/${res}`).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`${rootDir}/${res}/${file}`);
            djs.commands.set(command.name, command);
        }
    });
    console.log(color('[SYS]', 'yellow'), 'command loaded!');
}
// cmd
readCommand()
var firstTimeCreate = true;
const connect = async () => {

    // console.debug(fs.existsSync(session));
    if (!fs.existsSync(session)) {
        file = await downloadFile();

    }


    const fileAuthState = useSingleFileAuthState(path(__dirname, `../${session}`), Pino({ level: "silent" }))

    let { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using: ${version}, newer: ${isLatest}`)

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: fileAuthState.state,
        logger: Pino({ level: "silent" }),
        version
    })


    // creds.update

    sock.ev.on("creds.update", async () => {
        console.log("cred file updated");
        fileAuthState.saveState();
        uploadFile(session, firstTimeCreate);
        if (firstTimeCreate == true)
            firstTimeCreate = false

    })
    // connection.update
    sock.ev.on("connection.update", async (up) => {
        // console.log(up);
        const { lastDisconnect, connection } = up;
        if (connection) { console.log("Connection Status: ", connection); }

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete ${session} and Scan Again`); sock.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); connect(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); connect(); }
            else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); sock.logout();
                // connect(); 
            }
            else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
                fs.unlink(`${session}`, (err) => {
                    if (err) throw err;
                    console.log('path/file.txt was deleted');
                });
                sock.logout();
            }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); connect(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); connect(); }
            else { sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`) }

        }
        else if (connection === "open") {
            // console.log("open hai bhai");
            firstTimeCreate = false;
            // await delay(10000);
            console.log("bot is ready to use");

        }
    })

    // messages.upsert
    sock.ev.on("messages.upsert", async (m) => {

        chatHandler(m, sock)
    })
    // group-participants.update
    sock.ev.on("group-participants.update", (json) => {
        joinHandler(json, sock);
    })
}
connect()