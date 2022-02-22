const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_request', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    serviceCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userPolicy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_policies',
        key: 'id'
      }
    },
    serviceName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priorityStatus: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: "Low"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    verifyStatus: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Pending"
    },
    VerifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'service_request',
    timestamps: true,
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
        name: "fk_service_userPolicy_idx",
        using: "BTREE",
        fields: [
          { name: "userPolicy_id" },
        ]
      },
    ]
  });
};
