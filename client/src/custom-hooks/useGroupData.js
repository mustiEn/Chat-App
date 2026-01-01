import { useQuery } from "@tanstack/react-query";

const getGroupData = async (groupId) => {
  try {
    const res = await fetch(`/api/dm/initialGroupData/${groupId}`);
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
export const groupDataQuery = (groupId) => ({
  queryKey: ["initialGroupData", groupId],
  queryFn: () => getGroupData(groupId),
  staleTime: Infinity,
});
export const useGroupData = () => useQuery(groupDataQuery);
