import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";

import { GroupChatPanelContext } from "../contexts/GroupChatPanelContext.jsx";
import { useModalStore } from "../stores/useModalStore.js";
import { useGroupPinnedMessages } from "../custom-hooks/useGroupPinnedMessages.js";
import PinnedMsgsBoxBase from "./PinnedMsgsBoxBase.jsx";

const GroupChatPinnedMsgsBoxWrapper = ({ customOverlayRef, ref }) => {
  const { activeMsg } = useContext(GroupChatPanelContext);
  const { groupId } = useParams();
  const { data: pinnedMsgs } = useGroupPinnedMessages(groupId);
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore(
    (s) => s.pinnedMsgBoxObj.group
  );

  return (
    <>
      {pinnedMsgBoxObj[groupId] && (
        <PinnedMsgsBoxBase
          pinnedMsgs={pinnedMsgs}
          ref={ref}
          customOverlayRef={customOverlayRef}
          activeMsg={activeMsg}
        />
      )}
    </>
  );
};

export default GroupChatPinnedMsgsBoxWrapper;
