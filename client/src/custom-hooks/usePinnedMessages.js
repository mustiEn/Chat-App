import { useQuery } from "@tanstack/react-query";

const getPinnedMessages = async (receiverId) => {
  const res = await fetch(`/api/dm/pinned-messages/${receiverId}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data;
};

export const usePinnedMessages = (receiverId) => {
  return useQuery({
    queryKey: ["pinnedMessages", receiverId],
    queryFn: () => getPinnedMessages(receiverId),
    staleTime: Infinity,
    enabled: false,
  });
};
