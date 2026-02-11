export const removeGroupInvites = (queryClient, userId, groupId) => {
  queryClient.setQueryData(["groupInvites"], (olderData) => {
    const vals = olderData?.groupInvites ?? [];
    const filtered = vals.length
      ? olderData.groupInvites.filter(
          ({ group_id, from_id }) => from_id != userId && groupId != group_id,
        )
      : [];

    return {
      ...olderData,
      groupInvites: filtered,
    };
  });
};
export const addGroupInvites = (queryClient, group) => {
  queryClient.setQueryData(["groupInvites"], (olderData) => {
    const vals = olderData?.groupInvites ?? [];

    return {
      ...olderData,
      groupInvites: [group, ...vals],
    };
  });
};
