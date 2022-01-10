const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('claim_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    claim_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'claims',
        key: 'id'
      }
    },
    hospitalName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    roomCategory: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    injuryCause: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dateInjury: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dateAdmission: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dateDischarge: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preHospitalExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    hospitalExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    postHospitalExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    healthCheckupExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    ambulanceExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    otherExpense: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    preHospitalDuration: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    postHospitaDuration: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hospitalDailyCash: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    surgicalCash: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    criticalIllnessbenefit: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    convalescence: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    lumpSumBenefit: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    otherCharges: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    lumpSumBenefitDetail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'claim_details',
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
        name: "fk_claimDetail_claim_idx",
        using: "BTREE",
        fields: [
          { name: "claim_id" },
        ]
      },
    ]
  });
};
