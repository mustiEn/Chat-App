import { Friend } from "./Friend.js";
import { Group } from "./Group.js";
import { DirectMessage } from "./DirectMessage.js";
import { User } from "./User.js";

export const setUpAssociation = () => {
  DirectMessage.belongsTo(User, {
    foreignKey: "from",
    onDelete: "CASCADE",
  });
  User.hasMany(DirectMessage, {
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
