import { Box, Flex } from "@mantine/core";
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
        <Box
          w="100%"
          style={{ height: 100, backgroundColor: "rgb(39 39 45)" }}
        />

        <Box
          style={{
            width: 55,
            height: 55,
            transform: "translateY(-55%)",
            position: "relative",
            marginLeft: 5,
            zIndex: 1,
          }}
        >
          <Skeleton circle width={55} height={55} />

          <Box
            bg="green"
            pos="absolute"
            top="100%"
            style={{
              left: "85%",
              transform: "translate(-50%, -50%)",
              width: 15,
              height: 15,
              borderRadius: "50%",
            }}
          >
            &nbsp;
          </Box>

          <Box mt="xs">
            <Skeleton width={125} height={30} />

            <Flex gap="sm" my="xs">
              <Skeleton width={175} height={30} />
              <Skeleton width={75} height={30} />
            </Flex>

            <Flex gap="sm">
              <Skeleton width={45} height={30} />
              <Skeleton width={45} height={30} />
              <Skeleton width={125} height={30} />
            </Flex>
          </Box>
        </Box>
      </SkeletonTheme>
    </>
  );
};

export default ProductProfileSkeleton;
