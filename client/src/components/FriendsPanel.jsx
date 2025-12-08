import React, { useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";

import { Flex } from "@mantine/core";
import { Outlet, useOutletContext } from "react-router-dom";
import { useAllFriends } from "../custom-hooks/useAllFriends";
import { useEffect } from "react";
import { useReceiverStore } from "../stores/useReceiverStore";

const FriendsPanel = () => {
  const outletContext = useOutletContext();
  const [activeComp, setActiveComp] = useState(0);
  const { allFriendsLastUpdatedAt } = useOutletContext();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isSuccess,
    dataUpdatedAt,
  } = useAllFriends();
  const addReceiver = useReceiverStore((s) => s.addToReceivers);
  const receivers = useReceiverStore((s) => s.receivers);
  const newdata = data?.pages.flatMap(({ friends }) => friends) ?? [];

  useEffect(() => {
    if (!isSuccess) return;
    if (!data) return;
    if (dataUpdatedAt === allFriendsLastUpdatedAt.current) return;

    allFriendsLastUpdatedAt.current = dataUpdatedAt;
    // console.log();

    newdata.forEach((e) => addReceiver(e.id, e));
  }, [newdata]);

  return (
    <>
      <Flex color="white" direction={"column"} h={"100%"}>
        <FriendsPanelTop props={[setActiveComp, activeComp]} />
        <Outlet context={outletContext} />
      </Flex>
    </>
  );
};

export default FriendsPanel;
