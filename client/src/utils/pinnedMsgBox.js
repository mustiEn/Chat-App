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
  pinnedMsgBoxObj,
  paramId,
  customOverlayRef,
  isTargetOverlay,
  switchPinnedMsgBox
) => {
  if (pinnedMsgBoxObj[paramId])
    customOverlayRef.current.style.display = "block";

  const isTargetOverlay = e.target.classList.contains(
    customOverlayRef.current.className
  );

  if (!isTargetOverlay) return;

  customOverlayRef.current.style.display = "none";
  switchPinnedMsgBox(paramId, false);
};
