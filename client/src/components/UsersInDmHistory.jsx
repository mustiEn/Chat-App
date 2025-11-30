import React, { memo, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
import DmHistorySkeleton from "./DmHistorySkeleton";
import { Box, Button, Flex, Image, Stack, Text } from "@mantine/core";
import { useDmHistory } from "../custom-hooks/useDmHistory.js";
import UserStatus from "./UserStatus.jsx";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useReceiverStore } from "../stores/useReceiverStore.js";
// import DmHistorySkeleton from "./DmHistorySkeleton";

const UsersInDmHistory = memo(function UsersInDmHistory() {
  const { t, i18n } = useTranslation();
  const setHeader = useContext(HeaderContext);
  const { data, isLoading, isSuccess } = useDmHistory();
  const [lng, setLng] = useState("en");
  const handleLangSwitch = (lng) => {
    i18n.changeLanguage(lng);
    setLng(lng);
  };
  const addReceiver = useReceiverStore((s) => s.addToReceivers);
  const receivers = useReceiverStore((s) => s.receivers);

  useEffect(() => {
    if (!isSuccess) return;
    if (!data) return;

    data.forEach((e) => addReceiver(e.id, e));
  }, [data]);

  return (
    <>
      <Stack gap={"xs"}>
        {isLoading ? (
          <DmHistorySkeleton />
        ) : !data?.length ? (
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
                    <div
                      style={{
                        position: "relative",
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Image
                        src={e.profile ?? "https://placehold.co/32"}
                        radius={"xl"}
                        alt=""
                      />
                      {receivers[e.id]?.status && (
                        <UserStatus
                          status={receivers[e.id].status}
                          w={12}
                          h={12}
                          absolute={true}
                        />
                      )}
                    </div>
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
      <Button onClick={() => handleLangSwitch("tr")}>turkish</Button>
      <Button onClick={() => handleLangSwitch("en")}>english</Button>
      <div>{t("hi")}</div>
    </>
  );
});

export default UsersInDmHistory;
