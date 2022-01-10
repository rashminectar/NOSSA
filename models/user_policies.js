const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_policies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'policies',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    premiumPlan: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    premiumAmount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    numberOfClaims: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    policyStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    policyMaturityDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    policyStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'user_policies',
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
        name: "fk_userPolicy_policy_idx",
        using: "BTREE",
        fields: [
          { name: "policy_id" },
        ]
      },
      {
        name: "fk_userPolicy_user_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "fk_userPolicy_agent_idx",
        using: "BTREE",
        fields: [
          { name: "agent_id" },
        ]
      },
    ]
  });
};
