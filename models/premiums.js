const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('premiums', {
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
    premiumAmount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    premiumStatus: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    paymentType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    invoice: {
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
    tableName: 'premiums',
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
        name: "fk_premiums_policy_idx",
        using: "BTREE",
        fields: [
          { name: "userPolicy_id" },
        ]
      },
    ]
  });
};
