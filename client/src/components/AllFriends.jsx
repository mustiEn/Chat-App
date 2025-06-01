import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Badge from "react-bootstrap/Badge";
import FriendsPanelTop from "./FriendsPanelTop";

const AllFriends = () => {
  return (
    <>
      <FriendsPanelTop />
      <div className="text-white">AllFriends</div>
      <div style={{ width: 300, height: 250 }}>
        <SkeletonTheme
          baseColor="#212020e3"
          enableAnimation={false}
          borderRadius={20}
        >
          <div className="bg-dark w-100" style={{ height: 100 }}></div>
          <div
            style={{ width: 55, height: 55, transform: "translateY(-55%)" }}
            className="position-relative ms-2"
          >
            <Skeleton circle width={55} height={55} />
            <Badge
              bg="success"
              className="position-absolute top-100 translate-middle rounded-circle"
              style={{
                left: "85%",
              }}
            >
              &nbsp;
            </Badge>
            <div className="mt-2">
              <Skeleton width={125} height={30} />
              <div className="d-flex gap-2 my-2">
                <Skeleton width={175} height={30} />
                <Skeleton width={75} height={30} />
              </div>
              <div className="d-flex gap-2">
                <Skeleton width={45} height={30} />
                <Skeleton width={45} height={30} />
                <Skeleton width={125} height={30} />
              </div>
            </div>
          </div>
        </SkeletonTheme>
      </div>
      {/* <SkeletonTheme
        baseColor="#212020e3"
        enableAnimation={false}
        height={20}
        borderRadius={20}
      >
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="d-flex align-items-center gap-2" key={i}>
              <Skeleton circle width={32} height={32} />
              <div
                style={{
                  width: "150px",
                  display: "block",
                }}
              >
                <Skeleton />
              </div>
            </div>
          ))}
        </div>
      </SkeletonTheme> */}
    </>
  );
};

export default AllFriends;
