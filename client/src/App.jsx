import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/Layout";
import MainPanel from "./components/MainPanel";
import GroupChatPanel from "./components/GroupChatPanel";
import DmPanel from "./components/DmPanel";
import Sidebar from "./components/Sidebar";
import DmSidebarNav from "./components/DmSidebarNav";
import FriendsPanel from "./components/FriendsPanel";
import OnlineFriends from "./components/OnlineFriends";
import AllFriends from "./components/AllFriends";
import Shop from "./components/Shop";
import AddFriend from "./components/AddFriend";
// import { socket } from "./socket.js";
// import { SocketProvider } from "./context_providers/SocketContext.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          element: <MainPanel />,
          children: [
            {
              path: "friends",
              element: <FriendsPanel />,
              children: [
                {
                  index: true,
                  element: <OnlineFriends />,
                },
                {
                  path: "all",
                  element: <AllFriends />,
                },
                {
                  path: "add-friend",
                  element: <AddFriend />,
                },
              ],
            },
            {
              path: "@me/:userId?",
              element: <DmPanel />,
            },
            // {
            //   path: "@me/:userId?",
            //   element: <DmPanel />,
            // },
            {
              path: "group-chat",
              element: <GroupChatPanel />,
            },
            {
              path: "shop",
              element: <Shop />,
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
