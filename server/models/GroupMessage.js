import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const GroupMessage = sequelize.define(
  "group_message",
  {
    message: {
      type: DataTypes.STRING(1600),
    },
    clientOffset: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reply_to_msg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    pin_updated_at: {
      type: DataTypes.DATE,
      defaultValue: null,
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
