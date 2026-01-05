export const addPinnedMessages = (
  queryKey,
  queryClient,
  paramId,
  pinnedMessage
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    if (!olderData) return olderData;

    return [pinnedMessage, ...(olderData ?? [])];
  });
};
export const removePinnedMessage = (
  queryKey,
  queryClient,
  paramId,
  pinnedMessageId
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    if (!olderData) return olderData;

    const filtered = olderData.filter(({ id }) => id != pinnedMessageId);

    return filtered;
  });
};
