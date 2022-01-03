const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reimbursement_doctors', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    reimbursement_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reimbursement',
        key: 'id'
      }
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reimbursement_doctor_master',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'reimbursement_doctors',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fk_reimbursementDoctor_doctorMaster_idx",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
      {
        name: "fk_reimbursementDoctor_reimbursement_idx",
        using: "BTREE",
        fields: [
          { name: "reimbursement_id" },
        ]
      },
    ]
  });
};
