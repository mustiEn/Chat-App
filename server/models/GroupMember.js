import { sequelize } from "./db.js";

export const GroupMember = sequelize.define(
  "group_member",
  {},
  {
    timestamps: true,
  }
);
