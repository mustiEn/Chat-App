import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./views/Login";
import Layout from "./layout/Layout";
import Signup from "./views/Signup";
import VerifyEmail from "./views/VerifyEmail";
import ErrorPage from "./views/ErrorPage";
import Explore from "./components/Explore";
import Chats from "./components/Chats";
import ChatView from "./components/ChatView";
import { socket } from "./socket.js";
import Home from "./views/Home";
import { SocketProvider } from "./context_providers/SocketContext.jsx";
import Group from "./components/Group.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/logout",
    },
    {
      path: "/verify-email",
      element: <VerifyEmail />,
    },
    {
      // path: "/",
      element: (
        <SocketProvider>
          <Layout />
        </SocketProvider>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/explore",
          element: <Explore />,
        },
        {
          path: "/explore/chat-view/:userId",
          element: <ChatView />,
        },
        {
          path: "/explore/groups/:id",
          element: <Group />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
export default App;
