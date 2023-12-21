import { Router } from 'express';

import fileUpload from '../controllers/media-item.controller.js';
import upload from '../middlewares/multer.middlewares.js';
import auth from '../middlewares/auth.middlewares.js';

const mediaItemRoute = Router();

mediaItemRoute.post('/', auth, upload.single('file'), fileUpload);

export default mediaItemRoute;
