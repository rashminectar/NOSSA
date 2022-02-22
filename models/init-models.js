var DataTypes = require("sequelize").DataTypes;
var _claim_details = require("./claim_details");
var _claim_documents = require("./claim_documents");
var _claims = require("./claims");
var _complaints = require("./complaints");
var _holidays = require("./holidays");
var _notification_master = require("./notification_master");
var _policies = require("./policies");
var _premiums = require("./premiums");
var _reimbursement = require("./reimbursement");
var _reimbursement_doctor_master = require("./reimbursement_doctor_master");
var _reimbursement_doctors = require("./reimbursement_doctors");
var _reimbursement_service_master = require("./reimbursement_service_master");
var _reimbursement_services = require("./reimbursement_services");
var _service_request = require("./service_request");
var _settings = require("./settings");
var _supports = require("./supports");
var _user_info = require("./user_info");
var _user_notification = require("./user_notification");
var _user_policies = require("./user_policies");
var _users = require("./users");

function initModels(sequelize) {
  var claim_details = _claim_details(sequelize, DataTypes);
  var claim_documents = _claim_documents(sequelize, DataTypes);
  var claims = _claims(sequelize, DataTypes);
  var complaints = _complaints(sequelize, DataTypes);
  var holidays = _holidays(sequelize, DataTypes);
  var notification_master = _notification_master(sequelize, DataTypes);
  var policies = _policies(sequelize, DataTypes);
  var premiums = _premiums(sequelize, DataTypes);
  var reimbursement = _reimbursement(sequelize, DataTypes);
  var reimbursement_doctor_master = _reimbursement_doctor_master(sequelize, DataTypes);
  var reimbursement_doctors = _reimbursement_doctors(sequelize, DataTypes);
  var reimbursement_service_master = _reimbursement_service_master(sequelize, DataTypes);
  var reimbursement_services = _reimbursement_services(sequelize, DataTypes);
  var service_request = _service_request(sequelize, DataTypes);
  var settings = _settings(sequelize, DataTypes);
  var supports = _supports(sequelize, DataTypes);
  var user_info = _user_info(sequelize, DataTypes);
  var user_notification = _user_notification(sequelize, DataTypes);
  var user_policies = _user_policies(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  claim_details.belongsTo(claims, { as: "claim", foreignKey: "claim_id" });
  claims.hasOne(claim_details, { as: "claim_details", foreignKey: "claim_id" });
  claim_documents.belongsTo(claims, { as: "claim", foreignKey: "claim_id" });
  claims.hasMany(claim_documents, { as: "claim_documents", foreignKey: "claim_id" });
  user_notification.belongsTo(notification_master, { as: "notification", foreignKey: "notification_id" });
  notification_master.hasMany(user_notification, { as: "user_notifications", foreignKey: "notification_id" });
  user_policies.belongsTo(policies, { as: "policy", foreignKey: "policy_id" });
  policies.hasMany(user_policies, { as: "user_policies", foreignKey: "policy_id" });
  reimbursement_doctors.belongsTo(reimbursement, { as: "reimbursement", foreignKey: "reimbursement_id" });
  reimbursement.hasMany(reimbursement_doctors, { as: "reimbursement_doctors", foreignKey: "reimbursement_id" });
  reimbursement_services.belongsTo(reimbursement, { as: "reimbursement", foreignKey: "reimbursement_id" });
  reimbursement.hasMany(reimbursement_services, { as: "reimbursement_services", foreignKey: "reimbursement_id" });
  reimbursement_doctors.belongsTo(reimbursement_doctor_master, { as: "doctor", foreignKey: "doctor_id" });
  reimbursement_doctor_master.hasMany(reimbursement_doctors, { as: "reimbursement_doctors", foreignKey: "doctor_id" });
  reimbursement_services.belongsTo(reimbursement_service_master, { as: "service", foreignKey: "service_id" });
  reimbursement_service_master.hasMany(reimbursement_services, { as: "reimbursement_services", foreignKey: "service_id" });
  claims.belongsTo(user_policies, { as: "userPolicy", foreignKey: "userPolicy_id" });
  user_policies.hasMany(claims, { as: "claims", foreignKey: "userPolicy_id" });
  complaints.belongsTo(user_policies, { as: "userPolicy", foreignKey: "userPolicy_id" });
  user_policies.hasMany(complaints, { as: "complaints", foreignKey: "userPolicy_id" });
  premiums.belongsTo(user_policies, { as: "userPolicy", foreignKey: "userPolicy_id" });
  user_policies.hasMany(premiums, { as: "premia", foreignKey: "userPolicy_id" });
  service_request.belongsTo(user_policies, { as: "userPolicy", foreignKey: "userPolicy_id" });
  user_policies.hasMany(service_request, { as: "service_requests", foreignKey: "userPolicy_id" });
  user_notification.belongsTo(users, { as: "user", foreignKey: "user_id" });
  users.hasMany(user_notification, { as: "user_notifications", foreignKey: "user_id" });
  user_policies.belongsTo(users, { as: "agent", foreignKey: "agent_id" });
  users.hasMany(user_policies, { as: "user_policies", foreignKey: "agent_id" });
  user_policies.belongsTo(users, { as: "user", foreignKey: "user_id" });
  users.hasMany(user_policies, { as: "user_user_policies", foreignKey: "user_id" });

  return {
    claim_details,
    claim_documents,
    claims,
    complaints,
    holidays,
    notification_master,
    policies,
    premiums,
    reimbursement,
    reimbursement_doctor_master,
    reimbursement_doctors,
    reimbursement_service_master,
    reimbursement_services,
    service_request,
    settings,
    supports,
    user_info,
    user_notification,
    user_policies,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
