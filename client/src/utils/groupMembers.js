export const removeMembers = (queryClient, members, groupId) => {
  queryClient.setQueryData(["groupMembers", groupId], (olderData) => {
    const vals = olderData?.groupMembers ?? [];
    const filtered = vals.length
      ? olderData.groupMembers.filter(({ id }) => !members.includes(id))
      : [];

    return {
      ...olderData,
      groupMembers: filtered,
    };
  });
};
