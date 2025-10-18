import React, { memo, useContext, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
import { useQuery } from "@tanstack/react-query";
import DmHistorySkeleton from "./DmHistorySkeleton";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore";
import { useShallow } from "zustand/shallow";
// import DmHistorySkeleton from './DmHistorySkeleton'

const UsersInDmHistory = memo(function UsersInDmHistory() {
  const setHeader = useContext(HeaderContext);
  const [dmHistoryUsers, addToDmHistoryUsers] = useDmHistoryUserStore(
    useShallow((state) => [state.dmHistoryUsers, state.addToDmHistoryUsers])
  );
  const getDmHistory = async () => {
    const res = await fetch("/api/dmHistory");
    const { dmHistoryResult } = await res.json();
    console.log("dmHistoryResult");

    if (!res.ok) throw new Error(dmHistoryResult.error);

    return dmHistoryResult;
  };
  const { data, error, isError, isSuccess, isLoading } = useQuery({
    queryKey: ["dmHistory"],
    queryFn: getDmHistory,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isSuccess) return;
    if (!data?.length) return;
    if (dmHistoryUsers.length) return;

    addToDmHistoryUsers(data);
  }, [data]);

  return (
    <>
      <ul className="d-flex flex-column gap-1">
        {isLoading ? (
          <DmHistorySkeleton />
        ) : !dmHistoryUsers.length ? (
          <DmHistorySkeleton />
        ) : (
          dmHistoryUsers.map((e, i) => (
            <li
              key={e.id}
              // className="position-relative"
              style={{ width: "100%", height: 45 }}
              onClick={() => setHeader(e.display_name)}
            >
              <Button
                variant={"dark"}
                as={NavLink}
                to={`${e.id}`}
                className={"position-relative w-100 h-100"}
              >
                <div
                  className="position-absolute w-100 h-100 top-0 start-0 z-0"
                  style={{
                    // backgroundImage: "url(/atomic.gif)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "100% 30%",
                    maskImage:
                      "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
                    WebkitMaskImage:
                      "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
                  }}
                ></div>
                <div className="d-flex align-items-center gap-3 position-absolute z-1">
                  <img
                    src={e.profile ?? "https://placehold.co/32"}
                    className="rounded-circle"
                    alt=""
                  />
                  <div>
                    {e.display_name?.length > 15
                      ? e.display_name.slice(15).concat("...")
                      : e.display_name}
                  </div>
                </div>
              </Button>
            </li>
          ))
        )}
      </ul>
    </>
  );
});

export default UsersInDmHistory;
