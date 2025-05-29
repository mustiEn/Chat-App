import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { logger } from "../utils/constants.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ,
  // profile:{
  //     typr:DataTypes.BLOB,
  //     allowNull:true,
  //     defaultValue:null
  // }
});
