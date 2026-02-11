import { Box, Divider, Flex, Grid, Text } from "@mantine/core";
import React from "react";
import PopoverComponent from "./PopoverComponent";
import { memo } from "react";
import styles from "../css/group_settings_modal_bg.module.css";
import { useState } from "react";

const bgs = [
  "black",
  "red",
  "yellow",
  "orange",
  "purple",
  "blue",
  "pink",
  "green",
];

const GroupSettingsBgs = memo(function GroupSettingsBgs({ setGroupState }) {
  const setBg = (bg) => {
    setGroupState((prev) => ({
      ...prev,
      background_color: bg,
    }));
  };
  const toUpper = (bg) => bg.slice(0, 1).toUpperCase() + bg.slice(1);

  return (
    <>
      <Text>Background Colours</Text>
      <Grid w={"100%"}>
        {bgs.map((bg, i) => {
          return (
            <Grid.Col span={6}>
              <PopoverComponent
                key={i}
                content={() => toUpper(bg)}
                trigger={
                  <Box
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${bg}, var(--default-group-bg-bottom))`,
                    }}
                    w={"100%"}
                    h={75}
                    bdrs={"md"}
                    className={styles.bg}
                    onClick={() => setBg(bg)}
                  ></Box>
                }
                position={"top"}
              />
            </Grid.Col>
          );
        })}
      </Grid>
      <Divider color="gray.4" />
    </>
  );
});

export default GroupSettingsBgs;
