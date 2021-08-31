const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    liked: Boolean,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Like", likeSchema);