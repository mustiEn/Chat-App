import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const editGroup = async (formData) => {
  try {
    const res = await fetch("/api/group/edit-group", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (error) {
    toast.error(error.message);
  }
};

export const useEditGroupMutation = (queryClient) =>
  useMutation({
    mutationFn: (formData) => editGroup(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
    onError: (data) => {
      console.log(data);
      toast.error("Something went wrong");
    },
  });
