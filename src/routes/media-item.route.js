import express from 'express';

import fileUpload from '../controllers/media-item.controllers.js';
import upload from '../middlewares/multer.middlewares.js';

const mediaItemRoute = express.Router();

mediaItemRoute.post('/api/v1/media-item', upload.single('file'), fileUpload);

export default mediaItemRoute;
