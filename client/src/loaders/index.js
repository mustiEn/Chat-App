export const loadUserDm = async () => {
  try {
    const res = await fetch("/api/dms");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to load DMs");
  }
};
