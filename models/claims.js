const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('claims', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userPolicy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_policies',
        key: 'id'
      }
    },
    claimCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verifyStatus: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Not Submited"
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
    policyNo: {
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
      defaultValue: 1
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
        name: "fk_claims_userPolicy_idx",
        using: "BTREE",
        fields: [
          { name: "userPolicy_id" },
        ]
      },
    ]
  });
};
