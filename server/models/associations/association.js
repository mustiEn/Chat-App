import { Friend } from "./Friends.js";
import { Group } from "./Group.js";
import { Message } from "./Messages.js";
import { User } from "./Users.js";

export const setUpAssociation = () => {
  Message.belongsTo(User, {
    foreignKey: "from",
    onDelete: "CASCADE",
  });
  User.hasMany(Message, {
    foreignKey: "from",
    onDelete: "CASCADE",
  });

  User.belongsToMany(Group, { through: "user_groups" });
  Group.belongsToMany(User, { through: "user_groups" });

  Friend.belongsTo(User, {
    foreignKey: "account_followed_id",
    onDelete: "CASCADE",
  });
  User.hasMany(Friend, {
    foreignKey: "account_followed_id",
    onDelete: "CASCADE",
  });
};
