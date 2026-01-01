import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

export const GroupChat = sequelize.define(
  "group_chat",
  {
    group_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    group_icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    group_name: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["group_id"],
      },
      {
        unique: true,
        fields: ["group_name"],
      },
    ],
  }
);
