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
      throw new Error(data.msg);
    }

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("loadDmData failed");
  }
};

export const dmDataQuery = (receiverId) => ({
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
