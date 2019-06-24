var express = require('express');
var pdfRoutes = express.Router();

// import pdf handler
var pdfHandler = require('../handlers/convertPdf');

/*
 * Test route for Postman
 */

pdfRoutes.get('/', function(req, res) {
    res.json({
        "message": "PDF sub route works!"
    });
});

/*
 * Upload pdf to be made into map tiles
 */

pdfRoutes.post('/upload', function(req, res) {
    // console.log(req.files.uploadFile.mimetype);

    if (req.files.uploadFile.mimetype !== "application/pdf") {
        res.json({
            "message": "Invalid file type"
        });
    } else {
        // User response
        res.status(201);
        res.json({
            "message": "Ack"
        });

        pdfHandler.convert(req.files.uploadedFile, req.body).then(function(output)
        {
            if(output)
            {
                console.log('Conversion complete');
            }
        });

    }
});

// export the routes
module.exports = pdfRoutes;
