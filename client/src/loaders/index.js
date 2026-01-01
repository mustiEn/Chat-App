import { useQuery } from "@tanstack/react-query";
import { dmDataQuery } from "../custom-hooks/useDmData";
import { groupsQuery } from "../custom-hooks/useGroups";
import { groupDataQuery } from "../custom-hooks/useGroupData";

export const loadDmData =
  (queryClient) =>
  async ({ params }) => {
    const { chatId } = params;
    const query = dmDataQuery(chatId);
    await queryClient.ensureQueryData(query);

    return null;
  };
export const loadGroups = (queryClient) => async () => {
  const query = groupsQuery();
  await queryClient.ensureQueryData(query);

  return null;
};
export const loadGroupData =
  (queryClient) =>
  async ({ params }) => {
    const { groupId } = params;
    const query = groupDataQuery(groupId);
    await queryClient.ensureQueryData(query);

    return null;
  };
