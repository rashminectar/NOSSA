'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const db = require("../models");
const bcrypt = require('bcryptjs');
var Sequelize = require("sequelize");
const salt = bcrypt.genSaltSync(10);
const users = db.users;
const Constant = require('../config/constant')
const mailer = require('../lib/mailer');
const userPolicy = db.user_policies;
let agent = {};

agent.create = async (req, res) => {
    try {
        let { id, firstName, lastName, email, gendar, phone, dob, currentAddress, permanentAddress, city, activeStatus } = req.body;

        if (id != null && id != undefined && id != "") {
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
                    result.update(agentData)
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        massage: Constant.UPDATED_SUCCESS,
                        data: result
                    })

                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        massage: Constant.SOMETHING_WENT_WRONG,
                        data: result
                    })
                }
            }).catch(error => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    massage: Constant.SOMETHING_WENT_WRONG,
                    data: error
                })
            })
        } else {

            let agentData = await validation.agent(req.body);
            if (agentData.message) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    massage: Constant.INVAILID_DATA,
                    data: agentData.message
                })
            } else {
                agentData.role = 3;
                agentData.userName = await utility.generateAgentCode();
                let result = await users.create(agentData);
                if (result) {
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        massage: Constant.SAVE_SUCCESS,
                        data: result
                    })
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        massage: Constant.SOMETHING_WENT_WRONG,
                        data: result
                    })
                }
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
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
                    massage: Constant.DELETED_SUCCESS,
                    data: result
                })

            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    massage: Constant.SOMETHING_WENT_WRONG,
                    data: result
                })
            }

        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                massage: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })

    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
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
            condition['$or'] = {
                firstName: {
                    $like: `%${search}%`
                },
                lastName: {
                    $like: `%${search}%`
                },
                userName: {
                    $like: `%${search}%`
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
            let massage = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                massage: massage,
                data: result
            })
        }).catch(error => {
            console.log("11 ", error)
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                massage: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })
    } catch (error) {
        console.log("22 ", error)

        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }

}

agent.exportReport = async (req, res) => {
    let { search, downloadType } = req.query;
    if (downloadType) {

        let conf = {};
        let data = []
        conf.cols = [{
            caption: "HR Name",
            type: "string",
        }, {
            caption: "HR Code",
            type: "string",
        }, {
            caption: "Clients",
            type: "string",
        }, {
            caption: "Complaint Assigned",
            type: "string",
        }, {
            caption: "Complaint Resolved",
            type: "string",
        }];
        conf.rows = [];
        let condition = {
            status: true
        }

        if (id) {
            condition['id'] = id;
        }

        if (search) {
            condition['$or'] = {
                firstName: {
                    $like: `%${search}%`
                },
                lastName: {
                    $like: `%${search}%`
                },
                userName: {
                    $like: `%${search}%`
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
        }).then(function (response) {
            const optionsCSV = {
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalSeparator: '.',
                showLabels: true,
                showTitle: true,
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: true,
            };


            response.forEach(function (item, index, arr) {
                let row = [];
                let name = "";
                let userName = "";
                let totalClient = "";
                let totalComplaint = "";
                let totalResolvedComplaint = "";

                if (item.firstName) {
                    name = item.firstName + " " + item.lastName;
                }

                if (item.userName) {
                    userName = item.userName;
                }

                if (item.totalClient) {
                    totalClient = item.totalClient;
                }

                if (item.totalComplaint) {
                    totalComplaint = item.totalComplaint;
                }

                if (item.totalResolvedComplaint) {
                    totalResolvedComplaint = item.totalResolvedComplaint;
                }

                if (downloadType == 'csv') {
                    data.push({
                        "HR Name": name,
                        "HR Code": userName,
                        "Clients": totalClient,
                        "Complaint Assigned": totalComplaint,
                        "Complaint Resolved": totalResolvedComplaint
                    });
                } else {
                    row.push(name, userName, totalClient, totalComplaint, totalResolvedComplaint);
                    conf.rows.push(row);
                }
            })

            let result;
            if (downloadType == 'csv') {
                const csvExporter = new ExportToCsv(optionsCSV);
                result = csvExporter.generateCsv(data, true);
            } else {
                result = nodeExcel.execute(conf);

            }

            res.setHeader("Content-Type", "application/vnd.openxmlformats");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=HRList." + downloadType
            );

            return res.end(result, "binary");
        });

    } else {
        return res.status(Constant.ERROR_CODE).json({
            code: Constant.ERROR_CODE,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: {}
        });
    }
}

module.exports = agent;