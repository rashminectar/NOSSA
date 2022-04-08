const Joi = require('joi');
const Constant = require('../config/constant')
var db = require("../models");
const claims = db.claims;
const userPolicy = db.user_policies;
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
    } catch (err) {
        return err;
    }
}

validation.complaint = async (data) => {
    const schema = Joi.object({
        userPolicy_id: Joi.number().required(),
        subject: Joi.string().required(),
        description: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.serviceRequest = async (data) => {
    const schema = Joi.object({
        userPolicy_id: Joi.number().required(),
        serviceName: Joi.string().required(),
        description: Joi.string().required(),
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
        premiumPlan: Joi.string().required(),
        premiumAmount: Joi.required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.reimbursement = async (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        name: Joi.string().required(),
        address: Joi.string().required(),
        area: Joi.string().required(),
        contact: Joi.required(),
        description: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.notification = async (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        emailBody: Joi.string().required(),
        textBody: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.userNotification = async (data) => {
    const schema = Joi.object({
        user_id: Joi.required(),
        notification_id: Joi.required(),
        textStatus: Joi.required(),
        emailStatus: Joi.required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.support = async (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        subject: Joi.string().required(),
        description: Joi.string().required(),
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.doctor = async (data) => {
    const schema = Joi.object({
        doctorName: Joi.string().required(),
        specialization: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.service = async (data) => {
    const schema = Joi.object({
        service: Joi.string().required()
    }).unknown();

    try {
        const value = await schema.validateAsync(data);
        return value;
    }
    catch (err) {
        return err;
    }
}

validation.changePassword = async (data) => {
    const schema = Joi.object({
        oldPassword: Joi.string().required(),
        password: Joi.string().required()
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