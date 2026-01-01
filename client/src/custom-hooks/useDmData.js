import { useQuery } from "@tanstack/react-query";

const getDirectMessages = async (chatId) => {
  try {
    const res = await fetch(`/api/dm/initial-chat-data/${chatId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};
export const dmDataQuery = (chatId) => ({
  // queryKey: ["directMessages", chatId],
  queryKey: ["initialChatData", chatId],
  queryFn: () => getDirectMessages(chatId),
  staleTime: Infinity,
});
export const useDmData = () => useQuery(dmDataQuery);
