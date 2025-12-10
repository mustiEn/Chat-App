import { useQuery } from "@tanstack/react-query";

const searchFriends = async (param) => {
  try {
    if (!param) return [];
    // const res = await fetch(`/api/search-friends/${param}`);
    const res = await fetch(`https://dummyjson.com/users/search?q=${param}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const useSearchFriends = (param) =>
  useQuery({
    queryKey: ["searchFriends", param],
    queryFn: () => searchFriends(param),
    enabled: !!param.length,
  });
