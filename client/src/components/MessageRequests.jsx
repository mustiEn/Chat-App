import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { formatDate } from "../utils";
import styles from "../css/dm_panel.module.css";
import Button from "react-bootstrap/esm/Button";
import { socket } from "../socket";
import { useRef } from "react";
import { useMsgRequestStore } from "../stores/useMsgRequestStore";
import { useShallow } from "zustand/shallow";

const MessageRequests = () => {
  const [msgRequests, addToOthersRequests, removeFromOthersRequests] =
    useMsgRequestStore(
      useShallow((state) => [
        state.msgRequests,
        state.addToOthersRequests,
        state.removeFromOthersRequests,
      ])
    );
  const getMessageRequests = async () => {
    try {
      const res = await fetch("/api/message-requests");
      const data = await res.json();
      console.log("message - reqs");

      if (!res.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      throw new Error(error);
    }
  };
  const handleMessageRequestAcceptance = (status, msg) => {
    console.log(msg);

    const emitData = {
      reqMsg: msg,
      status,
    };
    const handleEmitCallback = (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Message failed:", err, res.error);
        return;
      }

      removeFromOthersRequests(msg.from_id);
      socket.auth.serverOffset[msg.from_id] = msg.id;

      console.log("Message succesfull: ", res);
    };

    socket.emit("send msg request acceptance", {}, emitData, (err, res) =>
      handleEmitCallback(err, res)
    );
  };

  const { data, error, isError, isLoading, isSuccess } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getMessageRequests,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (!isSuccess) return;
    if (!data.length) return;

    const anyIdAlreadyExists = msgRequests.fromOthers.some(
      ({ id }) => id == data[0].id
    );
    console.log(anyIdAlreadyExists);

    if (anyIdAlreadyExists) return;
    if (msgRequests.fromOthers.length) return;

    addToOthersRequests(data);
  }, [data]);

  return (
    <>
      <h3 className="text-white">Requests</h3>
      <br />
      <br />
      {isLoading ? (
        <div>Loading...</div>
      ) : !msgRequests.fromOthers?.length ? (
        <div>No data</div>
      ) : (
        msgRequests.fromOthers.map((msg) => (
          <div
            className={`${styles["aa"]} d-flex align-items-center gap-2 w-100 `}
            key={msg.id}
          >
            <img
              src={msg.profile ?? "https://placehold.co/40"}
              className="align-self-baseline rounded-circle"
              width={40}
              height={40}
              alt=""
            />
            <div className="d-flex flex-column w-100">
              <div className="d-flex align-items-center gap-2">
                <div className="fw-bold text-white">{msg.display_name}</div>
                <span className={`${styles["timestamp"]} text-muted`}>
                  {formatDate(msg.created_at)}
                </span>
              </div>

              <div className={`${styles["message-content"]} text-white`}>
                {msg.message}
              </div>
            </div>
            <Button
              variant="outline-info"
              className="ms-auto"
              onClick={() => handleMessageRequestAcceptance("accepted", msg)}
            >
              Accept
            </Button>
            <Button
              variant="outline-info"
              onClick={() => handleMessageRequestAcceptance("rejected", msg)}
            >
              Reject
            </Button>
          </div>
        ))
      )}
    </>
  );
};

export default MessageRequests;
