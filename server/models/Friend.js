import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Friend = sequelize.define("Friends", {
  request_state: {
    type: DataTypes.ENUM,
    values: ["accepted", "pending", "rejected"],
    defaultValue: null,
  },
});
