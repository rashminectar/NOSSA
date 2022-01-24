const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('claim_documents', {
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
    documentName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    documentFile: {
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
    tableName: 'claim_documents',
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
        name: "fk_claimDocuments_claim_idx",
        using: "BTREE",
        fields: [
          { name: "claim_id" },
        ]
      },
    ]
  });
};
