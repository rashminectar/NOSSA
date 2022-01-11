const Joi = require('joi');
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const db = require("../models");
const settings = db.settings;

var utility = {};

utility.randomString = (length) => {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


utility.generateToken = (length) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, function (err, buf) {
            if (err) {
                reject(err);
            } else {
                resolve(buf.toString('hex'))
            }
        });
    })

}

utility.generatePolicyCode = () => {
    return new Promise((resolve, reject) => {
        let lastID = 0;
        settings.findOne({
            where: {
                key: 'lastPolicyId'
            }
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            lastID = ((result && result.value) ? parseInt(result.value) : lastID) + 1;
            let str = "NS" + (lastID).toString().padStart(10, '0');
            settings.update({ value: lastID }, { where: { key: 'lastPolicyId' } })
            resolve(str);
        }).catch(error => {
            reject(error);
        })
    })
}

utility.generateAgentCode = () => {
    return new Promise((resolve, reject) => {
        let lastID = 0;
        settings.findOne({
            where: {
                key: 'lastAgentId'
            }
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            lastID = ((result && result.value) ? parseInt(result.value) : lastID) + 1;
            let str = "NA" + (lastID).toString().padStart(6, '0');
            settings.update({ value: lastID }, { where: { key: 'lastAgentId' } })
            resolve(str);
        }).catch(error => {
            reject(error);
        })
    })
}

utility.fileupload = (files) => {
    return new Promise(async (resolve, reject) => {
        let name = await utility.randomString(5);
        var currentPath = process.cwd();
        var file_path = path.join(currentPath, '/public/images');

        var filedata = files.image.mv(file_path + '/' + name + files.image.name, (error, data) => {
            if (error) {
                reject(null);
            } else {
                resolve(name + files.image.name);
            }
        })

    })

}

utility.uploadBase64Image = (imgBase64) => {

    return new Promise(async (resolve, reject) => {
        let name = await utility.randomString(12);
        let mimeType = imgBase64.match(/[^:/]\w+(?=;|,)/)[0];
        let filename = 'img_' + name + '.' + mimeType;
        var currentPath = process.cwd();
        var file_path = path.join(currentPath, '/public/images');


        // Remove header
        let base64Image = imgBase64.split(';base64,').pop();

        fs.writeFile(file_path + "/" + filename, base64Image, 'base64', function (err) {
            if (err) {
                reject(filename);
            }
        });
        resolve(filename);

    })

}


module.exports = utility;
