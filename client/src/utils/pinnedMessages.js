export const addPinnedMessages = (
  queryKey,
  queryClient,
  paramId,
  pinnedMessage
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    const pinnedMsgExists = olderData?.find(({ id }) => id == pinnedMessage.id);

    return pinnedMsgExists ? olderData : [pinnedMessage, ...(olderData ?? [])];
  });
};
export const removePinnedMessage = (
  queryKey,
  queryClient,
  paramId,
  pinnedMessageId
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    const filtered = olderData?.filter(({ id }) => id != pinnedMessageId);

    return olderData ? filtered : olderData;
  });
};
