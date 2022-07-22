
const express = require("express");
const routers = express.Router();
const multer = require("multer");
const path = require("path");
const libre = require('libreoffice-convert');
const fs = require('fs')
const {router} = require("express/lib/application");
var docxConverter = require('docx-pdf');
var CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client');
const unoconv = require('awesome-unoconv');
var toPdf = require("office-to-pdf")
var PDFImage = require("pdf-image").PDFImage;






const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});

const docsToPDF = (req , file , callback) => {
    var ext = path.extname(file.originalname)


    console.log(ext )

    if(ext !== '.docx' ){
        return callback('this is not supported')
    }

    callback(null , true)
}

const pdfToDocxFilter = (req , file , callback) => {
    var ext = path.extname(file.originalname)

    if(ext !== '.pdf' ){
        return callback('not supported')
    }
    callback(null , true)
}

const docxToPDF = multer({
    storage: storage,
    fileFilter : docsToPDF
});

const pdfToDocx = multer({
    storage: storage,
    fileFilter : pdfToDocxFilter
});



routers.get('/down', (req, res)=>{
    res.send('ok')
})




routers.post("/fileUpload",  docxToPDF.single('file') ,(req , res) => {
    if(req.file){
        const file =  fs.readFileSync(req.file.path)
        let outputFilePath = Date.now() + "output.pdf"

        libre.convert(file , '.pdf' , undefined , (err , done) => {
            if(err){
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(outputFilePath)

                res.send('some error has taken in convertion')
            }

            try {
                fs.writeFileSync(`./uploads/${outputFilePath}`, done)
                console.log({outputFilePath})

            }catch(err){
                console.log(({err}))
            }
            res.download(`./uploads/${outputFilePath}` , (err , done) => {
                if(err){
                    console.log({err})
                    fs.unlinkSync(req.file.path)
                    fs.unlinkSync(outputFilePath)

                    res.send('some error has taken in download ')
                }
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(`./uploads/${outputFilePath}`)

            })
        } )

    }



});

routers.post('/pdftodocx' , pdfToDocx.single('file')   , (req , res) => {


    if(req.file){
        let outputFilePath = Date.now() + 'output.docx'

        libre.convert(req.file.path , '.docx' , undefined , (err, done) => {
            if(err){
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(outputFilePath)
                res.send('error to converting file')
            }

            // console.log(done)

            try {
                fs.writeFileSync(`./uploads/${outputFilePath}`, done)
                console.log({outputFilePath})

            }catch(err){
                console.log(({err}))
            }

            res.download(`./uploads/${outputFilePath}` , (err , done) => {
                if(err){
                    console.log({err})
                    fs.unlinkSync(req.file.path)
                    fs.unlinkSync(outputFilePath)

                    res.send('some error has taken in download ')
                }
                console.log(outputFilePath)
                // fs.unlinkSync(req.file.path)
                // fs.unlinkSync(`./uploads/${outputFilePath}`)

            })
        })

    }

    //
    // docxConverter(`./uploads/${req.file.filename}`,`./uploads/${req.file.filename}.pdf`,function(err,result){
    //     if(err){
    //         console.log(err);
    //     }
    //     console.log('result'+result);
    // });

})

routers.post('/pdftoimg' , pdfToDocx.single('file') , (req, res) => {

    var pdfImage = new PDFImage(req.file.path);


    console.log(pdfImage)

    pdfImage.convertPage(0).then(function (imagePath) {
        // 0-th page (first page) of the slide.pdf is available as slide-0.png
        fs.existsSync(`./uploads/${req.file.path}`) // => true
    });
})
module.exports = routers