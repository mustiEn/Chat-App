import ServerList from "../components/ServerList";
import Header from "../components/Header";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderProvider from "../contexts/HeaderContext";
import { useQueryClient } from "@tanstack/react-query";
import { Container, Flex } from "@mantine/core";

const Layout = () => {
  const [header, setHeader] = useState("Friends");
  const value = setHeader;

  return (
    <>
      <Header content={header} />

      <HeaderProvider value={value}>
        <Flex h={"calc(100% - 30px)"}>
          <ServerList />
          <Outlet />
        </Flex>
      </HeaderProvider>

      {/* </div> */}
    </>
  );
};

export default Layout;
