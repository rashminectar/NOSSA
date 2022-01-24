'use strict'
const middileware = {};
const jwt = require('jsonwebtoken');
const Constant = require('../config/constant')
const SECRET = process.env.SECRET;

middileware.checkAuthentication = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const decoded = jwt.verify(authorization, SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(Constant.INVALID_CODE).json({
            code: Constant.INVALID_CODE,
            message: Constant.INVALID_TOKEN,
            data: null
        })
    }
}

middileware.checkClientCreateAuthentication = (req, res, next) => {
    try {
        let { role } = req.user;
        if (role == 3) {
            next();
        } else {
            return res.status(Constant.INVALID_CODE).json({
                code: Constant.INVALID_CODE,
                message: Constant.USER_NOT_AUTHORIZED,
                data: null
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.INVALID_TOKEN,
            data: null
        })
    }
}

module.exports = middileware;