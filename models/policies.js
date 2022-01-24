const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('policies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    policyName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policyCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    registration: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policyType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policyDuration: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activeStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'policies',
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
    ]
  });
};
