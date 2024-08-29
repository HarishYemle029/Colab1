const Joi = require('joi');

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
});

module.exports = { updatePasswordSchema };
