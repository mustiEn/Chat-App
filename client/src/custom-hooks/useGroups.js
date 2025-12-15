import { useQuery } from "@tanstack/react-query";

const getGroups = async () => {
  try {
    const res = await fetch(`/api/group/get-groups`);
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
export const groupsQuery = () => ({
  queryKey: ["groups"],
  queryFn: getGroups,
});
export const useGroups = () => {
  const query = groupsQuery();
  return useQuery(query);
};
