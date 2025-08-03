import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const DirectMessage = sequelize.define(
  "direct_message",
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
