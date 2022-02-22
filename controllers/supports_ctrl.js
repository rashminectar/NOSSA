'use strict'
const validation = require('../helpers/validation')

const db = require('../models');
const supports = db.supports;
const Constant = require("../config/constant");

const Supports = {};
const Op = db.Op;

Supports.add = async (req, res) => {
    try {
        let objData = await validation.support(req.body);
        if (objData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: objData.message
            })
        } else {
            let add = await supports.create(objData)
            if (add) {
                return res.status(Constant.SUCCESS_CODE).json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.SAVE_SUCCESS,
                    data: add
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
            data: error.message,
        });
    }
}

Supports.edit = async (req, res) => {
    try {
        let { id } = req.body;
        let edit = await supports.update(req.body, { where: { id: id } })
        res.status(200).send(edit)

    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error,
        });
    }
}

Supports.delete = async (req, res) => {
    try {
        let { id } = req.body
        await supports.destroy({ where: { id: id } })
        res.status(200).send("deleted");
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error,
        });
    }
}

Supports.get = async (req, res) => {
    try {
        let { search, type } = req.query
        let condition = {
            status: true
        }
        if (type) {
            condition['type'] = type
        }

        if (search) {
            condition[Op.or] = {
                "type": {
                    [Op.like]: `%${search}%`
                },
                "email": {
                    [Op.like]: `%${search}%`
                },
                "phone": {
                    [Op.like]: `%${search}%`
                },
                "name": {
                    [Op.like]: `%${search}%`
                },
                "subject": {
                    [Op.like]: `%${search}%`
                },
                "description": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        supports.findAll({
            where: condition
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
                data: error
            })
        })
    } catch (error) {
        return res.json({
            code: Constant.ERROR_CODE,
            massage: Constant.SOMETHING_WENT_WRONG,
            data: error
        })
    }
}


module.exports = Supports;
