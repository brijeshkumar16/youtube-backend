import MediaItem from '../models/media-item.model.js';
import asyncHandler from '../utils/async-handler.js';
import ApiResponse from '../utils/api-response.js';

const fileUpload = asyncHandler(async (req, res) => {
  const mediaItem = await MediaItem.create({
    path: req.file.filename,
    source: process.env.FILE_UPLOAD_SOURCE,
    image: `${process.env.FILE_UPLOAD_SOURCE}/${req.file.filename}`,
  });
  res.status(201).json(new ApiResponse(201, mediaItem, 'File upload successfully'));
});

export default fileUpload;
