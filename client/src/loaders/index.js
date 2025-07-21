export const loadDmData = async ({ params }) => {
  try {
    const { userId: receiverId } = params;
    const offset = 0;
    const res = await fetch(`/api/dm/${offset}`, {
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

    console.log("data loaded indexjs");

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("loadDmData failed");
  }
};
