import { useQuery } from "@tanstack/react-query";

const getPinnedMessages = async (groupId) => {
  try {
    const res = await fetch(`/api/group/pinned-messages/${groupId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useGroupPinnedMessages = (groupId) => {
  return useQuery({
    queryKey: ["groupPinnedMessages", groupId],
    queryFn: () => getPinnedMessages(groupId),
    staleTime: Infinity,
    enabled: false,
  });
};
