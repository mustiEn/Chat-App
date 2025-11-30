export const addSentFriendRequest = (queryClient, users) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.sentFriendRequests ?? [];
    const uniqueIds = vals.length
      ? users.filter((id) => !vals.some((e) => e == id))
      : users;

    return {
      ...olderData,
      sentFriendRequests: [...vals, ...uniqueIds],
    };
  });
};
export const addReceivedFriendRequest = (queryClient, users) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.receivedFriendRequests ?? [];
    console.log("users in func", users);

    const uniqueUsers = vals.length
      ? users.filter((user) => !vals.some((e) => e == user.id))
      : users;

    return {
      ...olderData,
      receivedFriendRequests: [...uniqueUsers, ...vals],
    };
  });
};
export const removeSentFriendRequest = (queryClient, userId) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.sentFriendRequests ?? [];
    const filtered = vals.length ? vals.filter((e) => e.id != userId) : [];

    return {
      ...olderData,
      sentFriendRequests: filtered,
    };
  });
};
export const removeReceivedFriendRequest = (queryClient, userId) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.receivedFriendRequests ?? [];
    const filtered = vals.length ? vals.filter(({ id }) => id != userId) : [];

    return {
      ...olderData,
      receivedFriendRequests: filtered,
    };
  });
};
