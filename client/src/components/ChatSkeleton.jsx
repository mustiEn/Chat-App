import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Box, Flex } from "@mantine/core";

const ChatSkeleton = () => {
  const rowVariants = [
    { name: 120, row1: [170, 80, 110, 40], row2: [50, 60, 130] },
    { name: 145, row1: [140, 95, 100, 55], row2: [65, 45, 115] },
    { name: 105, row1: [160, 70, 120, 35], row2: [60, 75, 140] },
    { name: 135, row1: [185, 85, 90, 60], row2: [70, 55, 125] },
    // { name: 115, row1: [150, 100, 130, 45], row2: [55, 65, 135] },
    // { name: 130, row1: [175, 65, 105, 50], row2: [75, 50, 120] },
    // { name: 125, row1: [165, 110, 95, 70], row2: [80, 60, 145] },
  ];
  return (
    <>
      <SkeletonTheme
        baseColor="#36363a"
        enableAnimation={true}
        borderRadius={20}
        // width={100}
      >
        <Flex w={"100%"} direction={"column"} gap={"xl"}>
          {rowVariants.map((variant, i) => (
            <Flex
              gap={"md"}
              ms={"md"}
              key={i}
              style={{
                zIndex: 1,
              }}
            >
              <Skeleton circle width={40} height={40} />
              <Box mt={"md"}>
                {/* Name */}
                <Skeleton width={variant.name} height={15} baseColor="white" />

                {/* First row */}
                <Flex gap={"md"} my={"md"}>
                  {variant.row1.map((w, j) => (
                    <Skeleton key={j} width={w} height={20} />
                  ))}
                </Flex>

                {/* Second row */}
                <Flex gap={"md"}>
                  {variant.row2.map((w, j) => (
                    <Skeleton key={j} width={w} height={20} />
                  ))}
                </Flex>
              </Box>
            </Flex>
          ))}
        </Flex>
      </SkeletonTheme>
    </>
  );
};

export default ChatSkeleton;
