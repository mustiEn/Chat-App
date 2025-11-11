export const addFriends = (queryClient, users) => {
  queryClient.setQueryData(["allFriends"], (olderData) => {
    if (!olderData) return olderData;

    const friends = olderData.pages.flatMap((e) => e.friends);
    const existingIds = new Set(friends.map(({ id }) => id));
    const uniqueUsers = users.filter(({ id }) => !existingIds.has(id));
    const newPages = olderData.pages.map((page, i) =>
      i === 0
        ? { ...page, friends: [...page.friends, ...uniqueUsers] }
        : { ...page }
    );

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
export const removeFriend = (queryClient, userId) => {
  queryClient.setQueryData(["allFriends"], (olderData) => {
    if (!olderData) return olderData;

    const newPages = olderData.pages.map((page) => ({
      ...page,
      friends: page.friends.filter(({ id }) => id != userId),
    }));
    console.log(userId, "removing in query");

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
