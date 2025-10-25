import React, { memo, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
import { useQuery } from "@tanstack/react-query";
import DmHistorySkeleton from "./DmHistorySkeleton";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore.js";
import { useShallow } from "zustand/shallow";
import { Box, Button, Flex, Image, Stack, Text } from "@mantine/core";
// import DmHistorySkeleton from './DmHistorySkeleton'

const UsersInDmHistory = memo(function UsersInDmHistory() {
  const setHeader = useContext(HeaderContext);
  const dmHistoryUsers = useDmHistoryUserStore((state) => state.dmHistoryUsers);
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (state) => state.addToDmHistoryUsers
  );
  const getDmHistory = async () => {
    const res = await fetch("/api/dmHistory");
    const { dmHistoryResult } = await res.json();
    console.log("dmHistoryResult");

    if (!res.ok) throw new Error(dmHistoryResult.error);

    return dmHistoryResult;
  };
  const { data, error, isError, isSuccess, isLoading } = useQuery({
    queryKey: ["dmHistory"],
    queryFn: getDmHistory,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isSuccess) return;
    if (!data?.length) return;
    if (dmHistoryUsers.length) return;

    addToDmHistoryUsers(data);
  }, [data]);

  return (
    <>
      <Stack gap={"xs"}>
        {isLoading ? (
          <DmHistorySkeleton />
        ) : !dmHistoryUsers.length ? (
          <DmHistorySkeleton />
        ) : (
          dmHistoryUsers.map((e, i) => (
            <Box
              key={e.id}
              // className="position-relative"
              w={"100%"}
              h={45}
              onClick={() => setHeader(e.display_name)}
            >
              <NavLink to={`${e.id}`}>
                <Button
                  color={"dark"}
                  w={"100%"}
                  h={"100%"}
                  justify="flex-start"
                  style={{
                    position: "relative",
                  }}
                >
                  <Box
                    w={"100%"}
                    h={"100%"}
                    style={{
                      // backgroundImage: "url(/atomic.gif)",
                      zIndex: 0,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "100% 30%",
                      maskImage:
                        "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
                      WebkitMaskImage:
                        "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
                    }}
                  ></Box>
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    style={{
                      position: "absolute",
                      zIndex: 1,
                    }}
                  >
                    <Image
                      src={e.profile ?? "https://placehold.co/32"}
                      radius={"xl"}
                      alt=""
                    />
                    <Text>
                      {e.display_name?.length > 15
                        ? e.display_name.slice(15).concat("...")
                        : e.display_name}
                    </Text>
                  </Flex>
                </Button>
              </NavLink>
            </Box>
          ))
        )}
      </Stack>
    </>
  );
});

export default UsersInDmHistory;
