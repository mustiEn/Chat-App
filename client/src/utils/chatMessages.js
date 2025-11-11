export const addOldMessages = (queryClient, receiverId, newMsgs) => {
  queryClient.setQueryData(["chatMessages", receiverId], (olderData) => ({
    ...olderData,
    pages: [{ messages: newMsgs }, ...olderData.pages],
  }));
};
export const setIsMessagePinned = (queryClient, receiverId, msgId, val) => {
  queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
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
  queryClient,
  receiverId,
  msgId,
  editedMessage,
  isPending
) => {
  queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
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
export const deleteMessage = (queryClient, receiverId, msgId) => {
  queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
    if (!olderData) return olderData;

    const newPages = olderData.pages.map((page) => ({
      ...page,
      messages: page.messages
        .filter((e) => e.id != msgId)
        .map((e) =>
          e.replied_msg_id == msgId ? { ...e, is_replied_msg_deleted: true } : e
        ),
    }));

    return {
      ...olderData,
      pages: newPages,
    };
  });
};
export const addMessage = (queryClient, receiverId, msg) => {
  queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
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
