import { useInfiniteQuery } from "@tanstack/react-query";

const fetchMoreData = async (pageParam, chatId) => {
  try {
    const res = await fetch(`/api/dm/moreData/${chatId}?nextId=${pageParam}`);
    const data = await res.json();

    if (!res.ok) {
      console.log("ERROR");
      throw new Error(data.error);
    }
    console.log("Fethcing...");

    return data;
  } catch (error) {
    console.log(error.message);
  }
};

export const useChatMessages = (chatId) => {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: ({ pageParam }) => fetchMoreData(pageParam, chatId),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextId,
    staleTime: Infinity,
  });
};
