const reimbursementMiddileware = {};
const Constant = require('../config/constant')
var db = require("../models");
const reimbursement = db.reimbursement_doctor_master

reimbursementMiddileware.checkDoctorAuthentication = (req, res, next) => {
    try {
        let { userId, role } = req.user;
        let { id } = req.body;
        if (role == 1 || role == 2) {
            next();
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.USER_NOT_AUTHORIZED,
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
module.exports = reimbursementMiddileware;
