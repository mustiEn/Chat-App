import { Group } from "../Group.js";
import { DirectMessage } from "../DirectMessage.js";
import { User } from "../User.js";
import { Friend } from "../Friend.js";
import { ChatId } from "../ChatId.js";
import { BlockedUser } from "../BlockedUser.js";
import { DirectMessageHistory } from "../DirectMessageHistory.js";

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
    foreignKey: "last_pin_action_by_id",
  });
  User.hasMany(DirectMessage, {
    foreignKey: "last_pin_action_by_id",
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
    through: Friend,
    as: "userFriends",
    foreignKey: "user_id",
    otherKey: "friend_id",
    timestamps: true,
  });

  User.belongsToMany(User, {
    through: DirectMessageHistory,
    as: "directMessageHistory",
    foreignKey: "user_id",
    otherKey: "dm_history_user_id",
    timestamps: true,
  });

  User.belongsToMany(User, {
    through: BlockedUser,
    as: "blockedUsers",
    foreignKey: "blocked_id",
    otherKey: "blocked_by_id",
    timestamps: true,
  });

  User.belongsToMany(User, {
    through: ChatId,
    as: "chatIds",
    foreignKey: "user_id",
    otherKey: "receiver_id",
    timestamps: true,
  });
};
