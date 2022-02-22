'use strict'
const serviceRequestMiddileware = {};
const Constant = require('../config/constant')
var db = require("../models");
const serviceRequest = db.service_request;
const userPolicy = db.user_policies;

serviceRequestMiddileware.checkServiceCreateAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { userPolicy_id } = req.body;
        if (role == 4 && userPolicy_id) {
            userPolicy.findOne({
                where: {
                    id: userPolicy_id,
                    status: true
                }
            }).then((result) => {
                if (result && result.user_id == userId) {
                    next();
                } else {
                    return res.status(Constant.INVALID_CODE).json({
                        code: Constant.INVALID_CODE,
                        message: Constant.USER_NOT_AUTHORIZED,
                        data: null
                    })
                }
            }).catch((error) => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message.message
                })
            })
        } else {
            return res.status(Constant.INVALID_CODE).json({
                code: Constant.INVALID_CODE,
                message: Constant.USER_NOT_AUTHORIZED,
                data: null
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message.message
        })
    }
}

serviceRequestMiddileware.checkServiceDeleteAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { id } = req.body;
        if (role == 1 || role == 2) {
            next();
        } else {
            serviceRequest.findOne({
                where: { id: id, status: true },
                include: [{
                    model: userPolicy,
                    as: 'userPolicy',
                    where: { status: true },
                    attributes: ['user_id', 'policy_id', 'agent_id']
                }]
            }).then((result) => {
                if (result && result.userPolicy && result.userPolicy.user_id == userId) {
                    next();
                } else {
                    return res.status(Constant.INVALID_CODE).json({
                        code: Constant.INVALID_CODE,
                        message: Constant.USER_NOT_AUTHORIZED,
                        data: null
                    })
                }
            }).catch((error) => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message.message
                })
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message.message
        })
    }
}

serviceRequestMiddileware.checkServiceVerifyAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { id } = req.body;
        if ((role === 1 || role === 2)) {
            next();
        } else if (role === 3) {
            serviceRequest.findOne({
                where: { id: id, status: true },
                include: [{
                    model: userPolicy,
                    as: 'userPolicy',
                    where: { status: true },
                    attributes: ['user_id', 'policy_id', 'agent_id']
                }]
            }).then((result) => {
                if (result && result.userPolicy && result.userPolicy.agent_id == userId) {
                    next();
                } else {
                    return res.status(Constant.INVALID_CODE).json({
                        code: Constant.INVALID_CODE,
                        message: Constant.USER_NOT_AUTHORIZED,
                        data: null
                    })
                }
            }).catch((error) => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message.message
                })
            })
        } else {
            return res.status(Constant.INVALID_CODE).json({
                code: Constant.INVALID_CODE,
                message: Constant.USER_NOT_AUTHORIZED,
                data: null
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message.message
        })
    }
}

serviceRequestMiddileware.checkServiceGetAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        // let { agent_id, user_id } = req.query;
        if (role === 1 || role === 2) {
            next();
        } else if (role === 3) {
            req.query.agent_id = userId;
            next();
        } else if (role === 4) {
            req.query.user_id = userId;
            next();
        } else {
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.INVALID_CODE,
                message: Constant.USER_NOT_AUTHORIZED,
                data: null
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message.message
        })
    }
}

module.exports = serviceRequestMiddileware;