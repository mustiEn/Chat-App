const getDmData = async (receiverId) => {
  try {
    const res = await fetch(`/api/dm/initialChatData/${receiverId}`);
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

export const dmDataQuery = (receiverId) => ({
  // queryKey: ["chatMessages", receiverId],
  queryKey: ["initialChatData", receiverId],
  queryFn: () => getDmData(receiverId),
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
