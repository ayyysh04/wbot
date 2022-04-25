const fs = require('fs');
const { downloadMediaMessage, proto } = require("@adiwajshing/baileys");
const { uploadFile, updateGoogleDocs } = require('../../utils/gdrive');

// async function uploadFile(filename, folderName, mediaLocation) {

//     var folderId = await FindFolderByName(folderName);
//     var folderIds = [];
//     if (folderId !== null) {
//         folderIds.push(folderId);
//     }
//     else
//         folderIds.push('1UgXutA8Af8RPXOQs0UuitFsUh_tyF7We');//bot data folder
//     try {
//         const response = await drive.files.create({
//             requestBody: {
//                 name: filename,
//                 parents: folderIds
//             },
//             media: {
//                 body:
//                     mediaLocation,
//                 // fs.createReadStream(path.join(__dirname, filename)),
//                 // mimeType: 'image/png',
//             },
//         });

//         // console.log(response.data);
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// async function FindFolderByName(query) {
//     try {
//         res = await drive.files.list({
//             q: `mimeType='application/vnd.google-apps.folder' and name='${query}' and trashed=false`,
//             fields: 'nextPageToken, files(id, name)',
//             spaces: 'drive',
//         });
//         // if (err)
//         //     return console.log("error", e)
//         const files = res.data.files;
//         if (files.length == 0) {
//             return null

//         }
//         else {
//             for (i = 0; i < res.data.files.length; i++) {
//                 // console.log(res.data.files[i].name + "   " + res.data.files[i].id)
//                 return res.data.files[i].id
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//     }

// }

module.exports = {
    name: "autoUploadUtility",
    alias: ["autoUploadUtility"],
    desc: "autoUploadUtility",
    category: "other",
    use: "dont use this command directly",
    /**
 * @param {proto.IWebMessageInfo} msg 
 * @param {import("@adiwajshing/baileys").WASocket} sock 
 */
    async exec(msg, sock, args) {
        // const { quoted } = msg;
        var folderLoc = autoFolderLoc;
        var fileName = autoFileName;

        if (fileName == null && msg.type == "documentMessage" || msg.type == "videoMessage" || msg.type == "audioMessage") {
            fileName = msg["message"][Object.keys(msg["message"])[0]]["fileName"];
        }

        // console.debug(fileName)
        try {
            if (msg.type == "extendedTextMessage" || msg.type == "conversation") {
                if (folderLoc != null) {
                    if (fileName == null)
                        fileName = folderLoc
                }
                else if (fileName == null) {
                    fileName = 'test'
                }

                await updateGoogleDocs(fileName, "\n" + msg.body, folderLoc)
            }
            else {

                dow = await downloadMediaMessage(msg);
                await uploadFile(fileName, folderLoc, dow);
                await msg.reply(`done`)
                // deleteFiles(fileLoc);
            }
        } catch (e) {

            await msg.reply(e);
        }
    }
}