import { useQuery } from "@tanstack/react-query";

const searchFriends = async (param, groupId) => {
  try {
    if (!param) return [];
    const res = await fetch(
      `/api/friends/search-friends/${groupId}?q=${param}`
    );
    // const res = await fetch(`https://dummyjson.com/users/search?q=${param}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const useSearchFriends = (param, groupId) =>
  useQuery({
    queryKey: ["searchFriends", param, groupId],
    queryFn: () => searchFriends(param, groupId),
    enabled: !!param.length,
  });
