import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { Schema, model } from 'mongoose';

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Number,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        deletedAt: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

videoSchema.plugin(aggregatePaginate);

const Video = model('Video', videoSchema);
export default Video;
