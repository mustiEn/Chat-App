import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { formatDate } from "../utils";
import styles from "../css/dm_panel.module.css";
import Button from "react-bootstrap/esm/Button";
import { useOutletContext, useParams } from "react-router-dom";
import { socket } from "../socket";

const MessageRequests = () => {
  const { msgRequests, setMsgRequests } = useOutletContext();
  const getMessageRequests = async () => {
    try {
      const res = await fetch("/api/message-requests");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      throw new Error(error);
    }
  };
  const handleMessageRequestAcceptance = (status, msg) => {
    const payload = {
      reqMsg: msg,
      isAccepted: status,
    };
    const handleEmitCallback = (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Message failed:", err, res.error);
        return;
      }

      setMsgRequests((prev) => {
        const { [msg.from_id]: _, ...filtered } = prev.fromOthers;

        return {
          fromOthers: filtered,
          ...prev,
        };
      });
      socket.auth.serverOffset[msg.from_id] = msg.id;

      console.log("Message succesfull: ", res);
    };

    socket.emit("send msg request acceptance", {}, payload, (err, res) =>
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

    if (Object.keys(msgRequests.fromOthers).length) return;

    setMsgRequests((prev) => {
      const newD = data.reduce((acc, curr) => {
        acc[curr.from_id] = curr;
        return acc;
      }, {});

      return { ...prev, fromOthers: { ...newD } };
    });
  }, [data]);

  useEffect(() => {
    console.log(msgRequests);
  }, [msgRequests]);

  return (
    <>
      <h3 className="text-white">Requests</h3>
      <br />
      <br />
      {isLoading ? (
        <div>Loading...</div>
      ) : !Object.values(msgRequests.fromOthers)?.length ? (
        <div>No data</div>
      ) : (
        Object.values(msgRequests.fromOthers).map((msg) => (
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
