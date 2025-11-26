import { Group, Radio, Stack, Text, Title } from "@mantine/core";
import styles from "../css/settings_modal_language.module.css";
import { useState } from "react";

const langs = {
  en: "English",
  tr: "Turkish",
  sp: "Spanish",
  jpn: "Japanese",
  fr: "French",
};

const SettingsModalLanguage = () => {
  return (
    <>
      <Title order={4}>Select a language</Title>
      <Radio.Group>
        <Stack mt={"md"}>
          {Object.entries(langs).map(([key, val]) => (
            <Radio.Card
              className={styles.lang}
              radius="md"
              value={key}
              key={key}
              name="lang"
              p={"xs"}
            >
              <Group>
                <Radio.Indicator size="md" color="red" variant="outline" />
                <Text>{val}</Text>
              </Group>
            </Radio.Card>
          ))}
        </Stack>
      </Radio.Group>
    </>
  );
};

export default SettingsModalLanguage;
