import { useQuery } from "@tanstack/react-query";

const getMessageRequests = async () => {
  try {
    const res = await fetch("/api/message-requests");
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

export const useMessageRequests = () =>
  useQuery({
    queryKey: ["messageRequests"],
    queryFn: getMessageRequests,
    staleTime: Infinity,
  });
