/* 
Google Drive API:
Demonstration to:
1. upload 
2. delete 
3. create public URL of a file.
required npm package: googleapis
*/
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { delay } = require('@adiwajshing/baileys');

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

/* 
filepath which needs to be uploaded
Note: Assumes example.jpg file is in root directory, 
though this can be any filePath
*/
// const filePath = path.join(__dirname, 'hero.png');
let authFileId = undefined;
async function uploadFile(filename, firstTimeCreate) {
    let response;
    try {
        if (!firstTimeCreate) {
            drive.files.update({
                fileId: authFileId,
                media: {
                    body: fs.createReadStream(path.join(__dirname, '../' + filename)),
                    // mimeType: 'image/png',
                },
            }, (err, file) => {
                if (err) {
                    // Handle error
                    // console.error(err);
                } else {
                    console.log("file updated")

                    // authFileId = file.id;
                }
            });

            return;
        }

        response = await drive.files.create({
            requestBody: {
                name: filename
            },
            media: {
                body: fs.createReadStream(path.join(__dirname, '../' + filename)),
                // mimeType: 'image/png',
            },
        });
        authFileId = response.data.id
        console.log("file created")
    } catch (error) {
        console.log(error.message);
    }
}
// uploadFile('highscore.txt');//create a file in root folder
// uploadFile('highscore.txt', null);//create a file in bot app folder
// uploadFile('highscore.txt', 'bme');//create a file in specific folder

async function deleteFile() {
    try {
        const response = await drive.files.delete({
            fileId: '1tRLOM5LjX0t4NTS7B_kjnu0_S6UbQW_c',
        });
        console.log(response.data, response.status);
    } catch (error) {
        console.log(error.message);
    }
}
// deleteFile();

async function generatePublicUrl() {
    try {
        const fileId = 'YOUR FILE ID';
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        /* 
        webViewLink: View the file in browser
        webContentLink: Direct download link 
        */
        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });
        console.log(result.data);
    } catch (error) {
        console.log(error.message);
    }
}
// generatePublicUrl();

async function ListFolders(query) {
    let folderName = query;
    let result = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name contains '${query}' and trashed=false`,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
    }).catch(e => console.log("error", e));
    let folder = result.data.files.filter(x => x.name.includes(folderName));
    for (i = 0; i < result.data.files.length; i++) {
        console.log(result.data.files[i].name + "   " + result.data.files[i].id)
    }
}
// ListFolders('z')

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
// FindFolderByName('zaynfgf').then(res => console.log(res))

async function ListFiles(query) {
    // `${query}`
    let result = await drive.files.list({
        q: `name contains '${query}'`,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
    }).catch(e => console.log("error", e));
    for (i = 0; i < result.data.files.length; i++) {
        console.log(result.data.files[i].name + "   " + result.data.files[i].id)
    }


}
// ListFiles('python')

async function retriveFileId(query) {
    // `${query}`

    try {
        let result = await drive.files.list({
            q: `name='${query}' and trashed=false`,
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive',
        }).catch(e => console.log("error", e));
        // for (i = 0; i < result.data.files.length; i++) {
        //     console.log(result.data.files[i].name + "   " + result.data.files[i].id)
        // }

        return result.data.files[0].id;
    } catch (error) {

    }
}


//creating the folder in drive inside bot data folder (uses parents)
function createFolder(name, folderId) {
    var folderIds = [];
    if (folderId !== null) {
        folderIds.push(folderId);
    }
    else
        folderIds.push('1UgXutA8Af8RPXOQs0UuitFsUh_tyF7We');//bot data folder
    var fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        parents: folderIds
    };
    drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    }, function (err, file) {
        if (err) {
            console.log("error creating folder: ", err);

        } else {
            console.log('Folder Id: ', file.data.id);
        }
    });
}
// createFolder("BMO", null)
async function downloadFile() {
    try {
        var id = await retriveFileId('session-md.json');
        if (id == null)
            return null;
        var dest = fs.createWriteStream("session-md.json");
        console.log(id);
        drive.files.get(
            { fileId: id, alt: "media" },
            { responseType: "stream" },
            (err, { data }) => {
                if (err) {
                    console.log(err);
                    return;
                }
                data
                    .on("end", () => console.log("Done."))
                    .on("error", (err) => {
                        console.log(err);
                        return process.exit();
                    })
                    .pipe(dest);
            }
        );
        authFileId = id
        await delay(5000)
        return true;
    } catch (error) {

    }
}

// downloadFile()

module.exports = {
    downloadFile: downloadFile,
    uploadFile: uploadFile
};