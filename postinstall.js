var fs = require('fs-extra');
var path = __dirname;

// create folders
function createfolders()
{
    try
    {
        fs.mkdirSync(path + "/tmp", {});
    }
    catch (e) {
        console.log('/tmp exists');
        if (e.code == 'EACCESS') throw e;
    }

    try {
        fs.mkdirSync(path + "/png", {});
    } catch (e) {
        console.log('/png exists');
        if (e.code !== 'EEXIST') throw e
    }

    try {
        fs.mkdirSync(path + "/maps", {});
    } catch (e) {
        console.log('/maps exists');
        if (e.code !== 'EEXIST') throw e
    }

    try {
        fs.mkdirSync(path + "/certs", {});
    } catch (e) {
        console.log('/certs exists');
        if (e.code !== 'EEXIST') throw e
    }
}

try {
    createfolders();
    console.log('Directories created');
} catch (e) {
    console.log(e);
    console.log('Directory could not be created. Please check permissions');
}
