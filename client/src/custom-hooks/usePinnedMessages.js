import { useQuery } from "@tanstack/react-query";

const getPinnedMessages = async (chatId) => {
  try {
    const res = await fetch(`/api/dm/pinned-messages/${chatId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const usePinnedMessages = (chatId) => {
  return useQuery({
    queryKey: ["pinnedMessages", chatId],
    queryFn: () => getPinnedMessages(chatId),
    staleTime: Infinity,
    enabled: false,
  });
};
