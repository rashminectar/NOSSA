'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const Constant = require('../config/constant')

const db = require('../models');

const notification = db.notification_master;
const user_notification = db.user_notification;
const users = db.users;
const Op = db.Op;

// getting all notification information
const getNotification = async (req, res) => {
    try {
        let result = await notification.findAll({
            where: {
                status: true
            }
        })
        let message = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
        return res.status(Constant.SUCCESS_CODE).json({
            code: Constant.SUCCESS_CODE,
            message: message,
            data: result
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

// adding notification information
const addNotification = async (req, res) => {
    try {
        let objData = await validation.notification(req.body);
        if (objData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: objData.message
            })
        } else {
            let add = await notification.create(objData);
            if (add) {
                users.findAll({
                    where: {
                        status: true,
                        role: {
                            $in: [3, 4]
                        }
                    }
                }).then(function (resUser) {
                    if (resUser.length) {
                        let listUserNotification = [];
                        resUser.filter((obj) => {
                            listUserNotification.push({
                                user_id: obj.id,
                                notification_id: add.id,
                                textStatus: true,
                                emailStatus: true
                            })
                        })
                        if (listUserNotification) {
                            user_notification.bulkCreate(listUserNotification);
                        }
                    }
                })
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
            data: error.message
        })
    }
}

// updating notification information
const editNotification = async (req, res) => {
    try {
        let { id, name, isActive, emailBody, textBody } = req.body;

        if (id) {
            notification.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let objData = {
                        name: name,
                        isActive: isActive,
                        emailBody: emailBody,
                        textBody: textBody,
                    }

                    await result.update(objData);
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
                    data: error.message.message
                })
            })
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: "id is required.",
                data: {}
            })
        }
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message.message
        })
    }
}

// deleting notification information
const deleteNotification = async (req, res) => {
    try {
        let { id } = req.body;
        user_notification.findOne({
            where: {
                notification_id: id
            }
        }).then(async (result) => {
            if (result) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REFERENCE_AVAILABLE,
                    data: {}
                })
            } else {
                notification.findOne({
                    where: {
                        id: id,
                        status: true
                    }
                }).then(async (result) => {
                    if (result) {
                        let objData = {
                            status: false
                        }
                        await result.update(objData);

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

// getting all user notification information
const getUserNotification = async (req, res) => {
    try {
        let { userId, role } = req.user;
        let condition = {
            status: true
        }

        if (role == 3 || role == 4) {
            condition['user_id'] = userId;
        }

        let result = await user_notification.findAll({
            where: condition,
            include: [{
                model: notification,
                as: "notification"
            }],
        })
        let message = (result.length > 0) ? Constant.RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
        return res.status(Constant.SUCCESS_CODE).json({
            code: Constant.SUCCESS_CODE,
            message: message,
            data: result
        })
    } catch (error) {
        return res.status(Constant.SERVER_ERROR).json({
            code: Constant.SERVER_ERROR,
            message: Constant.SOMETHING_WENT_WRONG,
            data: error.message
        })
    }
}

// adding user notification information
const addUserNotification = async (req, res) => {
    try {
        let objData = await validation.userNotification(req.body);
        if (objData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: objData.message
            })
        } else {
            user_notification.findOne({
                where: {
                    user_id: objData.user_id,
                    notification_id: objData.notification_id
                }
            }).then(async (resData) => {
                if (resData) {
                    let add = await resData.update(objData);
                    if (add) {
                        return res.status(Constant.SUCCESS_CODE).json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.UPDATED_SUCCESS,
                            data: add
                        })
                    } else {
                        return res.status(Constant.ERROR_CODE).json({
                            code: Constant.ERROR_CODE,
                            message: Constant.SOMETHING_WENT_WRONG,
                            data: {}
                        })
                    }
                } else {
                    let add = await user_notification.create(objData);
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
            }).catch(async (error) => {
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

module.exports = {
    getNotification, addNotification, editNotification, deleteNotification,
    getUserNotification, addUserNotification
}