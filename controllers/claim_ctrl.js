'use strict'
const validation = require('../helpers/validation')
const claimMiddileware = require('../middileware/claim')
const utility = require('../helpers/utility')
var db = require("../models");
const Constant = require('../config/constant');
const users = db.users;
const policy = db.policies;
const claims = db.claims;
const userPolicy = db.user_policies;
const claimDetails = db.claim_details;
const claimDocuments = db.claim_documents;

const claim = {};
const Op = db.Op;

claim.getAllClaim = async (req, res) => {
    try {
        let { search, policy_id, user_id, agent_id, verifyStatus } = req.query;
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
                "claimCode": {
                    [Op.like]: `%${search}%`
                },
                "verifyStatus": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        claims.findAll({
            where: condition,
            include: [{
                model: claimDetails,
                as: "claim_details",
                required: false,
                where: {
                    status: true
                }
            }, {
                model: claimDocuments,
                as: "claim_documents",
                required: false,
                where: {
                    status: true
                }
            }, {
                model: userPolicy,
                as: 'userPolicy',
                where: {
                    status: true
                },
                attributes: ['policy_id', 'user_id', 'agent_id'],
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

claim.add = async (req, res) => {
    try {
        let claimData = await validation.claim(req.body);
        if (claimData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: claimData.message
            })
        } else {
            claimData.claimCode = await utility.generateCode('CR', 'claimId', 8);
            let { hospitalName, roomCategory, reason, injuryCause, dateInjury, dateAdmission, dateDischarge, preHospitalExpense, hospitalExpense, postHospitalExpense, healthCheckupExpense, ambulanceExpense, otherExpense, preHospitalDuration, postHospitaDuration, hospitalDailyCash, surgicalCash, criticalIllnessbenefit, convalescence, lumpSumBenefit, otherCharges, lumpSumBenefitDetail } = claimData;
            let claimDetailData = {
                hospitalName: hospitalName,
                roomCategory: roomCategory,
                reason: reason,
                injuryCause: injuryCause,
                dateInjury: dateInjury,
                dateAdmission: dateAdmission,
                dateDischarge: dateDischarge,
                preHospitalExpense: preHospitalExpense,
                hospitalExpense: hospitalExpense,
                postHospitalExpense: postHospitalExpense,
                healthCheckupExpense: healthCheckupExpense,
                ambulanceExpense: ambulanceExpense,
                otherExpense: otherExpense,
                preHospitalDuration: preHospitalDuration,
                postHospitaDuration: postHospitaDuration,
                hospitalDailyCash: hospitalDailyCash,
                surgicalCash: surgicalCash,
                criticalIllnessbenefit: criticalIllnessbenefit,
                convalescence: convalescence,
                lumpSumBenefit: lumpSumBenefit,
                otherCharges: otherCharges,
                lumpSumBenefitDetail: lumpSumBenefitDetail
            }

            let result = await claims.create(claimData);
            if (result) {
                claimDetailData.claim_id = result.id;
                await claimDetails.create(claimDetailData);
                if (req.files) {
                    let claimDocumentData = await utility.fileupload(req.files);
                    if (claimDocumentData.length > 0) {
                        claimDocumentData.filter(obj => {
                            obj.claim_id = result.id;
                        });
                        await claimDocuments.bulkCreate(claimDocumentData);
                    }
                }

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

claim.edit = async (req, res) => {
    try {
        let { id, claimCode, name, phone, email, address, assignedTo, coveredByOtherInsurance, diagnosis, companyName, policyNo, sumInsured, relationWithInsured, relationName, relationGender, relationDOB, relationAge, relationOccupation, relationAddress, relationPhone, relationEmail } = req.body;
        let { hospitalName, roomCategory, reason, injuryCause, dateInjury, dateAdmission, dateDischarge, preHospitalExpense, hospitalExpense, postHospitalExpense, healthCheckupExpense, ambulanceExpense, otherExpense, preHospitalDuration, postHospitaDuration, hospitalDailyCash, surgicalCash, criticalIllnessbenefit, convalescence, lumpSumBenefit, otherCharges, lumpSumBenefitDetail } = req.body;

        claims.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let claimData = {
                    claimCode: claimCode,
                    name: name,
                    phone: phone,
                    email: email,
                    address: address,
                    assignedTo: assignedTo,
                    coveredByOtherInsurance: coveredByOtherInsurance,
                    diagnosis: diagnosis,
                    companyName: companyName,
                    policyNo: policyNo,
                    sumInsured: sumInsured,
                    relationWithInsured: relationWithInsured,
                    relationName: relationName,
                    relationGender: relationGender,
                    relationDOB: relationDOB,
                    relationAge: relationAge,
                    relationOccupation: relationOccupation,
                    relationAddress: relationAddress,
                    relationPhone: relationPhone,
                    relationEmail: relationEmail
                }

                let claimDetailData = {
                    hospitalName: hospitalName,
                    roomCategory: roomCategory,
                    reason: reason,
                    injuryCause: injuryCause,
                    dateInjury: dateInjury,
                    dateAdmission: dateAdmission,
                    dateDischarge: dateDischarge,
                    preHospitalExpense: preHospitalExpense,
                    hospitalExpense: hospitalExpense,
                    postHospitalExpense: postHospitalExpense,
                    healthCheckupExpense: healthCheckupExpense,
                    ambulanceExpense: ambulanceExpense,
                    otherExpense: otherExpense,
                    preHospitalDuration: preHospitalDuration,
                    postHospitaDuration: postHospitaDuration,
                    hospitalDailyCash: hospitalDailyCash,
                    surgicalCash: surgicalCash,
                    criticalIllnessbenefit: criticalIllnessbenefit,
                    convalescence: convalescence,
                    lumpSumBenefit: lumpSumBenefit,
                    otherCharges: otherCharges,
                    lumpSumBenefitDetail: lumpSumBenefitDetail
                }

                await result.update(claimData);
                claimDetails.findOne({
                    where: {
                        claim_id: id
                    }
                }).then(async (resultDetail) => {
                    if (resultDetail) {
                        await resultDetail.update(claimDetailData);
                    } else {
                        await claimDetails.creat(claimDetailData);
                    }

                    if (req.files) {
                        let claimDocumentData = await utility.fileupload(req.files);

                        if (claimDocumentData.length) {
                            claimDocumentData.filter(obj => {
                                obj.claim_id = id;
                            })

                            let resultDocuments = await claimDocuments.findAll({
                                where: { claim_id: id, documentName: { [Op.in]: claimDocumentData.map(o => o['documentName']) } }
                            })

                            let listCreateDoc = [];

                            if (resultDocuments) {
                                async function updateDoc(i) {
                                    if (i < claimDocumentData.length) {
                                        let obj = claimDocumentData[i];
                                        let objExist = resultDocuments.find(element => element.documentName === obj.documentName);
                                        if (objExist) {
                                            await objExist.update({
                                                documentFile: obj.documentFile
                                            });
                                            updateDoc(i + 1);
                                        } else {
                                            listCreateDoc.push(obj);
                                            updateDoc(i + 1);
                                        }
                                    } else {
                                        if (listCreateDoc) {
                                            await claimDocuments.bulkCreate(listCreateDoc);
                                        }
                                    }
                                }
                                updateDoc(0);
                            } else {
                                await claimDocuments.bulkCreate(claimDocumentData);
                            }
                        }
                    }

                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.UPDATED_SUCCESS,
                        data: result
                    })
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

claim.delete = async (req, res) => {
    try {
        let { id } = req.body;

        claims.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let claimData = {
                    status: 0
                }
                await result.update(claimData)
                await claimDetails.update(claimData, { where: { claim_id: id } })
                await claimDocuments.update(claimData, { where: { claim_id: id } })

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

claim.verifyRequest = async (req, res) => {
    try {
        let { verifyStatus, id } = req.body;
        claims.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {
                let claimData = {
                    VerifiedDate: new Date(),
                    verifyStatus: verifyStatus
                }
                await result.update(claimData);
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

module.exports = claim;