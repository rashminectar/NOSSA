const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reimbursement_services', {
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
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reimbursement_service_master',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'reimbursement_services',
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
        name: "fk_reimbursement_services_idx",
        using: "BTREE",
        fields: [
          { name: "service_id" },
        ]
      },
      {
        name: "reimbursementServices_reimbursement_idx",
        using: "BTREE",
        fields: [
          { name: "reimbursement_id" },
        ]
      },
    ]
  });
};
