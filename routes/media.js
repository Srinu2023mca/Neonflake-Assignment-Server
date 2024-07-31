const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Media = require('../models/media');
const router = express.Router();
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), async (req, res) => {
    try {
        const { title, description } = req.body;

        const thumbnailResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'thumbnails' },
            (error, result) => {
                if (error) throw error;
                return result;
            }
        ).end(req.files.thumbnail[0].buffer);

        const videoResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'video', folder: 'videos' },
            (error, result) => {
                if (error) throw error;
                return result;
            }
        ).end(req.files.video[0].buffer);

        const newMedia = new Media({
            title,
            description,
            thumbnailUrl: thumbnailResult.secure_url,
            videoUrl: videoResult.secure_url,
        });

        await newMedia.save();
        res.status(201).json(newMedia);
    } catch (error) {
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
