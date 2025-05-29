import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/Layout";
import MainPanel from "./components/MainPanel";
import GroupChatPanel from "./components/GroupChatPanel";
import DmPanel from "./components/DmPanel";
import Sidebar from "./components/Sidebar";
import DmSidebarNav from "./components/DmSidebarNav";
// import { socket } from "./socket.js";
// import { SocketProvider } from "./context_providers/SocketContext.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          // index: true,
          element: <MainPanel />,
          children: [
            {
              index: true,
              element: <DmPanel />,
            },
          ],
        },
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
