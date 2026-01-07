import GroupList from "../components/GroupList";
import Header from "../components/Header";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderProvider from "../contexts/HeaderContext";
import { Flex } from "@mantine/core";
import { useAuthUserStore } from "../stores/useAuthUserStore";
import AuthUserFallback from "../components/AuthUserFallback.jsx";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { returnLocalNow } from "../utils/index.js";
import { socket } from "../socket.js";

const Layout = () => {
  const [header, setHeader] = useState("Friends");
  const value = setHeader;
  const authUser = useAuthUserStore((s) => s.authUser);
  const setAuthUser = useAuthUserStore((s) => s.setAuthUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("authUser: ", authUser);

    return () => console.log("clean up authUser: ", authUser);
  }, [authUser]);

  useEffect(() => {
    const onConnect = () => {
      console.log("✅ Socket connected");
    };
    const onConnectErr = (err) => {
      console.error("❌ Socket connection error:", err);
    };
    const getInitial = (user) => {
      // const now = returnLocalNow();

      socket.auth.user = user;
      // lastActivity.current = now.valueOf();
      setTimeout(() => {
        setAuthUser(user);
      }, 4000);

      console.log("user", user);
    };
    const onDisconnect = (reason) => {
      console.log("❌ Socket disconnected, ", reason);
    };

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectErr);
    socket.on("initial", getInitial);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", (err) =>
      console.error("⚠️ Connect error:", err)
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectErr);
      socket.off("initial", getInitial);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();

      setAuthUser(null);
      queryClient.removeQueries();
      console.log("SOCKET DISCONNECTED layout");
    };
  }, []);

  return (
    <>
      {authUser?.id ? (
        <>
          <Header content={header} />

          <HeaderProvider value={value}>
            <Flex h={"calc(100% - var(--header-height))"}>
              <GroupList />
              <Outlet />
            </Flex>
          </HeaderProvider>
        </>
      ) : (
        <AuthUserFallback />
      )}
    </>
  );
};

export default Layout;
