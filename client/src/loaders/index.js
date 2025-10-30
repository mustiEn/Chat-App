const getDmData = async (receiverId) => {
  try {
    const offset = 0;
    const res = await fetch(`/api/dm/initialData/${offset}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("loadDmData failed");
  }
};
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

export const dmDataQuery = (receiverId) => ({
  queryKey: ["chatMessages", receiverId],
  queryFn: () => getDmData(receiverId),
  staleTime: Infinity,
});
export const friendRequestsQuery = () => ({
  queryKey: ["friendRequests"],
  queryFn: getFriendRequests,
  staleTime: Infinity,
});

export const loadDmData =
  (queryClient) =>
  async ({ params }) => {
    const { userId: receiverId } = params;
    const query = dmDataQuery(receiverId);
    await queryClient.ensureQueryData(query);

    return null;
  };

export const loadFriends = (queryClient) => async () => {
  const query = friendRequestsQuery();
  await queryClient.ensureQueryData(query);

  return null;
};
