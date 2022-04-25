
const { downloadMediaMessage, proto, WASocket } = require("@adiwajshing/baileys");
const { uploadFile } = require("../../utils/gdrive");
module.exports = {
    name: "dupload",
    alias: ["upload"],
    desc: "upload a file",
    category: "general",
    use: ".dupload <folder location> <filename if not pdf/video>",
    /**
 * @param {proto.IWebMessageInfo} msg 
 * @param {WASocket} sock 
 */
    async exec(msg, sock, args) {
        const { quoted } = msg;
        var folderLoc = args[1];
        var fileName = args[2];
        if (fileName == null && Object.keys(quoted.message)[0] == "documentMessage" || Object.keys(quoted.message)[0] == "videoMessage" || Object.keys(quoted.message)[0] == "audioMessage")
            fileName = quoted["message"][Object.keys(quoted.message)[0]]["fileName"];

        // console.debug(fileName)
        try {
            dow = await downloadMediaMessage(quoted);
            await uploadFile(fileName, folderLoc, dow);
            await msg.reply(`done`)
            // deleteFiles(fileLoc);
        } catch (e) {

            await msg.reply(e);
        }
    }
}