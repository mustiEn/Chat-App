import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { useDmPinnedMessages } from "../custom-hooks/useDmPinnedMessages.js";
import { useModalStore } from "../stores/useModalStore.js";
import PinnedMsgsBoxBase from "./PinnedMsgsBoxBase.jsx";

const DmPinnedMsgsBoxWrapper = ({ customOverlayRef, ref }) => {
  const { activeMsg } = useContext(DmPanelContext);
  const { chatId } = useParams();
  const { data: pinnedMsgs } = useDmPinnedMessages(chatId);
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore((s) => s.pinnedMsgBoxObj.dm);

  return (
    <>
      {pinnedMsgBoxObj[chatId] && (
        <PinnedMsgsBoxBase
          customOverlayRef={customOverlayRef}
          activeMsg={activeMsg}
          pinnedMsgs={pinnedMsgs}
          ref={ref}
        />
      )}
    </>
  );
};

export default DmPinnedMsgsBoxWrapper;
