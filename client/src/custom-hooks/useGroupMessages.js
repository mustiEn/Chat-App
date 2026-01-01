import { useInfiniteQuery } from "@tanstack/react-query";

const fetchMoreData = async (pageParam, groupId) => {
  try {
    const res = await fetch(
      `/api/group/more-data/${groupId}?nextId=${pageParam}`
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

export const useGroupMessages = (groupId) => {
  return useInfiniteQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: ({ pageParam }) => fetchMoreData(pageParam, groupId),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextId,
    staleTime: Infinity,
  });
};
