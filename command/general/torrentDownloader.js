var Client = require('node-torrent');
var client = new Client({ logLevel: 'DEBUG' });

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
        console.log(args[0]);
        try {
            const torrent = client.addTorrent(args[0]);
            torrent.on("error", (error) => console.log(error));
            // when the torrent completes, move it's files to another area
            torrent.on('complete', function () {
                console.log('complete!');

                torrent.files.forEach(function (file) {
                    var newPath = '/new/path/' + file.path;
                    fs.rename(file.path, newPath);
                    // while still seeding need to make sure file.path points to the right place
                    file.path = newPath;
                });
            });
            torrent.on('progress', function () {
                console.log('In progress!');
                console.log(torrent.status)

            });

        } catch (error) {
            console.log(error);
        }
    },
};
