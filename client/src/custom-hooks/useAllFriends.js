import { useInfiniteQuery } from "@tanstack/react-query";

const getAllFriends = async ({ pageParam }) => {
  try {
    const res = await fetch(`/api/get-all-friends/${pageParam}`);
    // const res = await fetch(
    //   `https://dummyjson.com/users?limit=20&skip=${pageParam}`
    // );
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);
    // const newData = {
    //   friends: data.users.map((e) => ({
    //     ...e,
    //     id: e.id === 2 ? 1000 : e.id === 1 ? 200 : e.id,
    //     display_name: e.firstName,
    //     profile: e.image,
    //   })),
    // };
    return data;
  } catch (error) {
    toast.error(error.message);
  }
};

export const useAllFriends = () => {
  return useInfiniteQuery({
    queryKey: ["allFriends"],
    queryFn: getAllFriends,
    initialPageParam: 0,
    getNextPageParam: (lastData) => lastData.next,
    staleTime: Infinity,
  });
};
