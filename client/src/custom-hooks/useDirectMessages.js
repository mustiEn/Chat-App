import { useInfiniteQuery } from "@tanstack/react-query";

const fetchMoreData = async (pageParam, chatId) => {
  try {
    const res = await fetch(
      `/api/dm/more-data/${chatId}?nextIdParam=${pageParam}`
    );
    const data = await res.json();

    if (!res.ok) {
      console.log("ERROR");
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const useDirectMessages = (chatId) => {
  return useInfiniteQuery({
    queryKey: ["directMessages", chatId],
    queryFn: ({ pageParam }) => fetchMoreData(pageParam, chatId),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextId,
    staleTime: Infinity,
  });
};
