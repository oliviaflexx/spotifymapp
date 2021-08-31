const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    liked: Boolean,
});

module.exports = mongoose.model("Like", likeSchema);