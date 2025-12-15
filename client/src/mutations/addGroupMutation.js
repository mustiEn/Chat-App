import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const addGroup = async (formData) => {
  try {
    const res = await fetch("/api/group/add-group", {
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

export const addGroupMutation = (queryClient, close, form) =>
  useMutation({
    mutationFn: (formData) => addGroup(formData),
    onSuccess: () => {
      toast.success("New group added");
      close();
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
