export const addSentMessageRequests = (queryClient, newMsgRequests) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData?.sentMessageRequests ?? [];
    const uniqueIds = vals.length
      ? newMsgRequests.filter((id) => !vals.some((e) => e == id))
      : newMsgRequests;

    return {
      ...olderData,
      sentMessageRequests: [...uniqueIds, ...vals],
    };
  });
};
export const addReceivedMessageRequests = (queryClient, newMsgRequests) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData?.receivedMessageRequests ?? [];
    const uniqueIds = newMsgRequests.filter((id) => !vals.some((e) => e == id));

    return {
      ...olderData,
      receivedMessageRequests: [...uniqueIds, ...vals],
    };
  });
};
export const removeSentMessageRequest = (queryClient, userId) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData?.sentMessageRequests ?? [];
    const filtered = vals.length
      ? vals.filter(({ to_id }) => to_id != userId)
      : [];

    return {
      ...olderData,
      sentMessageRequests: filtered,
    };
  });
};
export const removeReceivedMessageRequest = (queryClient, userId) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData?.receivedMessageRequests ?? [];
    const filtered = vals.length
      ? olderData.receivedMessageRequests.filter(
          ({ from_id }) => from_id != userId
        )
      : [];

    return {
      ...olderData,
      receivedMessageRequests: filtered,
    };
  });
};
