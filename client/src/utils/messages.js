export const addOldMessages = (queryKey, queryClient, paramId, newMsgs) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => ({
    ...olderData,
    pages: [{ messages: newMsgs }, ...olderData.pages],
  }));
};
export const setIsMessagePinned = (
  queryKey,
  queryClient,
  paramId,
  msgId,
  val
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    if (!olderData) return olderData;

    const newPages = olderData.pages.map((page) => ({
      ...page,
      messages: page.messages.map((e) => {
        return e.id == msgId ? { ...e, is_pinned: val } : e;
      }),
    }));

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
export const editMessage = (
  queryKey,
  queryClient,
  paramId,
  msgId,
  editedMessage,
  isPending
) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    console.log(olderData);

    const newPages = olderData.pages.map((page) => ({
      ...page,
      messages: page.messages.map((m) => {
        return m.id == msgId
          ? {
              ...m,
              message: editedMessage,
              isPending: isPending,
              is_edited: true,
            }
          : m;
      }),
    }));
    console.log(newPages);

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
export const deleteMessage = (queryKey, queryClient, paramId, msgId) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    if (!olderData) return olderData;

    console.log("olderdata", olderData);

    const newPages = olderData.pages.map((page) => ({
      ...page,
      messages: page.messages
        .filter((e) => e.id != msgId)
        .map((e) =>
          e.replied_msg_id == msgId ? { ...e, is_replied_msg_deleted: true } : e
        ),
    }));
    console.log("newPages", newPages);

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
export const addMessage = (queryKey, queryClient, paramId, msg) => {
  queryClient.setQueryData([queryKey, paramId], (olderData) => {
    if (!olderData) return olderData;

    const newPages = olderData.pages.map((page, i) => ({
      ...page,
      messages:
        i === olderData.pages.length - 1
          ? [...page.messages, msg]
          : page.messages,
    }));

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
