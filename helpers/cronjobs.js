const schedule = require('node-schedule');


const rule = new schedule.RecurrenceRule();
rule.hour = 10;
rule.minute = 43;
rule.tz = 'Asia/Kolkata';

console.log("working")

const job = schedule.scheduleJob(rule, function () {
    console.log('A new day has begun in the UTC timezone!');
});