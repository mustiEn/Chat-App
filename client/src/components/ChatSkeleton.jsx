import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const ChatSkeleton = () => {
  return (
    <>
      <SkeletonTheme
        baseColor="#36363a"
        enableAnimation={false}
        borderRadius={20}
      >
        <div className="d-flex flex-column gap-4">
          {Array.from({ length: 13 }, (_, i) => (
            <>
              <div className="d-flex gap-2 ms-2 z-1" key={i}>
                <Skeleton circle width={40} height={40} />
                <div className="mt-2">
                  <Skeleton width={125} height={15} baseColor="white" />
                  <div className="d-flex gap-2 my-2">
                    <Skeleton width={175} height={20} />
                    <Skeleton width={75} height={20} />
                    <Skeleton width={105} height={20} />
                    <Skeleton width={35} height={20} />
                  </div>
                  <div className="d-flex gap-2">
                    <Skeleton width={45} height={20} />
                    <Skeleton width={45} height={20} />
                    <Skeleton width={125} height={20} />
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </SkeletonTheme>
    </>
  );
};

export default ChatSkeleton;
