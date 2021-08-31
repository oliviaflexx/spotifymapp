const Joi = require('joi');
const { number } = require('joi');

module.exports.songSchema = Joi.object({
    song: Joi.object({
        title: Joi.string().required(),
        artist: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required()
    }).required()
});
