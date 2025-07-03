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
// import { socket } from "./socket.js";
// import { SocketProvider } from "./context_providers/SocketContext.jsx";

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
              // path: "friends",
              index: true,
              element: <FriendsPanel />,
              // children: [
              //   {
              //     index: true,
              //     element: <OnlineFriends />,
              //   },
              //   {
              //     path: "all",
              //     element: <AllFriends />,
              //   },
              //   {
              //     path: "add-friend",
              //     element: <AddFriend />,
              //   },
              // ],
            },
            {
              path: ":userId",
              element: <DmPanel />,
              loader: Loader.loadDmData,
            },
            {
              path: "shop",
              element: <Shop />,
            },
          ],
        },
        {
          path: "/group-chat",
          element: <MainPanel />,
          children: [
            {
              element: <GroupChatPanel />,
            },
          ],
        },

        // {
        //   element: <MainPanel />,
        //   children: [
        //     {
        //       index: true,
        //       element: (
        //         <>
        //           <Sidebar />
        //           <DmPanel />
        //         </>
        //       ),
        //     },
        //     {
        //       path: "/groupchat",
        //       element: (
        //         <>
        //           <Sidebar />
        //           <GroupChatPanel/>
        //         </>
        //       ),
        //     },
        //   ],
        // },
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

    // ^ --------------

    // {
    //   element: <MainPanel />,
    //   children: [
    //     {
    //       element: <Sidebar />,
    //       children: [
    //         {
    //           index: true,
    //           element: <DmSidebarNav />,
    //         },
    //       ],
    //     },
    //   ],
    // },

    //^ ------------

    // { path: "/friends", element: <Sidebar /> },
    // {
    //   path: "/login",
    //   element: <Login />,
    // },
    // {
    //   path: "/signup",
    //   element: <Signup />,
    // },
    // {
    //   path: "/logout",
    // },
    // {
    //   // path: "/",
    //   element: (
    //     <SocketProvider>
    //       <Layout />
    //     </SocketProvider>
    //   ),
    //   errorElement: <ErrorPage />,
    //   children: [
    //     {
    //       path: "/",
    //       element: <Home />,
    //     },
    //     {
    //       path: "/explore",
    //       element: <Explore />,
    //     },
    //     {
    //       path: "/explore/chat-view/:userId",
    //       element: <DmPanel />,
    //     },
    //     {
    //       path: "/explore/groups/:id",
    //       element: <Group />,
    //     },
    //   ],
    // },
  ]);

  return <RouterProvider router={router} />;
}
export default App;
