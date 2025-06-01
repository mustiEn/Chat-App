import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Group = sequelize.define("Group", {
  group_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
