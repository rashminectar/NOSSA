'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');
const users = db.users;
const policy = db.policies;
const complaints = db.complaints;
const userPolicy = db.user_policies;
const complaint = {};

complaint.getAllComplaint = async (req, res) => {
    try {
        let { search, policy_id, user_id, agent_id, verifyStatus } = req.query;
        let condition = {
            status: true
        }

        if (policy_id) {
            condition['$userPolicy.policy_id'] = policy_id;
        }

        if (user_id) {
            condition['$userPolicy.user_id'] = user_id;
        }

        if (agent_id) {
            condition['$userPolicy.agent_id'] = agent_id;
        }

        if (verifyStatus) {
            condition['verifyStatus'] = verifyStatus;
        }

        if (search) {
            condition['$or'] = {
                "$userPolicy.policy.policyName": {
                    $like: `%${search}%`
                },
                "$userPolicy.policy.policyCode": {
                    $like: `%${search}%`
                },
                "$userPolicy.user.firstName": {
                    $like: `%${search}%`
                },
                "complaintCode": {
                    $like: `%${search}%`
                },
                "verifyStatus": {
                    $like: `%${search}%`
                },
            }
        }

        complaints.findAll({
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
            console.log("error 1", error)

            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })
    } catch (error) {
        console.log("error ", error)
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }

}

complaint.add = async (req, res) => {
    try {
        let complaintData = await validation.complaint(req.body);

        if (complaintData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: complaintData.message
            })
        } else {
            complaintData.complaintCode = await utility.generateCode('CM', 'complaintId', 8);

            let result = await complaints.create(complaintData);

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
            data: error
        })
    }
}

complaint.edit = async (req, res) => {
    try {

        let { id, subject, description, complaintDate } = req.body;
        if (id) {
            complaints.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let complaintData = {
                        subject: subject,
                        description: description,
                        complaintDate: complaintDate,
                    }

                    await result.update(complaintData);
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.UPDATED_SUCCESS,
                        data: result
                    })
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.SOMETHING_WENT_WRONG,
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
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: "id is required.",
                data: {}
            })
        }

    } catch (error) {
        console.log("error ", error)
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

complaint.delete = async (req, res) => {
    try {
        let { id } = req.body;

        complaints.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let complaintData = {
                    status: 0
                }
                await result.update(complaintData);

                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DELETED_SUCCESS,
                    data: result
                })

            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: result
                })
            }

        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })

    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }
}

complaint.verifyRequest = async (req, res) => {
    try {
        let { verifyStatus, VerifiedDate, id } = req.body;
        complaints.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let complaintData = {
                    VerifiedDate: VerifiedDate,
                    verifyStatus: verifyStatus
                }
                await result.update(complaintData);
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.VERIFIED_SUCCESS,
                    data: result
                })
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: result
                })
            }
        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                message: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }
}

module.exports = complaint;