import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const DirectMessage = sequelize.define("direct_message", {
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
