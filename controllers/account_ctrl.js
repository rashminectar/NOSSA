'use strict'
var jwt = require('jsonwebtoken');
const config = require('../config');
const db = require("../models");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const user = db.account;
const Op = db.Sequelize.Op;
const utility = require('../helpers/utility')
const validation = require('../helpers/validation')
const Constant = require('../config/constant')
const mailer = require('../lib/mailer')
let account = {};


account.userRegistration = async (req, res) => {

  try {
    let { image } = req.body;
    let profile_img = "";
    let userData = await validation.checkUserData(req.body)
    if (userData.message) {
      return res.json({
        code: Constant.ERROR_CODE,
        massage: Constant.INVAILID_DATA,
        data: userData.message
      })
    } else {
      userData.verification_token = utility.randomString(24);
      let result = await user.findAll({
        where: {
          email: userData.email
        }
      })
      if (result.length > 0) {

        return res.json({
          code: Constant.FORBIDDEN_CODE,
          massage: Constant.EMAIL_ALREADY_REGISTERED,
          data: null
        })
      } else {

        userData.password = bcrypt.hashSync(userData.password, salt);
        let result = await user.create(userData);

        if (image) {
          profile_img = await utility.uploadBase64Image(image)

          let userData = {
            profile_img: profile_img

          }
          result.update(userData)
        }

        let mailOptions = {
          from: 'vikas <vikas.kushwah@nectarinfotel.com>',
          to: userData.email,
          subject: 'nossa',
          text: 'Email verification link',
          html: '<h1>Email verification lik<h1>: http://localhost:3000/account/emailVerification/' + userData.verification_token
        }
        await mailer.sendEmail(mailOptions)
        return res.json({
          code: Constant.SUCCESS_CODE,
          massage: Constant.USER_SAVE_SUCCESS,
          data: result
        })

      }
    }

  }
  catch (err) {

    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })

  }

}

account.getUserByToken = async (req, res) => {
  try {
    const SECRET = process.env.SECRET;
    const { authorization } = req.headers;
    const decoded = jwt.verify(authorization, SECRET);
    let result = "";
    if (decoded) {
      result = await user.findOne({
        where: {
          id: decoded.userId
        }
      })

      result = {
        userId: result.id,
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        gendar: result.gendar,
        role: result.role,
        city: result.city,
        phone: result.phone,
        dob_date: result.dob_date,
        profile_img: result.profile_img
      }
    }

    return res.json({
      code: Constant.SUCCESS_CODE,
      massage: Constant.USER_VERIFICATION_SUCCESS,
      data: result
    })
  } catch (error) {
    return res.json({
      code: Constant.INVALID_CODE,
      massage: Constant.INVALID_TOKEN,
      data: null
    })
  }
}

account.emailVerification = async (req, res) => {
  try {
    let { token } = req.params;


    user.findOne({
      where: {
        verification_token: token
      }
    }).then(data => {
      if (data) {
        data.update({ verification_token: '', status: true });

        return res.json({
          code: Constant.SUCCESS_CODE,
          data: null,
          message: Constant.EMAIL_VERIFIED
        });
      } else {

        return res.json({
          code: Constant.SUCCESS_CODE,
          data: data,
          message: Constant.INVALID_TOKEN
        });
      }


    })

  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })
  }

}

account.userLogin = async (req, res) => {
  try {
    let { username, password } = req.body;
    let userData = {
      username: username,
      password: password
    }
    let data = await validation.userLogin(userData)

    if (data.message) {
      return res.json({
        code: Constant.ERROR_CODE,
        massage: Constant.INVAILID_DATA,
        data: data.message
      })
    } else {
      let result = await user.findOne({
        where: {
          email: username
        }
      })
      if (bcrypt.compareSync(password, result.password)) {
        let params = {
          userId: result.id,
          first_name: result.first_name,
          last_name: result.last_name,
          email: result.email,
          gendar: result.gendar,
          role: result.role,
          phone: result.phone,
          dob_date: result.dob_date,
          profile_img: result.profile_img
        }
        params.jwtToken = jwt.sign(params, process.env.SECRET);
        return res.json({
          code: Constant.SUCCESS_CODE,
          massage: Constant.USER_LOGIN_SUCCESS,
          data: params
        })
      } else {
        return res.json({
          code: Constant.FORBIDDEN_CODE,
          massage: Constant.USER_EMAIL_PASSWORD,
          data: null
        })

      }


    }
  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })
  }
}

account.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    user.findOne({
      where: {
        email: email
      }
    }).then(async (result) => {
      if (result) {
        var Token = await utility.generateToken(20);
        let resetPasswordExpires = Date.now() + 3600000;
        var UserData = {
          verification_token: Token,
          resetPasswordExpires: resetPasswordExpires, // 1 hour
        }

        result.update(UserData);

        let mailOptions = {
          from: 'vikas <vikas.kushwah@nectarinfotel.com>',
          to: email,
          subject: 'Forgot password',
          text: '',
          html: '<h1>Forgot password<h1>link : http://localhost:3000/account/emailVerification/' + Token
        }

        await mailer.sendEmail(mailOptions)

        return res.json({
          code: Constant.SUCCESS_CODE,
          message: Constant.SENT_FORGOT_EMAIL,
          data: null
        });
      } else {

        return res.json({
          code: Constant.ERROR_CODE,
          data: null,
          message: Constant.USER_EMAIL_NOT_REGISTERED
        })
      }

    })


  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })
  }
}

account.resetPassword = async (req, res) => {
  try {
    let { token, password } = req.body;

    user.findOne({
      where: {
        verification_token: token
      }
    }).then((result) => {
      if (result && result.resetPasswordExpires >= Date.now()) {
        var hash = bcrypt.hashSync(password, salt);
        var UserData = {
          password: hash,
          verification_token: '',
          resetPasswordExpires: '',
        }

        result.update(UserData);
        return res.json({
          code: Constant.SUCCESS_CODE,
          'message': Constant.PASSWORD_RESET,
          data: result.email
        });

      } else {
        return res.json({
          code: Constant.ERROR_CODE,
          massage: Constant.USER_RESET_PASSWORD,
          data: null
        })
      }

    })
  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.USER_RESET_PASSWORD,
      data: null
    })
  }



}

account.changePassword = async (req, res) => {
  try {
    let { oldPassword, password } = req.body;
    let { email } = req.user;

    user.findOne({
      where: {
        email: email
      }
    }).then((result) => {
      if (result && (bcrypt.compareSync(oldPassword, result.password))) {
        var hash = bcrypt.hashSync(password, salt);
        var UserData = {
          password: hash
        }

        result.update(UserData);
        return res.json({
          code: Constant.SUCCESS_CODE,
          massage: Constant.PASSWORD_RESET,
          data: null
        });

      } else {
        return res.json({
          code: Constant.ERROR_CODE,
          massage: Constant.USER_OLD_PASSWORD,
          data: null
        })
      }

    })
  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.USER_RESET_PASSWORD,
      data: null
    })
  }
}

account.getAllUsers = async function (req, res) {
  try {
    let { search } = req.body;
    let condition = {
      status: true,
      role: {
        [Op.in]: [3, 5]
      }
    };
    if (search) {
      condition = {
        [Op.or]: {
          first_name: {
            [Op.like]: `%${search}%`
          },
          last_name: {
            [Op.like]: `%${search}%`
          },
          email: {
            [Op.like]: `%${search}%`
          },
          phone: {
            [Op.like]: `%${search}%`
          }
        }
      }
    }
    let result = await user.findAll({
      where: condition,
      attributes: ["id", "first_name", "last_name", "role", "email", "phone"]
    })

    let massage = (result.length > 0) ? Constant.CONSIGNEE_RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
    return res.json({
      code: Constant.SUCCESS_CODE,
      massage: massage,
      data: result
    })

  }
  catch (err) {

    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })

  }

}

account.getUserById = async (req, res) => {
  try {
    let { userId } = req.body;
    let result = await user.findAll({
      where: {
        id: userId
      },
      attributes: ["id", "first_name", "last_name", "role", "email", "phone", "gendar"]
    })

    let massage = (result.length > 0) ? Constant.USER_RETRIEVE_SUCCESS : Constant.NO_DATA_FOUND
    return res.json({
      code: Constant.SUCCESS_CODE,
      massage: massage,
      data: result
    })

  }
  catch (err) {

    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.SOMETHING_WENT_WRONG,
      data: null
    })

  }

}

account.updateProfile = async (req, res) => {
  try {
    let { userId } = req.user;
    let { image, gendar, last_name, phone, first_name, city, dob_date } = req.body;
    let profile_img = "";
    user.findOne({
      where: {
        id: userId
      }
    }).then(async (result) => {
      if (result) {
        let userData = {
          gendar: gendar,
          last_name: last_name,
          phone: phone,
          first_name: first_name,
          city: city,
          dob_date: dob_date
        }
        result.update(userData);

        if (image) {
          profile_img = await utility.uploadBase64Image(image)

          let userData = {
            profile_img: profile_img

          }
          result.update(userData)
        }

        return res.json({
          code: Constant.SUCCESS_CODE,
          massage: Constant.USER_DATA_UPDATE_SUCCESS,
          data: result
        });

      } else {
        return res.json({
          code: Constant.ERROR_CODE,
          massage: Constant.USER_RESET_PASSWORD,
          data: null
        })
      }

    })
  } catch (error) {
    return res.json({
      code: Constant.ERROR_CODE,
      massage: Constant.USER_RESET_PASSWORD,
      data: null
    })
  }
}

module.exports = account;
