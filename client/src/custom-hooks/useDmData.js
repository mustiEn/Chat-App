import { useQuery } from "@tanstack/react-query";

const getDmData = async (chatId) => {
  try {
    const res = await fetch(`/api/dm/initialChatData/${chatId}`);
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
  // queryKey: ["chatMessages", chatId],
  queryKey: ["initialChatData", chatId],
  queryFn: () => getDmData(chatId),
  staleTime: Infinity,
});
export const useDmData = () => useQuery(dmDataQuery);
