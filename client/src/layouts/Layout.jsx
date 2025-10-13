import ServerList from "../components/ServerList";
import Header from "../components/Header";
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderProvider from "../contexts/HeaderContext";
import { socket } from "../socket";
import { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const Layout = () => {
  const queryClient = useQueryClient();

  const [header, setHeader] = useState("Friends");
  const value = setHeader;

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
        <HeaderProvider value={value}>
          <ServerList />
          <Outlet />
        </HeaderProvider>
      </div>
      <Toaster position="top-right" />
    </>
  );
};

export default Layout;
