import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const GroupInvite = sequelize.define(
  "group_invite",
  {
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);
