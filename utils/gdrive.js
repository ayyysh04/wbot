const { google } = require('googleapis');
const fs = require('fs');

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
const docs = google.docs({ version: 'v1', auth: oauth2Client });
// const classroom = google.classroom({ version: 'v1', auth: oauth2Client })
async function createGoogleDocs(filename, folderName, content = "") {

    folderId = await FindFolderByName(folderName);
    if (folderId == null)
        folderId = '1UgXutA8Af8RPXOQs0UuitFsUh_tyF7We';
    const requestBody = {
        name: filename,
        parents: [folderId],
        mimeType: 'application/vnd.google-apps.document',
    };
    const media = {
        mimeType: 'text/plain',
        body: content,
    };

    await drive.files.create({
        requestBody,
        media,
        fields: 'id',
    });
}

async function updateGoogleDocs(filename, content, folderName) {
    fileId = await retriveFileId(filename);
    console.log("fileId" + fileId)
    if (fileId == null) {
        await createGoogleDocs(filename, folderName, content)
    }
    else {
        const requests = [
            {
                "insertText": {
                    "text": content,
                    "endOfSegmentLocation": {
                        "segmentId": ""
                    }
                },
            },
        ];
        await docs.documents.batchUpdate({
            documentId: fileId,
            resource: {
                requests,
            },
        })
    }

}

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
async function retriveFileId(fileName) {

    try {
        let result = await drive.files.list({
            q: `mimeType != 'application/vnd.google-apps.folder' and name='${fileName}'and trashed=false`,
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive',
        }).catch(e => console.log("error", e));
        if (result.data.files.length == 0) {
            return null
        }
        else
            return result.data.files[0].id;
    } catch (error) {

    }
}
module.exports = { deleteFiles, FindFolderByName, uploadFile, createGoogleDocs, updateGoogleDocs }