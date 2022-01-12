'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');

// const nodeExcel = require("excel-export");
const { ExportToCsv } = require("export-to-csv");
const { number } = require('joi');
const policy = db.policies;
const users = db.users;
const userPolicy = db.user_policies;

let policies = {};

policies.create = async (req, res) => {
    try {
        let { id, policyName, policyCode, registration, policyType, policyDuration, description, activStatus } = req.body;

        if (id != null && id != undefined && id != "") {
            let policyData = {
                policyName: policyName,
                policyCode: policyCode,
                registration: registration,
                policyType: policyType,
                policyDuration: policyDuration,
                activStatus: activStatus,
                description: description
            }
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
            let policyData = await validation.policy(req.body);

            if (policyData.message) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    massage: Constant.INVAILID_DATA,
                    data: policyData.message
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
        let { id, search, policyType, activStatus } = req.query;
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
                return obj.policyCount = 0;
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
            massage: "downloadType is Required.",
            data: {}
        });
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

                numberOfClaims: {
                    $like: `%${search}%`
                },
                // '$policies.policyName$': {
                //     $like: `%${search}%`
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

            let massage = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SUCCESS_CODE,
                massage: massage,
                data: result
            })
        }).catch(error => {
            console.log("error 11 ", error)
            return res.status(Constant.SERVER_ERROR).json({
                code: Constant.SERVER_ERROR,
                massage: Constant.SOMETHING_WENT_WRONG,
                data: error
            })
        })
    } catch (error) {
        console.log("error 22 ", error)

        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
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

policies.exportUserPolicyReport = async (req, res) => {
    let { search, policy_id, user_id, agent_id, premiumPlan, downloadType } = req.query;

    if (downloadType) {

        let conf = {};
        let data = []
        conf.cols = [{
            caption: "Policy Number",
            type: "string",
        }, {
            caption: "Policy Holder",
            type: "string",
        }, {
            caption: "Policy Start Date",
            type: "string",
        }, {
            caption: "Premium Plan",
            type: "string",
        }, {
            caption: "Premium Amount",
            type: "string",
        }, {
            caption: "Premium Status",
            type: "string",
        }, {
            caption: "Total Claims",
            type: "string",
        }];
        conf.rows = [];

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

                numberOfClaims: {
                    $like: `%${search}%`
                },

                '$user.firstName': {
                    $like: `%${search}%`
                },

                '$user.lastName': {
                    $like: `%${search}%`
                },

                '$policy.policyCode': {
                    $like: `%${search}%`
                },
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
                let policyCode = "";
                let holderName = "";
                let StartDate = "";
                let premiumPlan = "";
                let premiumAmount = "";
                let premiumStatus = "";
                let numberOfClaims = 0;

                if (item.policy.policyCode) {
                    policyCode = item.policy.policyCode;
                }

                if (item.user.firstName) {
                    holderName = item.user.firstName + " " + item.user.lastName;
                }

                if (item.policyStartDate) {
                    StartDate = item.policyStartDate;
                }

                if (item.premiumPlan) {
                    premiumPlan = item.premiumPlan;
                }

                if (item.premiumAmount) {
                    premiumAmount = item.premiumAmount;
                }

                if (item.premiumStatus) {
                    premiumStatus = item.premiumStatus;
                }

                if (item.numberOfClaims) {
                    numberOfClaims = item.numberOfClaims;
                }

                if (downloadType == 'csv') {
                    data.push({
                        "Policy Code": policyCode,
                        "Policy Holder": holderName,
                        "Policy Start Date": StartDate,
                        "Premium Plan": premiumPlan,
                        "Premium Amount": premiumAmount,
                        "Premium Status": premiumStatus,
                        "Total Claims": numberOfClaims
                    });
                } else {
                    row.push(policyCode, holderName, StartDate, premiumPlan, premiumAmount, premiumStatus, numberOfClaims);
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
                "attachment; filename=UserPolicyList." + downloadType
            );

            return res.end(result, "binary");
        });

    } else {
        return res.status(Constant.ERROR_CODE).json({
            code: Constant.ERROR_CODE,
            massage: "downloadType is Required.",
            data: {}
        });
    }
}

module.exports = policies;