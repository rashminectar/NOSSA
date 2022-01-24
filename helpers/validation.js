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
        userName: Joi.string().required()
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

validation.claim = async (data) => {
    const schema = Joi.object({
        userPolicy_id: Joi.number().required(),
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required(),
        address: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.complaint = async (data) => {
    const schema = Joi.object({
        userPolicy_id: Joi.number().required(),
        subject: Joi.string().required(),
        description: Joi.string().required(),
        complaintDate: Joi.required()
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
        city: Joi.string().required(),
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.client = async (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        policy_id: Joi.required(),
        policyStartDate: Joi.required(),
        policyMaturityDate: Joi.required(),
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