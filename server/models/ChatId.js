import { DataTypes, STRING } from "sequelize";
import { sequelize } from "./db.js";

export const ChatId = sequelize.define("chat_id", {
  chat_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  chat_key: {
    type: STRING,
    allowNull: false,
  },
});
