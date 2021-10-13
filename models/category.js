import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    createdAt: {
        type: Date,
        default: new Date
    }
});

const Category = mongoose.model('Catgeory',categorySchema);

export default Category;