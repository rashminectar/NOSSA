const Joi = require('joi');

var validation = {};

validation.checkUserData = async (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
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
        userName: Joi.string().email().required()
    })

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.policy = async (data) => {
    const schema = Joi.object({
        policyName: Joi.string().required(),
        registration: Joi.string().required(),
        policyType: Joi.string().required(),
        description: Joi.string()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.userPolicy = async (data) => {
    const schema = Joi.object({
        policyName: Joi.string().required(),
        registration: Joi.string().required(),
        policyType: Joi.string().required(),
        description: Joi.string()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.agent = async (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        city: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

module.exports = validation;