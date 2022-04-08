'use strict'
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const Constant = require('../config/constant')

const db = require('../models');

const reimbursement_doctor_master = db.reimbursement_doctor_master;
const reimbursement_doctors = db.reimbursement_doctors;
const reimbursement = db.reimbursement;
const reimbursement_service_master = db.reimbursement_service_master;
const reimbursement_services = db.reimbursement_services;
const Op = db.Op;

// getting all doctor information
const getDoctor = async (req, res) => {
    try {
        let result = await reimbursement_doctor_master.findAll({ where: { status: true } })
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

// adding doctor information
const addDoctor = async (req, res) => {
    try {
        let doctorData = await validation.doctor(req.body);
        if (doctorData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: doctorData.message
            })
        } else {
            let add = await reimbursement_doctor_master.create(doctorData)
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
            data: error.message
        })
    }
}

// updating doctor information
const updateDoctor = async (req, res) => {
    try {
        let { id, doctorName, specialization, description } = req.body;

        if (id) {
            reimbursement_doctor_master.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let doctorData = {
                        doctorName: doctorName,
                        specialization: specialization,
                        description: description
                    }

                    await result.update(doctorData);
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
            data: error.message
        })
    }
}

// deleting doctor information
const deleteDoctor = async (req, res) => {
    try {
        let { id } = req.body;
        reimbursement_doctors.findOne({
            where: {
                doctor_id: id
            }
        }).then(async (result) => {
            if (result) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REFERENCE_AVAILABLE,
                    data: {}
                })
            } else {
                reimbursement_doctor_master.findOne({
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

// getting all services information
const getServices = async (req, res) => {
    try {
        let result = await reimbursement_service_master.findAll({ where: { status: true } })
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

// adding services information
const addServices = async (req, res) => {
    try {
        if (req.files) {
            let serviceData = await validation.service(req.body);

            if (serviceData.message) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.INVAILID_DATA,
                    data: serviceData.message
                })
            } else {

                let add = await reimbursement_service_master.findOrCreate({
                    where: {
                        service: serviceData.service
                    },
                    defaults: serviceData
                });
                if (add && add[1]) {
                    serviceData.image = await utility.fileupload1(req.files);
                    add[0].update(serviceData);
                    return res.status(Constant.SUCCESS_CODE).json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.SAVE_SUCCESS,
                        data: add[0]
                    })
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: Constant.REQUEST_ALREADY_EXIST,
                        data: add[0]
                    })
                }
            }
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: "Atleast One file is required.",
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

// updating services information
const updateServices = async (req, res) => {
    try {
        let { id, service } = req.body;

        if (id) {
            reimbursement_service_master.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let objService = {
                        service: service
                    }

                    if (req.files) {
                        objService.image = await utility.fileupload1(req.files);
                    }

                    await result.update(objService);
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
            data: error.message
        })
    }
}

// deleting services information
const deleteServices = async (req, res) => {
    try {
        let { id } = req.body;
        reimbursement_services.findOne({
            where: {
                service_id: id
            }
        }).then(async (result) => {
            if (result) {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: Constant.REFERENCE_AVAILABLE,
                    data: {}
                })
            } else {
                reimbursement_service_master.findOne({
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

// getting all Reimbursement information
const getReimbursement = async (req, res) => {
    try {
        let { search, type } = req.query;
        let condition = {
            status: true
        }

        if (type) {
            condition['type'] = type;
        }

        if (search) {
            condition[Op.or] = {
                "referenceNumber": {
                    [Op.like]: `%${search}%`
                },
                "name": {
                    [Op.like]: `%${search}%`
                },
                "address": {
                    [Op.like]: `%${search}%`
                },
                "area": {
                    [Op.like]: `%${search}%`
                },
                "contact": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        reimbursement.findAll({
            where: condition,
            include: [{
                model: reimbursement_doctors,
                as: 'reimbursement_doctors',
                attributes: [],
                include: [{
                    model: reimbursement_doctor_master,
                    as: "doctor",
                    where: {
                        status: true
                    }
                }]
            }, {
                model: reimbursement_services,
                as: 'reimbursement_services',
                attributes: [],
                include: [{
                    model: reimbursement_service_master,
                    as: "service",
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

// adding Reimbursement information
const addReimbursement = async (req, res) => {
    try {
        let objData = await validation.reimbursement(req.body);
        if (objData.message) {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.INVAILID_DATA,
                data: objData.message
            })
        } else {
            objData.referenceNumber = await utility.generateCode('NB', 'reimbursementId', 12);
            let add = await reimbursement.create(objData);
            if (add) {
                if (objData.doctor_id && objData.doctor_id.length > 0) {
                    let listDoctor = [];
                    objData.doctor_id.filter(obj => {
                        listDoctor.push({
                            reimbursement_id: add.id, doctor_id: obj
                        })
                    });
                    await reimbursement_doctors.bulkCreate(listDoctor);
                }

                if (objData.service_id && objData.service_id.length > 0) {
                    let listService = [];
                    objData.service_id.filter(obj => {
                        listService.push({
                            reimbursement_id: add.id, service_id: obj
                        })
                    });
                    await reimbursement_services.bulkCreate(listService);
                }

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

// updating doctor information
const updateReimbursement = async (req, res) => {
    try {
        let { id, type, name, address, area, contact, serviceOffered, hospitalType, description } = req.body;

        if (id) {
            reimbursement.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let doctorData = {
                        type: type,
                        name: name,
                        address: address,
                        area: area,
                        contact: contact,
                        hospitalType: hospitalType,
                        description: description,
                        serviceOffered: serviceOffered
                    }

                    await result.update(doctorData);
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
            data: error.message
        })
    }
}

// deleting doctor information
const deleteReimbursement = async (req, res) => {
    try {
        let { id } = req.body;
        reimbursement.findOne({
            where: {
                id: id,
                status: true
            }
        }).then(async (result) => {
            if (result) {

                await reimbursement_services.destroy({ where: { reimbursement_id: id } });
                await reimbursement_doctors.destroy({ where: { reimbursement_id: id } });
                await result.destroy();

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

module.exports = {
    addDoctor, getDoctor, updateDoctor, deleteDoctor,
    addServices, getServices, updateServices, deleteServices,
    getReimbursement, addReimbursement, updateReimbursement, deleteReimbursement
}