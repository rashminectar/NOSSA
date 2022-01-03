const Joi = require('joi');

var validation = {};

validation.checkUserData = async (data) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        email: Joi.string().email().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    } catch (err) {
        return err;
    }
}


validation.userLogin = async (data) => {
    const schema = Joi.object({
        password: Joi.string().required(),
        username: Joi.string().email().required()
    })

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}


module.exports = validation;