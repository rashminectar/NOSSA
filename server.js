const config = require('./config.js');
const express = require('express');
const compression = require('compression')
const bodyParser = require('body-parser')
const logger = require("morgan");
const cors = require('cors');
const http = require('http');
// const fileUpload = require('express-fileupload')
const Constant = require('./config/constant');
const path = require('path');
// db.sequelize.sync();

var httpServer;
const app = express();
app.use(compression())
// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', extended: true }))
app.use(express.json());

app.use(logger("dev")); // log every request to the console
app.use(cors());

// Note that this option available for versions 1.0.0 and newer. 
// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: '/tmp/'
// }));

app.use('/images', express.static(path.join(__dirname, '/public/images')));

// user route file
app.use('/account', require('./route/account'));
app.use('/policy', require('./route/policy'));
app.use('/agent', require('./route/agent'));
app.use('/premium', require('./route/premium'));
app.use('/claim', require('./route/claim'));
app.use('/complaint', require('./route/complaint'));
app.use('/client', require('./route/client'));
app.use('/servicerequest', require('./route/serviceRequest'));
app.use('/holiday', require('./route/holiday'));
app.use('/reimbursement', require('./route/reimbursement'));
app.use('/notification', require('./route/notification'));
app.use('/dashboard', require('./route/dashboard'));
app.use('/supports', require('./route/supports'));

// Handling non matching request from the client
app.use((req, res, next) => {
    return res.status(Constant.NOT_FOUND).json({
        code: Constant.NOT_FOUND,
        message: Constant.REQUEST_NOT_FOUND,
    })
})

if (process.env.NODE_ENV == "production") {
    httpServer = http.createServer(app);
    // for production 
    //var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    //var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    //var credentials = {key: privateKey, cert: certificate};
    // var httpsServer = https.createServer(credentials, app);
} else {
    httpServer = http.createServer(app);
}

httpServer.listen(config.PORT, () => {
    console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
})

const schedule = require('node-schedule');
const db = require("./models");
const moment = require('moment');
const Op = db.Op;
const userPolicy = db.user_policies;
const premium = db.premiums;

schedule.scheduleJob({ hour: 10, minute: 07, tz: 'Asia/Kolkata' }, async function () {
    console.log('schedular 1 is working.!!!');

    let listPolicy = await userPolicy.findAll({
        where: {
            policyStatus: 1,
            premiumStatus: 'Paid',
            status: true
        },
    })

    if (listPolicy.length) {
        let currentDate = moment(new Date(), 'M/D/YYYY');
        let listUpdatePolicy = [];
        let listMaturePolicy = [];
        let listPremium = []
        callLoopFun(0);
        function callLoopFun(i) {
            if (i < listPolicy.length) {
                let { id, premiumPlan, premiumAmount, policyStartDate, policyMaturityDate } = listPolicy[i];
                policyStartDate = moment(policyStartDate, 'M/D/YYYY');
                policyMaturityDate = moment(policyMaturityDate, 'M/D/YYYY');
                if (currentDate.isBefore(policyMaturityDate) && currentDate.isSameOrAfter(policyStartDate)) {
                    let months;
                    months = (currentDate.year() - policyStartDate.year()) * 12;
                    months -= policyStartDate.month();
                    months += currentDate.month();
                    months = months <= 0 ? 0 : months;

                    let durationSetting = (premiumPlan.toLowerCase() == 'yearly') ? 12 : (premiumPlan.toLowerCase() == 'quarterly') ? 3 : 1;
                    if (((months % durationSetting) == 0) && (currentDate.date() == policyStartDate.date())) {
                        listPremium.push({
                            userPolicy_id: id,
                            premiumAmount: premiumAmount
                        });
                        listUpdatePolicy.push(id);
                    }

                    callLoopFun(i + 1);
                } else if (currentDate.isSameOrAfter(policyMaturityDate)) {
                    listMaturePolicy.push(id);
                    callLoopFun(i + 1);
                }

            } else {
                console.log("done...!!!");
                if (listPremium.length) {
                    premium.bulkCreate(listPremium);
                    userPolicy.update({ premiumStatus: 'Unpaid' }, { where: { id: { [Op.in]: listUpdatePolicy } } })
                }

                if (listMaturePolicy.length) {
                    userPolicy.update({ policyStatus: 2 }, { where: { id: { [Op.in]: listMaturePolicy } } })
                }
            }
        }
    } else {
        console.log("no data")
    }
});

schedule.scheduleJob({ hour: 17, minute: 43, tz: 'Asia/Kolkata' }, async function () {
    console.log('schedular 2 is working.!!!');
    let listPendingPremium = await premium.findAll({
        where: {
            premiumStatus: "Unpaid",
            status: true
        }
    })

    if (listPendingPremium.length) {
        let currentDate = new Date();
        let listUpdatePolicy = [];
        callLoopFun(0);
        function callLoopFun(i) {
            if (i < listPendingPremium.length) {
                let { id, userPolicy_id, createdAt } = listPendingPremium[i];
                var a = moment(createdAt, 'M/D/YYYY');
                var b = moment(currentDate, 'M/D/YYYY');
                let dateDiff = b.diff(a, 'days');
                if (dateDiff >= 5) {
                    listUpdatePolicy.push(userPolicy_id)
                }
                callLoopFun(i + 1);
            } else {
                console.log("done..!!!!")
                if (listUpdatePolicy.length) {
                    userPolicy.update({
                        policyStatus: -1,
                        premiumStatus: "Overdue"
                    }, {
                        where: {
                            id: {
                                [Op.in]: listUpdatePolicy
                            }
                        }
                    })
                }
            }
        }
    } else {
        console.log("no data")
    }
});


