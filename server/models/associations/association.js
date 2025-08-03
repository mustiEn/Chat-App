import { Group } from "../Group.js";
import { DirectMessage } from "../DirectMessage.js";
import { User } from "../User.js";

export const setUpAssociation = () => {
  DirectMessage.belongsTo(User, {
    foreignKey: "from_id",
  });
  User.hasMany(DirectMessage, {
    foreignKey: "from_id",
  });
  DirectMessage.belongsTo(User, {
    foreignKey: "to_id",
  });
  User.hasMany(DirectMessage, {
    foreignKey: "to_id",
  });
  DirectMessage.belongsTo(User, {
    foreignKey: "pinned_by",
  });
  User.hasMany(DirectMessage, {
    foreignKey: "pinned_by",
  });

  User.belongsToMany(Group, {
    through: "group_members",
    foreignKey: "user_id",
  });
  Group.belongsToMany(User, {
    through: "group_members",
    foreignKey: "group_id",
  });

  User.belongsToMany(User, {
    through: "friends",
    as: "friend",
    foreignKey: "user_id",
    otherKey: "friend_id",
    timestamps: true,
  });
};
