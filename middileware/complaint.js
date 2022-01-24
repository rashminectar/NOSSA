'use strict'
const complaintMiddileware = {};
const Constant = require('../config/constant')
var db = require("../models");
const complaints = db.complaints;
const userPolicy = db.user_policies;

complaintMiddileware.checkComplaintCreateAuthentication = (req, res, next) => {
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
                    data: error.message
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
            data: error.message
        })
    }
}

complaintMiddileware.checkComplaintDeleteAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { id } = req.body;
        if (role == 1 || role == 2) {
            next();
        } else {
            complaints.findOne({
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
                    data: error.message
                })
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

complaintMiddileware.checkComplaintVerifyAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { id } = req.body;
        if ((role === 1 || role === 2)) {
            next();
        } else if (role === 3) {
            complaints.findOne({
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
                    data: error.message
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
            data: error.message
        })
    }
}

complaintMiddileware.checkComplaintGetAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { agent_id, user_id } = req.query;
        if ((role === 1 || role === 2)
            || (role === 3 && agent_id == userId)
            || (role === 4 && user_id == userId)) {
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
            data: error.message
        })
    }
}

module.exports = complaintMiddileware;