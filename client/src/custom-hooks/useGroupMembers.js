import { useQuery } from "@tanstack/react-query";

const getGroupMembers = async (groupId) => {
  try {
    const res = await fetch(`/api/group/get-members/${groupId}`);
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

export const useGroupMembers = (groupId) =>
  useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId),
    staleTime: Infinity,
  });
