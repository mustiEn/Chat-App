export const handleSwitchPinnedMsgBox = (
  e,
  pinnedMsgBoxObj,
  paramId,
  switchPinnedMsgBox,
  setPinnedMsgExists,
  isPinnedMessagesFetched,
  refetch
) => {
  if (!pinnedMsgBoxObj[paramId]) e.stopPropagation();

  switchPinnedMsgBox(paramId, true);
  setPinnedMsgExists(paramId, false);

  if (!isPinnedMessagesFetched[paramId]) {
    isPinnedMessagesFetched[paramId] = true;
    refetch();
  }
};

export const closePinnedMsgBox = (
  e,
  paramId,
  customOverlayRef,
  switchPinnedMsgBox
) => {
  const isTargetOverlay = e.target.classList.contains(
    customOverlayRef.current.className
  );

  if (!isTargetOverlay) return;

  customOverlayRef.current.style.display = "none";
  switchPinnedMsgBox(paramId, false);
};
