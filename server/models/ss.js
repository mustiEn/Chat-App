import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const Message = sequelize.define("Messages", {
  from: {
    type: DataTypes.INTEGER,
  },
  to: {
    type: DataTypes.INTEGER,
  },
  message: {
    type: DataTypes.STRING,
  },
});
