
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
var converter = require('office-converter')();
const { fromPath } = require('pdf2pic');
const {exec} = require('child_process')





const imgOptions = {
    density: 100,
    saveFilename: "untitled",
    savePath: "./images",
    format: "png",
    width: 600,
    height: 600
};






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



const pdfImageFilter = function (req, file, cb) {
    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
};

var imageToPDF = multer({ storage: storage, fileFilter: pdfImageFilter });




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

// routers.post('/pdftoimg' , pdfToDocx.single('file') , (req, res) => {
//
//
//     const options = {
//         density: 100,
//         saveFilename: "untitled",
//         savePath: "./uploads",
//         format: "png",
//         width: 600,
//         height: 600
//     };
//     const storeAsImage = fromPath(req.file.path, options);
//     const pageToConvertAsImage = 1;
//
//     storeAsImage(pageToConvertAsImage).then((resolve) => {
//         console.log("Page 1 is now converted as image");
//
//         return resolve;
//     });
//
//
//
// })

// routers.post('/officetopdf' , pdfToDocx.single('file') , async (req , res) => {
//     let path = `./${req.file.path}`
//     var wordBuffer = fs.readFileSync(path)
//
//
//     var pdfBuffer = await toPdf(wordBuffer)
//     // return res.status(200).json({
//     //     success: true,
//     //     file : pdfBuffer,
//     //     message: 'your request has been submitted'
//     // })
//     res.send(pdfBuffer)
//
//
//     // converter.generatePdf(req.file.filename, function(err, result) {
//     //     console.log(err)
//     //     if (result?.status === 0) {
//     //         console.log('Output File located at ' + result.outputFile);
//     //     }
//     // });
//
//
//
//
// } )
//
//
// routers.post("/imageToPDF", imageToPDF.array("files", 1000), (req, res) => {
//     list = "";
//     if (req.files) {
//         req.files.forEach((file) => {
//             list += `${file.path}`;
//             list += " ";
//         });
//
//         console.log(list);
//
//         const outputFilePath = Date.now() +'output.pdf'
//
//         exec(`magick convert ${list} ${outputFilePath}`, (err, stderr, stdout) => {
//             if (err) throw err;
//
//             res.download(outputFilePath, (err) => {
//                 if (err) throw err;
//
//                 req.files.forEach((file) => {
//                     fs.unlinkSync(file.path);
//                 });
//
//                 fs.unlinkSync(outputFilePath);
//             });
//         });
//     }
// });





module.exports = routers