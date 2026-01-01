export const addPinnedMessages = (
  queryClient,
  recevierId,
  newPinnedMessage
) => {
  queryClient.setQueryData(["dmPinnedMessages", recevierId], (olderData) => {
    const pinnedMsgExists = olderData?.find(
      ({ id }) => id == newPinnedMessage.id
    );

    return pinnedMsgExists
      ? olderData
      : [newPinnedMessage, ...(olderData ?? [])];
  });
};
export const removePinnedMessage = (
  queryClient,
  recevierId,
  pinnedMessageId
) => {
  queryClient.setQueryData(["dmPinnedMessages", recevierId], (olderData) => {
    const filtered = olderData?.filter(({ id }) => id != pinnedMessageId);

    return olderData ? filtered : olderData;
  });
};
