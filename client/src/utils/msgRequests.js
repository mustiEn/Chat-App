export const addSentMessageRequests = (queryClient, newMsgRequests) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData.sentMessageRequests;
    const uniqueIds = newMsgRequests.filter((id) => !vals.some((e) => e == id));

    return {
      ...olderData,
      sentRequests: [...uniqueIds, ...olderData.sentRequests],
    };
  });
};
export const addReceivedMessageRequests = (queryClient, newMsgRequests) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const vals = olderData.receivedMessageRequests;
    const uniqueIds = newMsgRequests.filter((id) => !vals.some((e) => e == id));

    return {
      ...olderData,
      receivedRequests: [...uniqueIds, ...olderData.receivedRequests],
    };
  });
};
export const removeSentMessageRequest = (queryClient, userId) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const filtered = olderData.sentRequests.filter(
      ({ to_id }) => to_id != userId
    );
    return {
      ...olderData,
      sentRequests: filtered,
    };
  });
};
export const removeReceivedMessageRequest = (queryClient, userId) => {
  queryClient.setQueryData(["messageRequests"], (olderData) => {
    const filtered = olderData.receivedRequests.filter(
      ({ from_id }) => from_id != userId
    );
    return {
      ...olderData,
      receivedRequests: filtered,
    };
  });
};
