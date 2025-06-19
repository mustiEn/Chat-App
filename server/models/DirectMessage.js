import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const DirectMessage = sequelize.define(
  "direct_message",
  {
    message: {
      type: DataTypes.STRING,
    },
    clientOffset: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["clientOffset"],
      },
    ],
  }
);
