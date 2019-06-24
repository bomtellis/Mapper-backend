// removeMap.js
var path = require('path');
var fs = require('fs-extra');

// import model
var map = require('../models/map');

module.exports = async function(mapId)
{
        let baseDir = path.resolve(__dirname, "../../");
        var mapDocument = await clearDocument(mapId);
        let mapsDir = path.resolve(baseDir + "/" + "maps/" +  mapId + "/");
        var folders = await removeFolders(mapsDir)

        return true;
};

function removeFolders(mapsDir)
{
        console.log('Cleaning up old folders');
        return new Promise(function(resolve, reject) {
            let inPath = mapsDir;
            fs.readdir(inPath, (err, files) => {
                if(err)
                {
                    reject(err);
                }

                var typeCheck = typeof files;
                if(typeCheck == "undefined")
                {
                    console.log('Done cleaning');
                    resolve();
                }
                else
                {
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
                }
            });
        });
}

function clearDocument(mapId)
{
    return new Promise(function(resolve, reject) {
        map.findByIdAndRemove(mapId, function(err, doc)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(doc);
            }
        })
    });
}
