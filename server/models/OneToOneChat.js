import { DataTypes, STRING } from "sequelize";
import { sequelize } from "./db.js";

export const OneToOneChat = sequelize.define(
  "one_to_one_chat",
  {
    chat_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
