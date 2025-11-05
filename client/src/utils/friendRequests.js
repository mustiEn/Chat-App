export const addSentFriendRequest = (queryClient, userIds) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData.sentRequests;
    const uniqueIds = userIds.filter((id) => !vals.some((e) => e == id));

    return {
      ...olderData,
      sentRequests: [...olderData.sentRequests, ...uniqueIds],
    };
  });
};
export const addReceivedFriendRequest = (queryClient, users) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData.receivedRequests;
    const uniqueUsers = users.filter((id) => !vals.some((e) => e == id));

    return {
      ...olderData,
      receivedRequests: [...uniqueUsers, ...olderData.receivedRequests],
    };
  });
};
export const removeSentFriendRequest = (queryClient, userId) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData.sentRequests;
    const filtered = vals.filter((id) => id != userId);

    return {
      ...olderData,
      sentRequests: filtered,
    };
  });
};
export const removeReceivedFriendRequest = (queryClient, userId) => {
  queryClient.setQueryData(["friendRequests"], (olderData) => {
    const vals = olderData.receivedRequest;
    const filtered = vals.filter(({ id }) => id != userId);

    return {
      ...olderData,
      receivedRequests: filtered,
    };
  });
};
