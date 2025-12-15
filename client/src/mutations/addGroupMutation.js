import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const addGroup = async (newGroup) => {
  try {
    const res = await fetch("/api/group/add-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { newGroup },
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    toast.error(error.message);
  }
};

export const addGroupMutation = (queryClient) =>
  useMutation({
    mutationFn: (newGroup) => addGroup(newGroup),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
