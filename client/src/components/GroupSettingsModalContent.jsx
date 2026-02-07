import React, { useMemo, useRef, useState } from "react";
import GroupSettingsName from "./GroupSettingsName";
import GroupSettingsIcon from "./GroupSettingsIcon";
import GroupSettingsBgs from "./GroupSettingsBgs";
import GroupSettingsDescription from "./GroupSettingsDescription";
import GroupSettingsGroupDisplay from "./GroupSettingsGroupDisplay";
import { useParams } from "react-router-dom";
import { useGroupMembers } from "../custom-hooks/useGroupMembers";
import GroupSettingsModalUpdateBtn from "./GroupSettingsModalUpdateBtn";
import { useEffect } from "react";
import styles from "../css/group_settings_modal_content.module.css";

const GroupSettingsModalContent = ({ group }) => {
  const { groupId } = useParams();
  const [groupState, setGroupState] = useState({
    ...group,
  });
  const formDataRef = useRef(new FormData());
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const { data } = useGroupMembers(groupId);
  const membersCount = useMemo(
    () => data?.members.length ?? 0,
    [data?.members],
  );

  const close = () => setShowUpdateBtn(false);
  const resetGroupState = () => {
    setGroupState({
      ...group,
    });
    setCroppedPreview(null);
  };

  useEffect(() => {
    const isNameTheSame = group.group_name === groupState.group_name;
    const isBgTheSame = group.background_color === groupState.background_color;
    const isDescTheSame = group.description === groupState.description;
    const isIconTheSame = group.group_icon === groupState.group_icon;

    if (isNameTheSame && isBgTheSame && isDescTheSame && isIconTheSame) {
      setShowUpdateBtn(false);
    } else {
      setShowUpdateBtn(true);
    }
  }, [groupState]);

  return (
    <>
      <div className={styles["group-settings-layout"]}>
        <div className={`${styles["group-settings-panel"]} custom-scrollbar`}>
          <h1 className={styles["group-settings-title"]}>Group Profile</h1>

          <p className={styles["group-settings-subtitle"]}>
            Customise how your group looks in invite links and if public, in
            Group Discovery
          </p>

          <div className={styles["group-settings-stack"]}>
            <GroupSettingsName
              groupName={groupState.group_name}
              setGroupState={setGroupState}
            />
            <GroupSettingsIcon
              setGroupState={setGroupState}
              formDataRef={formDataRef}
              setCroppedPreview={setCroppedPreview}
            />
            <GroupSettingsBgs setGroupState={setGroupState} />
            <GroupSettingsDescription
              groupDesc={groupState.description}
              setGroupState={setGroupState}
            />
          </div>
        </div>

        <div className={styles["group-settings-preview"]}>
          <GroupSettingsGroupDisplay
            groupState={groupState}
            membersCount={membersCount}
            croppedPreview={croppedPreview}
          />
        </div>
      </div>
      <GroupSettingsModalUpdateBtn
        opened={showUpdateBtn}
        close={close}
        groupState={groupState}
        resetGroupState={resetGroupState}
        formDataRef={formDataRef}
      />
    </>
  );
};

export default GroupSettingsModalContent;
