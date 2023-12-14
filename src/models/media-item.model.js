import { Schema, model } from 'mongoose';

const mediaItemSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const MediaItem = model('MediaItem', mediaItemSchema);

export default MediaItem;
