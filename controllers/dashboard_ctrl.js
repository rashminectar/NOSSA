'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const Constant = require('../config/constant')
const { QueryTypes } = require('sequelize');
const db = require('../models');
const users = db.users;
const userPolicy = db.user_policies;
const serviceRequests = db.service_request;
const claims = db.claims;
const claim_document = db.claim_documents;
const complaints = db.complaints;
const reimbursement_service_master = db.reimbursement_service_master;

var Sequelize = db.Sequelize;
var sequelize = db.sequelize;
const Op = db.Op;

// getting all dashboard information
const getDashboardData = async (req, res) => {
    try {
        let { role, userId } = req.user;
        if (role == 4) {
            let objResult = {
                totalPolicyCount: 0,
                numberOfClaims: 0,
                totalServiceRequestCount: 0,
            }
            userPolicy.findOne({
                where: {
                    user_id: userId,
                    status: true,
                    policyStatus: true
                },
                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "policyCount"],
                    [Sequelize.fn("SUM", Sequelize.col("numberOfClaims")), "numberOfClaims"],
                ]
            }).then(async (result) => {
                result = JSON.parse(JSON.stringify(result));

                objResult.totalPolicyCount = result.policyCount;
                objResult.numberOfClaims = parseInt(result.numberOfClaims);

                serviceRequests.count({
                    include: [{
                        model: userPolicy,
                        as: 'userPolicy',
                        where: {
                            status: true
                        },
                        attributes: []
                    }],
                    where: {
                        "$userPolicy.user_id$": userId,
                        status: true,
                    },
                }).then(async (requestCount) => {
                    objResult.totalServiceRequestCount = requestCount;

                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.RETRIEVE_SUCCESS,
                        data: objResult
                    })
                }).catch(async (error) => {
                    return res.status(Constant.SERVER_ERROR).json({
                        code: Constant.SERVER_ERROR,
                        message: Constant.SOMETHING_WENT_WRONG,
                        data: error.message
                    })
                })
            }).catch(async (error) => {
                return res.status(Constant.SERVER_ERROR).json({
                    code: Constant.SERVER_ERROR,
                    message: Constant.SOMETHING_WENT_WRONG,
                    data: error.message
                })
            })
        } else {
            let condition = {
                status: true
            }

            let policyCondition = {
                status: true
            }

            let models = [];

            if (role == 3) {
                condition['$userPolicy.agent_id$'] = userId;
                policyCondition['agent_id'] = userId;
                models.push({
                    model: userPolicy,
                    as: 'userPolicy',
                    attributes: []
                })
            }

            let objResult = {
                totalPolicy: 0,
                totalClaims: 0,
                totalClaimSettled: 0,
                totalServiceRequest: 0,
                totalComplaints: 0,
                totalOpenComplaints: 0,
                totalResolvedComplaints: 0,
                totalInvoice: 0
            }

            objResult.totalPolicy = await userPolicy.count({
                where: policyCondition
            })

            objResult.totalServiceRequest = await serviceRequests.count({
                include: models,
                where: condition
            });

            let resClaim = await claims.findAll({
                include: models,
                where: condition,
                attributes: ['verifyStatus',
                    [Sequelize.fn("COUNT", Sequelize.col("claims.id")), "totalClaims"]
                ],
                group: ['verifyStatus']
            });

            let claimData = JSON.parse(JSON.stringify(resClaim));

            objResult.totalClaims = claimData.reduce((total, obj) => {
                return total + obj.totalClaims;
            }, 0);

            let settledClaim = claimData.find(obj => obj.verifyStatus == 'Approved');
            objResult.totalClaimSettled = settledClaim ? settledClaim.totalClaims : 0;

            let resComplaint = await complaints.findAll({
                include: models,
                where: condition,
                attributes: ['verifyStatus',
                    [Sequelize.fn("COUNT", Sequelize.col("complaints.id")), "totalComplaints"]
                ],
                group: ['verifyStatus']
            });

            let complaintData = JSON.parse(JSON.stringify(resComplaint));

            objResult.totalComplaints = complaintData.reduce((total, obj) => {
                return total + obj.totalComplaints;
            }, 0);

            let OpenComplaints = complaintData.find(obj => obj.verifyStatus == 'Pending');
            objResult.totalOpenComplaints = OpenComplaints ? OpenComplaints.totalComplaints : 0;

            let ResolvedComplaints = complaintData.find(obj => obj.verifyStatus == 'Approved');
            objResult.totalResolvedComplaints = ResolvedComplaints ? ResolvedComplaints.totalComplaints : 0;
            if (role != 3) {
                objResult["totalAgent"] = await users.count({
                    where: {
                        role: 3,
                        status: true
                    }
                })
            }

            let policyQuery = "SELECT tp.policyCode, tp.policyName, tp.policyType, count(tup.id) as totalSales" +
                " FROM user_policies as tup" +
                " Inner join policies as tp on tp.id = tup.policy_id" +
                " group by tup.policy_id order by count(tup.id) desc limit 2"

            const bestPolicy = await sequelize.query(policyQuery, { type: QueryTypes.SELECT });

            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                message: Constant.RETRIEVE_SUCCESS,
                data: objResult,
                bestPolicy: bestPolicy
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

const getDashboardChartData = async (req, res) => {
    try {
        let { role, userId } = req.user;
        let condition = "";
        let conditionClaim = "";
        if (role != 4) {

            if (role == 3) {
                condition += " WHERE agent_id = " + userId;
                conditionClaim += " AND tup.agent_id = " + userId;
            }

            let policyQuery = "SELECT count(id) as totalSales, MONTH(createdAt) as month, YEAR(createdAt) as year " +
                " FROM user_policies " + condition +
                " GROUP BY MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)";

            const policyChart = await sequelize.query(policyQuery, { type: QueryTypes.SELECT });


            let claimQuery = "SELECT count(tc.id) as totalClaim, MONTH(tc.VerifiedDate) as month, YEAR(tc.VerifiedDate) as year FROM claims AS tc ";
            if (role == 3) {
                claimQuery += " INNER JOIN user_policies as tup on tup.id = tc.userPolicy_id";
            }
            claimQuery += " WHERE tc.verifyStatus = 'Approved' " + conditionClaim;
            claimQuery += " GROUP BY MONTH(tc.VerifiedDate) ORDER BY YEAR(tc.VerifiedDate), MONTH(tc.VerifiedDate) ";

            const claimChart = await sequelize.query(claimQuery, { type: QueryTypes.SELECT });

            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                message: Constant.RETRIEVE_SUCCESS,
                data: { policyChart: policyChart, claimChart: claimChart }
            })
        } else {
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                message: Constant.REQUEST_NOT_FOUND,
                data: {}
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

module.exports = {
    getDashboardData, getDashboardChartData
}