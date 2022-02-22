'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');
const users = db.users;
const policy = db.policies;
const serviceRequests = db.service_request;
const userPolicy = db.user_policies;
const serviceRequest = {};
const Op = db.Op;

serviceRequest.getAllService = async (req, res) => {
    try {
        let { search, policy_id, user_id, agent_id, verifyStatus, serviceName } = req.query;
        let condition = {
            status: true
        }

        if (policy_id) {
            condition['$userPolicy.policy_id$'] = policy_id;
        }

        if (user_id) {
            condition['$userPolicy.user_id$'] = user_id;
        }

        if (agent_id) {
            condition['$userPolicy.agent_id$'] = agent_id;
        }

        if (verifyStatus) {
            condition['verifyStatus'] = verifyStatus;
        }

        if (serviceName) {
            condition['serviceName'] = serviceName;
        }

        if (search) {
            condition[Op.or] = {
                "$userPolicy.policy.policyName$": {
                    [Op.like]: `%${search}%`
                },
                "$userPolicy.policy.policyCode$": {
                    [Op.like]: `%${search}%`
                },
                "$userPolicy.user.firstName$": {
                    [Op.like]: `%${search}%`
                },
                "complaintCode": {
                    [Op.like]: `%${search}%`
                },
                "verifyStatus": {
                    [Op.like]: `%${search}%`
                },
                "serviceName": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        serviceRequests.findAll({
            where: condition,
            include: [{
                model: userPolicy,
                as: 'userPolicy',
                where: {
                    status: true
                },
                include: [{
                    model: users,
                    as: "agent",
                    attributes: ["firstName", "lastName", "userName", "email", "phone"],
                    where: {
                        status: true
                    }
                }, {
                    model: users,
                    as: "user",
                    attributes: ["firstName", "lastName", "userName", "email", "phone"],
                    where: {
                        status: true
                    }
                }, {
                    model: policy,
                    as: "policy",
                    where: {
                        status: true
                    }
                }]
            }]
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            let message = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                message: message,
                data: result
            })
        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error.message
            })
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

serviceRequest.add = async (req, res) => {
    try {
        let serviceRequestData = await validation.serviceRequest(req.body);

        if (serviceRequestData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: serviceRequestData.message
            })
        } else {
            serviceRequestData.serviceCode = await utility.generateCode('REQ_', 'serviceId', 10);
            serviceRequestData.date = new Date();
            let result = await serviceRequests.create(serviceRequestData);

            if (result) {
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.SAVE_SUCCESS,
                    data: result
                })
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: {}
                })
            }
        }

    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

serviceRequest.edit = async (req, res) => {
    try {
        let { id, serviceName, priorityStatus, description, assignedTo, assignedBy } = req.body;
        if (id) {
            serviceRequests.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let serviceRequestData = {
                        serviceName: serviceName,
                        priorityStatus: priorityStatus,
                        description: description,
                        assignedTo: assignedTo,
                        assignedBy: assignedBy
                    }

                    await result.update(serviceRequestData);
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.UPDATED_SUCCESS,
                        data: result
                    })
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.REQUEST_NOT_FOUND,
                        data: result
                    })
                }

            }).catch(error => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message.message
                })
            })
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: "id is required.",
                data: {}
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

serviceRequest.delete = async (req, res) => {
    try {
        let { id } = req.body;

        serviceRequests.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let serviceRequestData = {
                    status: 0
                }
                await result.update(serviceRequestData);

                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DELETED_SUCCESS,
                    data: result
                })

            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REQUEST_NOT_FOUND,
                    data: result
                })
            }

        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error.message
            })
        })

    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

serviceRequest.verifyRequest = async (req, res) => {
    try {
        let { verifyStatus, priorityStatus, id } = req.body;
        serviceRequests.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let serviceRequestData = {
                    VerifiedDate: new Date(),
                    priorityStatus: priorityStatus,
                    verifyStatus: verifyStatus
                }
                await result.update(serviceRequestData);
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.VERIFIED_SUCCESS,
                    data: result
                })
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REQUEST_NOT_FOUND,
                    data: result
                })
            }
        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error.message
            })
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

serviceRequest.assignRequest = async (req, res) => {
    try {
        let { assignedTo, id } = req.body;
        serviceRequests.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let serviceRequestData = {
                    VerifiedDate: new Date(),
                    assignedTo: assignedTo
                }
                await result.update(serviceRequestData);
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.VERIFIED_SUCCESS,
                    data: result
                })
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REQUEST_NOT_FOUND,
                    data: result
                })
            }
        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error.message
            })
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

module.exports = serviceRequest;