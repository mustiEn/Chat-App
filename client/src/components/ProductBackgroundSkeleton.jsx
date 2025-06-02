import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const ProductProfileSkeleton = () => {
  return (
    <>
      <SkeletonTheme
        baseColor="#36363a"
        enableAnimation={false}
        borderRadius={20}
      >
        <div
          className="w-100"
          style={{ height: 100, backgroundColor: "rgb(39 39 45)" }}
        ></div>
        <div
          style={{
            width: 55,
            height: 55,
            transform: "translateY(-55%)",
          }}
          className="position-relative ms-2 z-1"
        >
          <Skeleton circle width={55} height={55} />
          <div
            className="bg-success position-absolute top-100 translate-middle rounded-circle"
            style={{
              left: "85%",
              width: 15,
              height: 15,
            }}
          >
            &nbsp;
          </div>
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
    </>
  );
};

export default ProductProfileSkeleton;
