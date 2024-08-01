const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Media = require('../models/media');
const router = express.Router();
const { promisify } = require('util');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Convert Cloudinary's upload_stream to return a promise
const uploadToCloudinary = async (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(fileBuffer);
    });
};

router.post('/', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!req.files || !req.files.thumbnail || !req.files.video) {
            return res.status(400).json({ error: 'Files are missing' });
        }

        // Upload the thumbnail to Cloudinary
        const thumbnailResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
            resource_type: 'image',
            folder: 'thumbnails',
        });

        // Upload the video to Cloudinary
        const videoResult = await uploadToCloudinary(req.files.video[0].buffer, {
            resource_type: 'video',
            folder: 'videos',
        });

        // Create a new Media document
        const newMedia = new Media({
            title,
            description,
            thumbnailUrl: thumbnailResult.secure_url,
            videoUrl: videoResult.secure_url,
        });

        // Save the document to MongoDB
        const savedMedia = await newMedia.save();
        res.status(201).json(savedMedia);

    } catch (error) {
        console.error('MongoDB Save Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const mediaList = await Media.find();
        res.json(mediaList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        res.json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
