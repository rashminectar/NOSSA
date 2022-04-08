'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');

const { number } = require('joi');
const policy = db.policies;
const users = db.users;
const userPolicy = db.user_policies;
const Sequelize = db.Sequelize;
const Op = db.Op;

let policies = {};

policies.create = async (req, res) => {
    try {
        let { id, policyName, policyCode, registration, policyType, policyDuration, description, activeStatus } = req.body;

        if (id != null && id != undefined && id != "") {
            let policyData = {
                policyName: policyName,
                policyCode: policyCode,
                registration: registration,
                policyType: policyType,
                policyDuration: policyDuration,
                activeStatus: activeStatus,
                description: description
            }
            policy.findOne({
                where: {
                    policyName: policyName,
                    status: true,
                    id: {
                        [Op.ne]: id
                    }
                }
            }).then(async (result) => {
                if (result) {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.REQUEST_ALREADY_EXIST,
                        data: result
                    })
                } else {
                    let resultData = await policy.update(policyData, {
                        where: {
                            id: id
                        }
                    })
                    if (resultData[0]) {
                        return res.status(Constant.SUCCESS_CODE).json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.UPDATED_SUCCESS,
                            data: result
                        })
                    } else {
                        return res.status(Constant.ERROR_CODE).json({
                            code: Constant.ERROR_CODE,
                            message: Constant.NO_DATA_FOUND,
                            data: null
                        })
                    }
                }
            }).catch(error => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message
                })
            })
        } else {
            let policyData = await validation.policy(req.body);

            if (policyData.message) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.INVAILID_DATA,
                    data: policyData.message
                })
            } else {
                policyData.policyCode = await utility.generateCode('NS', 'policyId', 6);
                let result = await policy.findOrCreate({
                    where: {
                        policyName: policyData.policyName
                    },
                    defaults: policyData
                });

                if (result && result[1]) {
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.SAVE_SUCCESS,
                        data: result[0]
                    })
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.REQUEST_ALREADY_EXIST,
                        data: result[0]
                    })
                }
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

policies.delete = async (req, res) => {
    try {
        let { id } = req.body;
        userPolicy.findOne({
            where: {
                policy_id: id
            }
        }).then(async (userPolicyData) => {
            if (!userPolicyData) {
                policy.findOne({
                    where: {
                        id: id
                    }
                }).then(async (result) => {
                    if (result) {
                        let policyData = {
                            status: 0
                        }
                        result.update(policyData)

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
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REFERENCE_AVAILABLE,
                    data: null
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

policies.getAllPolicy = async (req, res) => {
    try {
        let { id, search, policyType, activeStatus } = req.query;
        let condition = {
            status: true
        }

        if (policyType) {
            condition['policyType'] = policyType;
        }

        if (activeStatus != "" && activeStatus >= 0) {
            condition['activeStatus'] = parseInt(activeStatus);
        }

        if (id) {
            condition['id'] = id;
        }

        if (search) {
            condition[Op.or] = {
                policyName: {
                    [Op.like]: `%${search}%`
                },
                policyCode: {
                    [Op.like]: `%${search}%`
                },
                registration: {
                    [Op.like]: `%${search}%`
                },
                policyType: {
                    [Op.like]: `%${search}%`
                },
                description: {
                    [Op.like]: `%${search}%`
                }
            }
        }

        policy.findAll({
            attributes: {
                include: [[Sequelize.fn("COUNT", Sequelize.col("user_policies.id")), "policyCount"]]
            },
            where: condition,
            include: [{
                model: userPolicy,
                required: false,
                where: {
                    policyStatus: 1
                },
                as: "user_policies",
                attributes: []
            }],
            group: ['policies.id']
        }).then(result => {
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

policies.getAllUserPolicy = async (req, res) => {
    try {
        let { search, policy_id, user_id, agent_id, premiumPlan } = req.query;

        let condition = {
            status: true
        }

        if (policy_id) {
            condition['policy_id'] = policy_id;
        }

        if (user_id) {
            condition['user_id'] = user_id;
        }

        if (agent_id) {
            condition['agent_id'] = agent_id;
        }

        if (premiumPlan) {
            condition['premiumPlan'] = premiumPlan;
        }

        if (search) {
            condition[Op.or] = {
                premiumPlan: {
                    [Op.like]: `%${search}%`
                },
                premiumAmount: {
                    [Op.like]: `%${search}%`
                },
                policyStatus: {
                    [Op.like]: `%${search}%`
                },

                numberOfClaims: {
                    [Op.like]: `%${search}%`
                },
                // '$policies.policyName$': {
                //     [Op.like]: `%${search}%`
                // }
            }
        }

        userPolicy.findAll({
            where: condition,
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
        }).then(result => {

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

policies.createUserPolicy = async (req, res) => {
    try {
        let { id } = req.body;
        let userPolicyData = await validation.userPolicy(req.body);
        if (id != null && id != undefined && id != "") {
            policy.findOne({
                where: {
                    id: id
                }
            }).then(async (result) => {
                if (result) {
                    result.update(policyData)
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
                    data: error.message
                })
            })
        } else {
            let result = await policy.create(policyData);
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
                    data: result
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

module.exports = policies;