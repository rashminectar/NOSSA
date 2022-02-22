const db = require('../models');
const holidays = db.holidays
const validation = require('../helpers/validation')
const utility = require('../helpers/utility')
const Constant = require('../config/constant')
const path = require('path');

const Op = db.Op;

const XLSX = require("xlsx");

//get holiday
const getHoliday = async (req, res) => {
    try {
        let { search } = req.query;
        let condition = {
            status: true
        }

        if (search) {
            condition[Op.or] = {
                "name": {
                    [Op.like]: `%${search}%`
                },
                "date": {
                    [Op.like]: `%${search}%`
                },
                "day": {
                    [Op.like]: `%${search}%`
                },
                "type": {
                    [Op.like]: `%${search}%`
                },
            }
        }

        holidays.findAll({
            where: condition,
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

//add holiday
const addHoliday = async (req, res) => {
    try {
        let { name, date, day, type } = req.body;
        let holidayData = {
            name: name,
            date: date,
            day: day,
            type: type
        }

        const holiday = await holidays.create(holidayData);
        if (holiday) {
            return res.status(Constant.SUCCESS_CODE).json({
                code: Constant.SUCCESS_CODE,
                message: Constant.SAVE_SUCCESS,
                data: holiday
            })
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG,
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

//update holiday
const updateHoliday = async (req, res) => {
    try {
        let { id, name, date, day, type } = req.body;
        if (id) {
            holidays.findOne({
                where: {
                    id: id,
                    status: true
                }
            }).then(async (result) => {
                if (result) {
                    let holidayData = {
                        name: name,
                        date: date,
                        day: day,
                        type: type,
                    }

                    await result.update(holidayData);
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

//delete holiday
const deleteHoliday = async (req, res) => {
    try {
        let { id } = req.body;

        holidays.findOne({
            where: {
                id: id
            }
        }).then(async (result) => {
            if (result) {
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

const importHoliday = async (req, res) => {
    if (req.files) {
        var currentPath = process.cwd();
        var file_path = path.join(currentPath, '/public/images');

        let FileName = await utility.fileupload1(req.files);
        if (FileName) {
            let headers = [];
            let workbook = XLSX.readFile(path.join(file_path, FileName), {
                type: 'binary',
                cellDates: true
            });
            let first_sheet_name = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                let range = XLSX.utils.decode_range(worksheet['!ref']);
                let C, R = range.s.r;
                for (C = range.s.c; C <= range.e.c; ++C) {
                    let cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R, })];
                    let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
                    if (cell && cell.t) {
                        hdr = XLSX.utils.format_cell(cell);
                    }
                    headers.push(hdr);
                }

                if (headers.includes('Name') && headers.includes('Date') && headers.includes('Day') && headers.includes('Holiday type')) {
                    let listData = XLSX.utils.sheet_to_json(worksheet);
                    let listHolidayData = [];
                    if (listData.length > 0) {
                        listData.forEach((item, index) => {
                            listHolidayData.push({
                                name: item['Name'],
                                date: new Date(item['Date']),
                                day: item['Day'],
                                type: item['Holiday type']
                            });
                        });

                        if (listHolidayData.length) {
                            let data = await holidays.bulkCreate(listHolidayData, {
                                updateOnDuplicate: ['date', 'day', 'type']
                            });
                            if (data) {
                                return res.status(Constant.SUCCESS_CODE).json({
                                    code: Constant.SUCCESS_CODE,
                                    message: Constant.RETRIEVE_SUCCESS,
                                    data: data
                                })
                            } else {
                                return res.status(Constant.ERROR_CODE).json({
                                    code: Constant.ERROR_CODE,
                                    message: Constant.SOMETHING_WENT_WRONG,
                                    data: {}
                                })
                            }

                        } else {
                            return res.status(Constant.ERROR_CODE).json({
                                code: Constant.ERROR_CODE,
                                message: Constant.DATA_NOT_FOUND,
                                data: {}
                            })
                        }


                    } else {
                        return res.status(Constant.ERROR_CODE).json({
                            code: Constant.ERROR_CODE,
                            message: Constant.DATA_NOT_FOUND,
                            data: {}
                        })
                    }
                } else {
                    return res.status(Constant.ERROR_CODE).json({
                        code: Constant.ERROR_CODE,
                        message: "Excel File is Not Valid, Some required columns such as Name, Date, Day, Holiday type are missing in this file.",
                        data: {}
                    })
                }
            } else {
                return res.status(Constant.ERROR_CODE).json({
                    code: Constant.ERROR_CODE,
                    message: "Error in Importing , Excel File is Protected !!",
                    data: {}
                })
            }
        } else {
            return res.status(Constant.ERROR_CODE).json({
                code: Constant.ERROR_CODE,
                message: "No File Found !!",
                data: {}
            })
        };
    } else {
        return res.status(Constant.ERROR_CODE).json({
            code: Constant.ERROR_CODE,
            message: "No File Found !!",
            data: {}
        })
    }
}

module.exports = {
    addHoliday,
    getHoliday,
    updateHoliday,
    deleteHoliday,
    importHoliday
}
