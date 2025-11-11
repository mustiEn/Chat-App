export const addSentFriendRequest = (queryClient, userIds) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.sentFriendRequests ?? [];
    const uniqueIds = vals.length
      ? userIds.filter((id) => !vals.some((e) => e == id))
      : userIds;

    return {
      ...olderData,
      sentFriendRequests: [...vals, ...uniqueIds],
    };
  });
};
export const addReceivedFriendRequest = (queryClient, users) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.receivedFriendRequests ?? [];
    const uniqueUsers = vals.length
      ? users.filter((id) => !vals.some((e) => e == id))
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
    const filtered = vals.length ? vals.filter((id) => id != userId) : [];

    return {
      ...olderData,
      sentFriendRequests: filtered,
    };
  });
};
export const removeReceivedFriendRequest = (queryClient, userId) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData?.receivedRequest ?? [];
    const filtered = vals.length ? vals.filter(({ id }) => id != userId) : [];

    return {
      ...olderData,
      receivedFriendRequests: filtered,
    };
  });
};
