import { useQuery } from "@tanstack/react-query";

const getFriendRequests = async () => {
  try {
    const res = await fetch(`/api/get-friend-requests`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("getFriendRequests failed");
  }
};
export const useFriendRequests = () =>
  useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    staleTime: Infinity,
  });
