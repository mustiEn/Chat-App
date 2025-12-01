export const addDmHistoryUsers = (queryClient, users) => {
  queryClient.setQueryData(["dmHistory"], (olderData) => [
    ...users,
    ...[olderData ?? []],
  ]);
};
export const removeDmHistoryUsers = (queryClient, user) => {
  queryClient.setQueryData(["dmHistory"], (olderData) => {
    const filtered = olderData.filter(({ id }) => id != user.id);

    return { ...olderData, ...filtered };
  });
};
