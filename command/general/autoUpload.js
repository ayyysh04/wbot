const djs = require("@discordjs/collection");

module.exports = {
    name: "auto",
    alias: ["auto"],
    desc: "auto upload a files to gcloud",
    use: ".auto on <folder> <filename> or .auto off",
    category: "general",
    async exec(msg, sock, args) {
        if (args[0] == null) {

            return await msg.reply("plz send on/off to activate/deactivate auto mode");
        } else {
            var replyText;
            if (args[0] == "on") {
                var folderLoc = args[1];
                var fileName = args[2];
                if (folderLoc != null)
                    autoFolderLoc = folderLoc
                if (fileName != null)
                    autoFileName = fileName
                autoFeature = true;
                console.log("in autoUpload fnc : " + autoFolderLoc)
                replyText = "auto upload feature is on"
            }
            else if (args[0] == "off") {
                replyText = "auto upload feature is off";
                autoFeature = false;
            }
            else {
                replyText = "wrong command"

            }
            return await msg.reply(replyText);
        }
    }
}

