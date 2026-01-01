import { DataTypes, STRING } from "sequelize";
import { sequelize } from "./db.js";

export const OneToOneChat = sequelize.define(
  "one_to_one_chat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    chat_key: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["chat_id"],
      },
      {
        unique: true,
        fields: ["chat_key"],
      },
    ],
  }
);
