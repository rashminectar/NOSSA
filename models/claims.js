const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('claims', {
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
    claim_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verifyStatus: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    VerifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    coveredByOtherInsurance: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    policy_no: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sumInsured: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    relationWithInsured: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    relationName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    relationGender: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    relationDOB: {
      type: DataTypes.DATE,
      allowNull: true
    },
    relationAge: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    relationOccupation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    relationAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    relationPhone: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    relationEmail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'claims',
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
        name: "fk_claims_policy_idx",
        using: "BTREE",
        fields: [
          { name: "policy_id" },
        ]
      },
      {
        name: "fk_claims_user_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
