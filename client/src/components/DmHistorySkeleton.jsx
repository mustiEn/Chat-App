import { Box, Flex } from "@mantine/core";
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
      <Flex direction="column" gap="md">
        {Array.from({ length: 6 }, (_, i) => (
          <Flex align="center" gap="sm" key={i}>
            <Skeleton circle width={32} height={32} />

            <Box
              style={{
                width: "150px",
                display: "block",
              }}
            >
              <Skeleton />
            </Box>
          </Flex>
        ))}
      </Flex>
    </SkeletonTheme>
  );
};

export default DmHistorySkeleton;
