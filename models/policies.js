const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('policies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    policy_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policy_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    registration: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policy_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policy_duration: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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
