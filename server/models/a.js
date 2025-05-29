import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const GroupMessage = sequelize.define("group_message", {
  from: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
