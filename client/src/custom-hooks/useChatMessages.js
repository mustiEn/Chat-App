import { useInfiniteQuery } from "@tanstack/react-query";

const fetchMoreData = async (pageParam, receiverId) => {
  try {
    const res = await fetch(
      `/api/dm/moreData/${receiverId}?nextId=${pageParam}`
    );
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

export const useChatMessages = (receiverId) => {
  return useInfiniteQuery({
    queryKey: ["chatMessages", receiverId],
    queryFn: ({ pageParam }) => fetchMoreData(pageParam, receiverId),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextId,
    staleTime: Infinity,
  });
};
