import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DmHistorySkeleton = () => {
  return (
    <SkeletonTheme
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
    </SkeletonTheme>
  );
};

export default DmHistorySkeleton;
