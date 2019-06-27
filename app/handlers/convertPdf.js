// CovertPDF.js
// Author - Tom Bellis

// import pdf manipulation tool
var pdf = require('./pdf-poppler');
var path = require('path');
var {exec} = require('child_process');
var fs = require('fs-extra');

// import model
var map = require('../models/map');

module.exports.convert = async function(file, formData) {
    let tmpFile = path.resolve(__dirname, "../../" + file.tempFilePath);
    let baseDir = path.resolve(__dirname, "../../");
    let tmpDir = path.resolve(__dirname, '../../tmp/');

    // create map document
    var mapDocument = await createMapDocument(formData);
    let mapsDir = path.resolve(baseDir + "/" + "maps/" +  mapDocument._id + "/");
    let mapId = mapDocument._id.toString();
    // create png from pdf
    var pngFilePath = await createPng(tmpFile, baseDir, mapDocument);
    var cleanUp = await removeTmpFile(tmpFile, baseDir);
    // tile up png
    var tiledUp = await tileup(pngFilePath, mapsDir);
    //rename renameFolders
    var foldered = await renameFolders(mapsDir);
    // remove old png
    var pnged = await removePngFile(pngFilePath);
    // update map document with uri
    var updateMap = await updateMapDocument(mapId);
    return updateMap;
};

// don't create a new document
module.exports.update = async function(file, formData)
{
    // check if file is attached
    if(typeof file !== 'undefined')
    {
        let tmpFile = path.resolve(__dirname, "../../" + file.tempFilePath);
        let baseDir = path.resolve(__dirname, "../../");
        let tmpDir = path.resolve(__dirname, '../../tmp/');
        // file exists
        var mapDocument = await findMapDocument(formData.mapId);
        let mapsDir = path.resolve(baseDir + "/" + "maps/" +  mapDocument._id + "/");
        // remove old folders in maps
        var cleanOldFolders = await cleanUpMaps(baseDir, mapDocument);
        // create new png
        var pngFilePath = await createPng(tmpFile, baseDir, mapDocument);
        // // tidy up
        var cleanUp = await removeTmpFile(tmpFile, baseDir);
        // tile up
        var tiledUp = await tileup(pngFilePath, mapsDir);
        // //rename renameFolders
        var foldered = await renameFolders(mapsDir);
        // // remove old png
        var pnged = await removePngFile(pngFilePath);
    }

    // update the document with new data
    let updateDocument = await updateMapDetails(formData);

};

// Creates new map document in mongodb

function createMapDocument(formData) {
    return new Promise(function(resolve, reject) {
        map.create({
            mapName: formData.mapName,
            description: formData.description,
            uriPath: ""
        }, function(err, newMap) {
            if (err) {
                reject(err);
            } else {
                resolve(newMap);
            }
        });
    });
}

// finds the document to update

function findMapDocument(mapId)
{
    return new Promise(function(resolve, reject) {
        map.findById(mapId, function(err, doc)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(doc);
                console.log('Found document');
            }
        })
    });
}


/*
 * Creates PNG from the source pdf
 * Scale: 8192 * x
 */
function createPng(tmpFile, baseDir, mapDocument) {
    return new Promise(function(resolve, reject) {
        let filePrefix = mapDocument._id.toString();
        let opts = {
            format: 'png',
            out_dir: baseDir + "/png",
            out_prefix: filePrefix,
            scale: 16384,
            page: 1
        }

        pdf.convert(tmpFile, opts).then(res => {
                console.log('Successfully converted');
                let newFile = path.resolve(baseDir + "/png/" + filePrefix + "-01.png");
                fs.stat(newFile, function(err, stats)
                {
                    if(err)
                    {
                        let newFile = path.resolve(baseDir + "/png/" + filePrefix + "-1.png");
                        resolve(newFile);
                    }
                    else
                    {
                        resolve(newFile);
                    }
                })

            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
    });
}

// Removes temp files
function removeTmpFile(tmpFile, baseDir)
{
    return new Promise(function(resolve, reject)
    {
        // delete the temp file
        fs.unlink(tmpFile, function(err) {
            if (err) {
                throw err;
                reject(err);
            }

            console.log('Temp file deleted!');
            resolve("Done");
        });
    });
}

// removes old folders on update

function cleanUpMaps(baseDir, mapDocument)
{
        console.log('Cleaning up old folders');
        return new Promise(function(resolve, reject) {
            let inPath = path.join(baseDir, mapDocument.uriPath);
            fs.readdir(inPath, (err, files) => {
                if(err)
                {
                    reject(err)
                }

                if(files.length == 0)
                {
                    // done
                    console.log('Done cleaning');
                    resolve();
                }

                else
                {
                    let count = 1;
                    for(const file of files)
                    {
                        fs.remove(path.join(inPath, file), err => {
                            if(err)
                            {
                                reject(err);
                            }
                        })


                        if(count == files.length)
                        {
                            resolve();
                        }
                        else
                        {
                            count++;
                        }
                    }



                }
            });
        });
}

// Calls tileup ruby gem to create tiles

function tileup(pngFilePath, outputDir) {
    return new Promise(function(resolve, reject)
    {
        var folders = new Promise(function(resolve, reject) {
            fs.stat(outputDir, function(err, stats)
            {
                if(err && err.errno === 34)
                {
                    // no dir
                    fs.mkdir(outputDir, { recursive: false }, function(err)
                    {
                        if(err)
                        {
                            reject(err);
                        }

                        resolve();
                    });
                }
                else
                {
                    resolve();
                }

            });
        });

        folders.then(function()
        {
            // dir exists
            let command = "tileup --auto-zoom 4 --prefix map_tile --in " + pngFilePath + " --output-dir " + outputDir;
            exec(command, (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                resolve();
            });
        })
    });
}

// TEMP: Need to write tileup to make folders this way
// Remove old png

function renameFolders(mapPath)
{
    return new Promise(function(resolve, reject) {
        fs.rename(mapPath + "/16", mapPath + "/0", (err) => {
            fs.rename(mapPath + "/17", mapPath + "/1", (err) => {
                if(err) reject(err);
                fs.rename(mapPath + "/18", mapPath + "/2", (err) => {
                    if(err) reject(err);
                    fs.rename(mapPath + "/19", mapPath + "/3", (err) => {
                        if(err) reject(err);
                        fs.rename(mapPath + "/20", mapPath + "/4", (err) => {
                            if(err) reject(err);
                            console.log("Renamed folders");
                            resolve("true");
                        });
                    });
                });
            });
        })
    });
}

function removePngFile(pngFilePath)
{
    return new Promise(function(resolve, reject) {
        fs.unlink(pngFilePath, function(err)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve("True");
                console.log("Removed old png file");
            }
        })
    });
}


// Adds the URI to the document

function updateMapDocument(mapId) {
    return new Promise(function(resolve, reject) {
        let relativePath = "maps/" + mapId + "/";
        map.findByIdAndUpdate(mapId, { $set: { uriPath: relativePath } }, function(err, doc)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                console.log("Updated the db");
                resolve(true);
            }
        });
    });
}

// Updates the whole document

function updateMapDetails(formData)
{
    return new Promise(function(resolve, reject) {
        map.findByIdAndUpdate(formData.id, {
            $set: {
                mapName: formData.mapName,
                description: formData.description,
                lastUpdated: new Date().toISOString()
            }
        }, function(err, doc)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(doc);
                console.log('Updated doc');
            }
        })
    });
}
