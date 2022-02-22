'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const mail = require('../helpers/mail')
const db = require("../models");
const bcrypt = require('bcryptjs');
var Sequelize = require("sequelize");
const salt = bcrypt.genSaltSync(10);
const users = db.users;
const Constant = require('../config/constant')
const userPolicy = db.user_policies;
const Op = db.Op;
let agent = {};

agent.create = async (req, res) => {
    try {
        let { id, firstName, lastName, email, gendar, phone, dob, currentAddress, permanentAddress, city, activeStatus, profileImg } = req.body;
        users.findOne({
            where: {
                status: true,
                email: email
            }
        }).then(async (resUser) => {
            // if (!resUser) {
            if (id != null && id != undefined && id != "") {
                if (resUser && resUser.id != id) {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.EMAIL_ALREADY_REGISTERED,
                        data: {}
                    })
                } else {
                    let agentData = {
                        lastName: lastName,
                        firstName: firstName,
                        email: email,
                        gendar: gendar,
                        phone: phone,
                        dob: dob,
                        currentAddress: currentAddress,
                        permanentAddress: permanentAddress,
                        city: city,
                        activeStatus: activeStatus,
                    }
                    users.findOne({
                        where: {
                            id: id
                        }
                    }).then(async (result) => {
                        if (result) {
                            if (profileImg) {
                                agentData.profileImg = await utility.uploadBase64Image(profileImg);
                            }
                            result.update(agentData)
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

            } else {
                if (!resUser) {
                    let agentData = await validation.agent(req.body);
                    if (agentData.message) {
                        return res.status(Constant.ERROR_CODE).json({
                            code: Constant.ERROR_CODE,
                            message: Constant.INVAILID_DATA,
                            data: agentData.message
                        })
                    } else {
                        agentData.role = 3;
                        agentData.userName = await utility.generateCode('NA', 'agentId', 6);
                        let password = utility.randomString(6);
                        agentData.password = bcrypt.hashSync(password, salt);
                        if (profileImg) {
                            agentData.profileImg = await utility.uploadBase64Image(profileImg);
                        }
                        let objMail = {
                            userName: agentData.userName,
                            password: password,
                            email: agentData.email,
                        }
                        let result = await users.create(agentData);
                        if (result) {
                            await mail.sendWelcomeMail(objMail);
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
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.EMAIL_ALREADY_REGISTERED,
                        data: {}
                    })
                }
            }
            // } else {
            //     return res.status(Constant.ERROR_CODE).json({
            //         code: Constant.ERROR_CODE,
            //         message: Constant.EMAIL_ALREADY_REGISTERED,
            //         data: {}
            //     })
            // }
        }).catch(async (error) => {
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

agent.delete = async (req, res) => {
    try {
        let { id } = req.body;

        users.findOne({
            where: {
                id: id
            }
        }).then(async (result) => {
            if (result) {
                let agentData = {
                    status: 0
                }
                result.update(agentData)

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

agent.getAllAgent = async (req, res) => {
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

module.exports = agent;