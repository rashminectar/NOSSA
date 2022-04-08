'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');
const users = db.users;
const policy = db.policies;
const premium = db.premiums;
const userPolicy = db.user_policies;
const premiums = {};
const Op = db.Op;

premiums.getAllPremium = async (req, res) => {
    try {
        let { search, policy_id, user_id, agent_id } = req.query;
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
                "premiumAmount": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        premium.findAll({
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
                }],
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

premiums.payPremium = async (req, res) => {
    let { id, paymentType, paymentStatus, paymentDate } = req.body;
    let premiumData = {
        paymentType: paymentType,
        paymentStatus: paymentStatus,
        paymentDate: paymentDate,
        premiumStatus: 'Paid'
    }
    premium.findOne({
        where: {
            id: id
        }
    }).then(async (result) => {
        if (result) {
            premiumData.invoiceNumber = await utility.generateCode('INV', 'invoiceNum', 6);
            await result.update(premiumData);
            await userPolicy.update({
                premiumStatus: 'Paid',
                policyStatus: 1
            }, {
                where: {
                    id: result.userPolicy_id,
                    policyStatus: {
                        [Op.in]: [1, -1]
                    }
                }
            });
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
}

module.exports = premiums;