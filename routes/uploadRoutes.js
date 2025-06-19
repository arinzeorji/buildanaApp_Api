const express = require("express")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")

// const dotenv =  require("dotenv")
// dotenv.config();

require("dotenv").config(); //similar to both lines of code above

const router = express.Router();

//CLOUDINARY CONFIGURATION
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//MULTER SETUP
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("api/upload", upload.single("image"), async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No File Upload Found" })

        //FUNCTION TO HANDLE THE STREAM UPLOAD TO CLOUDINARY
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error)
                    }
                });

                //USE STREAMIFIER TO CONVERT THE FILE TO A STREAM
                streamifier.createReadStream(fileBuffer).pipe(stream);
            })
        }

        //CALL THE "streamUplaod" FUNCTION
        const result = await streamUpload(req.file.buffer);

        //RESPOND WITH THE UPLOADED IMAGE URL
        res.json({ imageUrl: result.secure_url })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error During File UPLAOD" })
    }
})

module.exports = router;