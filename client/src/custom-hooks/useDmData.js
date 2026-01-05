import { useQuery } from "@tanstack/react-query";

const getInitials = async (chatId) => {
  try {
    const res = await fetch(`/api/dm/initial-dm-data/${chatId}`);
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
  queryKey: ["initialDmData", chatId],
  queryFn: () => getInitials(chatId),
  staleTime: Infinity,
});
export const useDmData = (chatId) => useQuery(dmDataQuery(chatId));
