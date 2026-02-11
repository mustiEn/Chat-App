import { useQuery } from "@tanstack/react-query";

const getGroupInvites = async () => {
  try {
    const res = await fetch("/api/group/get-group-invites");
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useGroupInvites = () =>
  useQuery({
    queryKey: ["groupInvites"],
    queryFn: getGroupInvites,
    staleTime: Infinity,
  });
