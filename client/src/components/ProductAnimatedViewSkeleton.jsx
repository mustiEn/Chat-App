import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Flex, Box, Image } from "@mantine/core";
import "react-loading-skeleton/dist/skeleton.css";

const ProductAnimatedViewSkeleton = ({ styles, animatedViewName }) => {
  const middleView = (num) => {
    return num == 2
      ? {
          backgroundImage: `url(/images/${animatedViewName})`,
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
      <Flex direction="column" justify="center" h="100%" p="sm">
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            pos="relative"
            p="sm"
            style={{
              border: i === 2 ? "1px solid rgba(108,117,125,0.1)" : "none",
              borderRadius: i === 2 ? 8 : 0,
            }}
          >
            <Flex
              align="center"
              gap="sm"
              pos="relative"
              style={{ lineHeight: 0, height: 32, zIndex: 1 }}
            >
              {i === 2 && (
                <Flex
                  align="center"
                  gap="sm"
                  pos="absolute"
                  style={{ zIndex: 2 }}
                  className={styles["profile"]}
                >
                  <Image
                    src="/images/mona.jpg"
                    w={32}
                    h={32}
                    style={{ borderRadius: "50%" }}
                  />
                  <div className="text-white">Hack Daniels</div>
                </Flex>
              )}

              {/* Skeletons unchanged */}
              <Skeleton
                circle
                width={32}
                height={32}
                className={i === 2 && styles["profile-skeleton"]}
              />
              <Skeleton
                width={200}
                height={15}
                className={i === 2 && styles["profile-skeleton"]}
              />
            </Flex>

            <Box
              pos="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              style={middleView(i)}
              className={i === 2 ? styles["product-animated-view"] : ""}
            />
          </Box>
        ))}

        <Box
          pos="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          className={styles["filter"]}
          style={{ zIndex: 2 }}
        />
      </Flex>
      ;
    </>
  );
};

export default ProductAnimatedViewSkeleton;
