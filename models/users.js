const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "email"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gendar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 4
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE(6),
      allowNull: true
    },
    profileImg: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    currentAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    permanentAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
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
    tableName: 'users',
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
