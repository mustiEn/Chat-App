export const removeGroup = (queryClient, groupId) => {
  queryClient.setQueryData(["groups"], (olderData) => {
    if (!olderData) return;

    const filtered = olderData.filter(({ group_id }) => groupId != group_id);
    queryClient.removeQueries({ queryKey: ["groupMessages", groupId] });
    queryClient.removeQueries({ queryKey: ["groupMembers", groupId] });
    queryClient.removeQueries({
      queryKey: ["groupPinnedMessages", groupId],
    });

    return filtered;
  });
};
