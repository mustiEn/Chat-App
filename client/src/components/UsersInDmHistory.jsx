import React, { memo, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
import DmHistorySkeleton from "./DmHistorySkeleton";
import { Box, Button, Flex, Image, Stack, Text } from "@mantine/core";
import { useDmHistory } from "../custom-hooks/useDmHistory.js";
// import DmHistorySkeleton from "./DmHistorySkeleton";

const UsersInDmHistory = memo(function UsersInDmHistory() {
  const setHeader = useContext(HeaderContext);
  const { data, isLoading } = useDmHistory();

  return (
    <>
      <Stack gap={"xs"}>
        {isLoading ? (
          <DmHistorySkeleton />
        ) : !data.length ? (
          <DmHistorySkeleton />
        ) : (
          data.map((e, i) => (
            <Box
              key={e.id}
              // className="position-relative"
              w={"100%"}
              h={45}
              onClick={() => setHeader(e.display_name)}
            >
              <NavLink to={`${e.chatId}`}>
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
