// import React, { createContext, useState, useEffect } from "react";
// import { socket } from "../socket";

// const SocketContext = createContext();

// const SocketProvider = ({ children }) => {
//   const [socketVal, setSocketVal] = useState(false);

//   useEffect(() => {
//     const onConnectErr = (err) => {
//       console.log("Connection error!");
//       console.log(err.message, err.description, err.context);
//     };
//     const onConnect = () => {
//       setSocketVal(true);
//       socket.emit("join group");
//       console.log("group joined");
//       console.log("SOCKET PROVIDER", socket.connected);
//     };

//     socket.connect();
//     socket.on("connect", onConnect);
//     socket.on("connect_error", onConnectErr);

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("connect_error", onConnectErr);
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socketVal}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export { SocketProvider };
