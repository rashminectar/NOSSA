const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('complaints', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    complaintCode: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    userPolicy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_policies',
        key: 'id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    complaintDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.STRING(255),
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
    tableName: 'complaints',
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
        name: "fk_complaints_userPolicy_idx",
        using: "BTREE",
        fields: [
          { name: "userPolicy_id" },
        ]
      },
    ]
  });
};
