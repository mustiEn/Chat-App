import { useQuery } from "@tanstack/react-query";

const getDmHistory = async () => {
  const res = await fetch("/api/dmHistory");
  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  return data;
};

export const useDmHistory = () => {
  return useQuery({
    queryKey: ["dmHistory"],
    queryFn: getDmHistory,
    staleTime: Infinity,
  });
};
