import { GroupChat } from "../GroupChat.js";
import { GroupMessage } from "../GroupMessage.js";
import { DirectMessage } from "../DirectMessage.js";
import { User } from "../User.js";
import { Friend } from "../Friend.js";
import { OneToOneChat } from "../OneToOneChat.js";
import { BlockedUser } from "../BlockedUser.js";
import { DirectMessageHistory } from "../DirectMessageHistory.js";
import { GroupMember } from "../GroupMember.js";

export const setUpAssociation = () => {
  //* DirectMessages
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

  //* GroupChats
  User.hasMany(GroupChat, {
    foreignKey: "created_by_id",
  });
  GroupChat.belongsTo(User, {
    foreignKey: "created_by_id",
  });

  //* GroupMessages
  User.hasMany(GroupMessage, {
    foreignKey: "user_id",
  });
  GroupMessage.belongsTo(User, {
    foreignKey: "user_id",
  });
  GroupChat.hasMany(GroupMessage, {
    foreignKey: "group_id",
  });
  GroupMessage.belongsTo(GroupChat, {
    foreignKey: "group_id",
  });

  //* GroupMembers
  User.belongsToMany(GroupChat, {
    through: GroupMember,
    as: "members",
    foreignKey: "user_id",
    otherKey: "group_id",
  });
  GroupChat.belongsToMany(User, {
    through: GroupMember,
    as: "groups",
    foreignKey: "group_id",
    otherKey: "user_id",
  });

  //* Friends
  User.belongsToMany(User, {
    through: Friend,
    as: "userFriends",
    foreignKey: "user_id",
    otherKey: "friend_id",
    timestamps: true,
  });

  //* DirectMessageHistories
  User.belongsToMany(User, {
    through: DirectMessageHistory,
    as: "directMessageHistory",
    foreignKey: "user_id",
    otherKey: "dm_history_user_id",
    timestamps: true,
  });

  //* BlockedUsers
  User.belongsToMany(User, {
    through: BlockedUser,
    as: "blockedUsers",
    foreignKey: "blocked_id",
    otherKey: "blocked_by_id",
    timestamps: true,
  });

  //* OneToOneChats
  User.belongsToMany(User, {
    through: OneToOneChat,
    as: "chatIds",
    foreignKey: "user_id",
    otherKey: "receiver_id",
    timestamps: true,
  });
};
