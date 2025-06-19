import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Group = sequelize.define("Group", {
  group_photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
