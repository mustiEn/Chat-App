import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import MainPanel from "./components/MainPanel";
import GroupChatPanel from "./components/GroupChatPanel";
import DmPanel from "./components/DmPanel";
import FriendsPanel from "./components/FriendsPanel";
import Shop from "./components/Shop";
import Login from "./views/Login";
import * as Loader from "./loaders/index.js";
import Logout from "./views/Logout.jsx";
import MessageRequests from "./components/MessageRequests.jsx";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "@me",
          element: <MainPanel />,
          children: [
            {
              index: true,
              element: <FriendsPanel />,
            },
            {
              path: ":userId",
              element: <DmPanel />,
              loader: Loader.loadDmData(queryClient),
            },
            {
              path: "shop",
              element: <Shop />,
            },
            {
              path: "requests",
              element: <MessageRequests />,
            },
            {
              path: "group-chat",
              element: <GroupChatPanel />,
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/logout",
      element: <Logout />,
      loader: async () => {
        const res = await fetch("/api/logout");
        return res;
      },
    },
  ]);

  return <RouterProvider router={router} />;
}
export default App;
