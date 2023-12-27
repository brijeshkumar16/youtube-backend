import MediaItem from '../models/media-item.model.js';
import dbService from '../utils/db-service.js';

const fileUpload = async (req, res) => {
    try {
        const mediaItem = await dbService.create(MediaItem, {
            path: req.file.filename,
            source: process.env.FILE_UPLOAD_SOURCE,
            image: `${process.env.FILE_UPLOAD_SOURCE}/${req.file.filename}`,
        });
        return res.success({ data: mediaItem, message: 'File upload successfully' });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

export default fileUpload;
