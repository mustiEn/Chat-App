import { useQuery } from "@tanstack/react-query";

const getDmHistory = async () => {
  const res = await fetch("/api/dmHistory");
  const { dmHistoryResult } = await res.json();

  if (!res.ok) throw new Error(dmHistoryResult.error);

  return dmHistoryResult;
};

export const useDmHistory = () => {
  return useQuery({
    queryKey: ["dmHistory"],
    queryFn: getDmHistory,
    staleTime: Infinity,
  });
};
