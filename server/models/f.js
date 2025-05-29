import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const Friend = sequelize.define("Friends", {
  friend_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  account_followed_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
