import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductAnimatedViewSkeleton = ({ styles, animatedViewName }) => {
  const middleView = (num) => {
    return num == 2
      ? {
          backgroundImage: `url(/${animatedViewName})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "100% 30%",
          maskImage:
            "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
        }
      : null;
  };

  return (
    <>
      <div className="d-flex flex-column justify-content-center h-100 p-2">
        <SkeletonTheme
          baseColor="#36363a"
          enableAnimation={false}
          borderRadius={20}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div
              className={
                i == 2
                  ? "border border-opacity-10 border-secondary p-2 position-relative rounded-2 position-relative"
                  : "position-relative p-2"
              }
              key={i}
            >
              <div
                className="d-flex align-items-center gap-2 position-relative z-1"
                style={{
                  lineHeight: 0,
                  height: 32,
                }}
              >
                {i == 2 && (
                  <div
                    className={`d-flex align-items-center gap-2 ${styles["profile"]} position-absolute z-2`}
                  >
                    <img
                      src="mona.jpg"
                      width={32}
                      height={32}
                      className="rounded-circle"
                      alt=""
                    />
                    <div className="text-white">Hack Daniels</div>
                  </div>
                )}
                <Skeleton
                  circle
                  width={32}
                  height={32}
                  className={i == 2 && `${styles["profile-skeleton"]}`}
                />
                <Skeleton
                  width={200}
                  height={15}
                  className={i == 2 && `${styles["profile-skeleton"]}`}
                />
              </div>
              <div
                className={
                  i == 2
                    ? `h-100 position-absolute start-0 top-0 w-100 z-0 rounded-1 ${styles["product-animated-view"]}`
                    : "h-100 position-absolute start-0 top-0 w-100 z-0 rounded-1"
                }
                style={middleView(i)}
              ></div>
            </div>
          ))}
          <div
            className={`${styles["filter"]} h-100 position-absolute start-0 top-0 w-100 z-2`}
          ></div>
        </SkeletonTheme>
      </div>
    </>
  );
};

export default ProductAnimatedViewSkeleton;
