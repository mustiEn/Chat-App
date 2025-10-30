import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  display_name: {
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
  profile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  background_color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  about_me: {
    type: DataTypes.STRING(190),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["Online", "Idle", "Invisible"],
    defaultValue: "Online",
  },
});
