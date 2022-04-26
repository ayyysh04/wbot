const fs = require("fs");
const { google } = require("googleapis");

const CLIENT_ID =
    "933936673087-sv7njkiu21eu4bgjhd3iuurqu99jp7ng.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
    "1//04JnjigDn9202CgYIARAAGAQSNwF-L9Ir9MFI0xV9JEq94LnBvoO-u5jTvKvyXUPO-v0RsLJREWqGREXrk1_vdBUDS-Ox9XhtUXA";

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});
const { uploadFile } = require("../../utils/gdrive");
module.exports = {
    name: "tor",
    alias: ["tor"],
    desc: "download a torrent",
    category: "general",
    use: ".torrent <folder location> <filename if not pdf/video>",
    /**
     * @param {proto.IWebMessageInfo} msg
     * @param {WASocket} sock
     */
    async exec(msg, sock, args) {
        try {

            var from = {

                id: "1lLplvlzsjs9u__JtFaRqKzkVnUZE8L81",
                name: "sem 2"
            }
            var to = {

                id: "1UgXutA8Af8RPXOQs0UuitFsUh_tyF7We",
                name: "bot data"
            }

            await cloneFolder(from, to)
        } catch (error) {
            console.log(error);
        }
    },
};

async function cloneFolder(from, to) {
    // Create new folder
    const newFolder = (
        await drive.files.create({
            resource: {
                name: from.name,
                mimeType: "application/vnd.google-apps.folder",
                parents: [to.id],
            },
        })
    ).data;
    // Find all sub-folders
    const folders = (
        await drive.files.list({
            q: `'${from.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            pageSize: 100,
            fields: "nextPageToken, files(id, name)",
        })
    ).data.files;
    // Find all files
    const files = (
        await drive.files.list({
            q: `'${from.id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
            pageSize: 100,
            fields: "nextPageToken, files(id, name)",
        })
    ).data.files;
    for (let index = 0; index < files.length; index++) {
        await downloadAndUploadFile(files[index].id, files[index].name, newFolder.id)
    }
    for (let index = 0; index < folders.length; index++) {
        await cloneFolder(folders[index], newFolder)
    }

}
async function downloadAndUploadFile(id, fileName, folderId) {
    try {

        const data = await drive.files.get(
            { fileId: id, alt: "media" },
            { responseType: "stream" },
            // (err, { data }) => {
            // if (err) {
            //     console.log(err);
            //     return;
            // }

        )


        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId]
            },
            media: {
                body: data.data,

            },
        });
        data.data
            .on("end", () => { console.log("Done.") })
            .on("error", (err) => {
                console.log(id)
                console.log(err);
            })
        // }
        // );
    } catch (error) { }
}
