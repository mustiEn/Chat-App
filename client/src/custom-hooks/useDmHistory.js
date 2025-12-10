import { useQuery } from "@tanstack/react-query";

const getDmHistory = async () => {
  try {
    const res = await fetch("/api/dmHistory");
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useDmHistory = () => {
  return useQuery({
    queryKey: ["dmHistory"],
    queryFn: getDmHistory,
    staleTime: Infinity,
  });
};
