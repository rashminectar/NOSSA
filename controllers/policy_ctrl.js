'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const db = require("../models");
const Constant = require('../config/constant');
const policy = db.policies;
const users = db.users;
const userPolicy = db.user_policies;
const nodeExcel = require("excel-export");
const { ExportToCsv } = require("export-to-csv");
const { Sequelize, Op } = require("sequelize");

let policies = {};

policies.create = async (req, res) => {
    try {
        let { id } = req.body;
        let policyData = await validation.policy(req.body);
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
            policyData.policyCode = await utility.generatePolicyCode();
            let result = await policy.create(policyData);
            if (result) {
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    massage: Constant.SAVE_SUCCESS,
                    data: result
                })
            } else {
                console.log(result);
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    massage: Constant.SOMETHING_WENT_WRONG,
                    data: result
                })
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

policies.delete = async (req, res) => {
    try {
        let { id } = req.body;

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

policies.getAllPolicy = async (req, res) => {
    try {
        let { id, search, policyType } = req.body;
        let condition = {
            status: true
        }

        if (policyType) {
            condition['policyType'] = policyType;
        }

        if (id) {
            condition['id'] = id;
        }

        if (search) {
            condition['$or'] = {
                policyName: {
                    $like: `%${search}%`
                },
                policyCode: {
                    $like: `%${search}%`
                },
                registration: {
                    $like: `%${search}%`
                },
                policyType: {
                    $like: `%${search}%`
                },
                description: {
                    $like: `%${search}%`
                }
            }
        }

        policy.findAll({
            where: condition
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            result.map((obj) => {
                return obj.totalcount = 0;
            })
            let massage = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                massage: massage,
                data: result
            })
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

policies.exportReport = async (req, res) => {
    let { id, search, policyType, downloadType } = req.query;
    if (downloadType) {

        let conf = {};
        let data = []
        conf.cols = [{
            caption: "Policy Name",
            type: "string",
        }, {
            caption: "Policy Code",
            type: "string",
        }, {
            caption: "Registration",
            type: "string",
        }, {
            caption: "Policy Type",
            type: "string",
        }, {
            caption: "Description",
            type: "string",
        }];
        conf.rows = [];
        let condition = {
            status: true
        }

        if (policyType) {
            condition['policyType'] = policyType;
        }

        if (id) {
            condition['id'] = id;
        }

        if (search) {
            condition['$or'] = {
                policyName: {
                    $like: `%${search}%`
                },
                policyCode: {
                    $like: `%${search}%`
                },
                registration: {
                    $like: `%${search}%`
                },
                policyType: {
                    $like: `%${search}%`
                },
                description: {
                    $like: `%${search}%`
                }
            }
        }

        policy.findAll({ where: condition }).then(function (response) {
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
                let policyName = "";
                let policyCode = "";
                let registration = "";
                let policyType = "";
                let description = "";

                if (item.policyName) {
                    policyName = item.policyName;
                }

                if (item.policyCode) {
                    policyCode = item.policyCode;
                }

                if (item.registration) {
                    registration = item.registration;
                }

                if (item.policyType) {
                    policyType = item.policyType;
                }

                if (item.description) {
                    description = item.description;
                }

                if (downloadType == 'csv') {
                    data.push({
                        "Policy Name": policyName,
                        "Policy Code": policyCode,
                        "Registration": registration,
                        "PolicyType": policyType,
                        "Description": description
                    });
                } else {
                    row.push(policyName, policyCode, registration, policyType, description);
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
                "attachment; filename=PolicyList." + downloadType
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

policies.getAllUserPolicy = async (req, res) => {
    try {
        let { policy_id, user_id, agent_id } = req.body;

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

        if (search) {
            condition['$or'] = {
                premiumPlan: {
                    $like: `%${search}%`
                },
                premiumAmount: {
                    $like: `%${search}%`
                },
                policyStatus: {
                    $like: `%${search}%`
                },
                policyType: {
                    $like: `%${search}%`
                },
                description: {
                    $like: `%${search}%`
                }
            }
        }

        userPolicy.findAll({
            where: condition,
            include: [{
                model: policies,
                attributes: ["id", "policyName", "policyCode"],
                where: {
                    status: true
                }
            }, {
                model: users,
                as: "agent",
                attributes: ["id", "firstName", "lastName", "userName"],
                where: {
                    status: true
                }
            }, {
                model: users,
                as: "user",
                attributes: ["id", "firstName", "lastName", "userName"],
                where: {
                    status: true
                }
            }]
        }).then(result => {

            let massage = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SUCCESS_CODE,
                massage: massage,
                data: result
            })
        }).catch(error => {
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.ERROR_CODE,
                massage: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.ERROR_CODE,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }

}

module.exports = policies;