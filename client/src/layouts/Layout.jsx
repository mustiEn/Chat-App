import ServerList from "../components/ServerList";
import Header from "../components/Header";
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderProvider from "../contexts/HeaderContext";
import { socket } from "../socket";

const Layout = () => {
  const [header, setHeader] = useState("Friends");
  const value = setHeader;
  const onConnect = () => {
    console.log("✅ Socket connected");
  };
  const onConnectErr = (err) => {
    console.error("❌ Socket connection error:", err);
  };
  const getInitial = (userId) => {
    socket.auth.userId = userId;
  };
  const onDisconnect = () => {
    console.log("❌ Socket disconnected");
  };
  useEffect(() => {
    socket.connect();

    // console.log("SOCKET CONNECTED", socket.connected);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectErr);
    socket.on("initial", getInitial);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectErr);
      socket.off("initial", getInitial);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
      console.log("SOCKET DISCONNECTED layout");
    };
  }, []);

  return (
    <>
      <Header content={header} />
      <div
        id="responiveContainer"
        className="d-flex w-100 flex-grow-1"
        style={{
          height: "calc(100% - 30px)",
        }}
      >
        <HeaderProvider.Provider value={value}>
          <ServerList />
          <Outlet />
        </HeaderProvider.Provider>
      </div>
    </>
  );
};

export default Layout;
