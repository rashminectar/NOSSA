'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const db = require("../models");
const bcrypt = require('bcryptjs');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize;
const salt = bcrypt.genSaltSync(10);
const users = db.users;
const Constant = require('../config/constant')
const mail = require('../helpers/mail')

const userPolicy = db.user_policies;
let client = {};
const Op = db.Op;

client.add = async (req, res) => {
    try {
        const t = await sequelize.transaction();
        let clientData = await validation.client(req.body);
        if (clientData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: clientData.message
            })
        } else {
            users.findOne({
                where: {
                    status: true,
                    email: clientData.email
                }
            }).then(async (resUser) => {
                if (!resUser) {
                    clientData.role = 4;
                    clientData.userName = await utility.generateCode('CD', 'clientId', 6);
                    let password = utility.randomString(6);
                    clientData.password = bcrypt.hashSync(password, salt);

                    let objMail = {
                        userName: clientData.userName,
                        password: password,
                        email: clientData.email,
                    }

                    let { policy_id, premiumPlan, premiumAmount, policyStartDate, policyMaturityDate } = req.body;

                    let clientPolicyData = {
                        policy_id: policy_id,
                        agent_id: req.user.userId,
                        premiumPlan: premiumPlan,
                        premiumAmount: premiumAmount,
                        policyStartDate: policyStartDate,
                        policyMaturityDate: policyMaturityDate,
                        premiumStatus: "Paid"
                    }

                    let result = await users.create(clientData, { transaction: t });
                    if (result) {

                        clientPolicyData.user_id = result.id;
                        await mail.sendWelcomeMail(objMail);

                        let resultPolicy = await userPolicy.create(clientPolicyData, { transaction: t });

                        if (resultPolicy) {
                            await t.commit();
                            return res.status(Constant.SUCCESS_CODE).json({
                                code: Constant.SUCCESS_CODE,
                                message: Constant.SAVE_SUCCESS,
                                data: result
                            })
                        } else {
                            await t.rollback();
                            return res.status(Constant.ERROR_CODE).json({
                                code: Constant.ERROR_CODE,
                                message: Constant.SOMETHING_WENT_WRONG,
                                data: result
                            })
                        }
                    } else {
                        await t.rollback();
                        return res.status(Constant.ERROR_CODE).json({
                            code: Constant.ERROR_CODE,
                            message: Constant.SOMETHING_WENT_WRONG,
                            data: result
                        })
                    }
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.EMAIL_ALREADY_REGISTERED,
                        data: {}
                    })
                }
            }).catch(async (error) => {
                await t.rollback();
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

client.delete = async (req, res) => {
    try {
        let { id } = req.body;

        users.findOne({
            where: {
                id: id
            }
        }).then(async (result) => {
            if (result) {
                let clientData = {
                    status: 0
                }
                result.update(clientData)

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

client.getAllClient = async (req, res) => {
    try {
        let { id, search } = req.query;
        let condition = {
            status: true,
            role: 3
        }

        if (id) {
            condition['id'] = id;
        }

        if (search) {
            condition[Op.or] = {
                firstName: {
                    [Op.like]: `%${search}%`
                },
                lastName: {
                    [Op.like]: `%${search}%`
                },
                userName: {
                    [Op.like]: `%${search}%`
                },
            }
        }

        users.findAll({
            attributes: {
                include: [[Sequelize.fn("COUNT", Sequelize.col("user_policies.id")), "totalClient"]]
            },
            where: condition,
            include: [{
                model: userPolicy,
                as: "user_policies",
                attributes: []
            }],
            group: ['users.id']
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            result.map((obj) => {
                obj.totalComplaint = 0;
                obj.totalResolvedComplaint = 0;
                return obj;
            })
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

module.exports = client;