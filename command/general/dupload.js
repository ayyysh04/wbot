const { fetchBuffer, downloadMedia } = require("../../utils")
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { downloadContentFromMessage, downloadMediaMessage } = require("@adiwajshing/baileys");
const { writeFile } = require("fs");

const CLIENT_ID = '933936673087-sv7njkiu21eu4bgjhd3iuurqu99jp7ng.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04JnjigDn9202CgYIARAAGAQSNwF-L9Ir9MFI0xV9JEq94LnBvoO-u5jTvKvyXUPO-v0RsLJREWqGREXrk1_vdBUDS-Ox9XhtUXA';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});
async function uploadFile(filename, folderName, mediaLocation) {

    var folderId = await FindFolderByName(folderName);
    var folderIds = [];
    if (folderId !== null) {
        folderIds.push(folderId);
    }
    else
        folderIds.push('1UgXutA8Af8RPXOQs0UuitFsUh_tyF7We');//bot data folder
    try {
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: folderIds
            },
            media: {
                body:
                    mediaLocation,
                // fs.createReadStream(path.join(__dirname, filename)),
                // mimeType: 'image/png',
            },
        });

        // console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }
}

async function FindFolderByName(query) {
    try {
        res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${query}' and trashed=false`,
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive',
        });
        // if (err)
        //     return console.log("error", e)
        const files = res.data.files;
        if (files.length == 0) {
            return null

        }
        else {
            for (i = 0; i < res.data.files.length; i++) {
                // console.log(res.data.files[i].name + "   " + res.data.files[i].id)
                return res.data.files[i].id
            }
        }
    } catch (error) {
        console.log(error.message);
    }

}
async function deleteFiles(...locations) {
    for (location of locations) {
        fs.unlink(location, (err) => {
            if (err) console.log(err);
            else {
                // console.log("\nDeleted file at: " + location);
            }
        });
    }
};
module.exports = {
    name: "dupload",
    alias: ["upload"],
    desc: "upload a file",
    category: "general",
    use: "[provider] <emoji>\n\nProvider:\n- WhatsApp\n- Samsung\n- Apple\n- Google",
    async exec(msg, sock, args) {

        const { quoted } = msg;

        try {

            dow = await downloadMediaMessage(quoted);
            var fileName;
            if (Object.keys(quoted.message)[0] == "documentMessage" || Object.keys(quoted.message)[0] == "videoMessage" || Object.keys(quoted.message)[0] == "audioMessage")
                fileName = quoted["message"][Object.keys(quoted.message)[0]]["fileName"];
            else
                fileName = null
            await uploadFile(fileName, null, dow);
            await msg.reply(`done`)
            // deleteFiles(fileLoc);
        } catch (e) {

            await msg.reply(e);
        }
    }
}