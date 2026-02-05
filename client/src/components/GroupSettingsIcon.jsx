import {
  Box,
  Button,
  Divider,
  FileInput,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import React, { useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "../css/crop.css";
import { useRef } from "react";
import { useEditGroupMutation } from "../mutations/useEditGroupMutation";
import { useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { useDisclosure } from "@mantine/hooks";
import toast from "react-hot-toast";

const GroupSettingsIcon = memo(function GroupSettingsIcon({
  setGroupState,
  formDataRef,
  setCroppedPreview,
}) {
  const fileInputRef = useRef();
  const [opened, { open, close }] = useDisclosure(false);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%", // Can be 'px' or '%'
    // x: 25,
    // y: 15,
    width: 50,
    height: 30,
  });
  const queryClient = useQueryClient();
  const mutation = useEditGroupMutation(queryClient);
  const imgRef = useRef(null);
  const [completedCrop, setCompletedCrop] = useState(null);

  const onImageLoad = (e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    const crop = centerCrop(
      makeAspectCrop(
        {
          // You don't need to pass a complete crop into
          // makeAspectCrop or centerCrop.
          unit: "%",
          width: 50,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    );

    setCrop(crop);
  };
  const getCroppedImage = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const size = completedCrop.width * scaleX;

    canvas.width = size;
    canvas.height = size;

    // Create circular clipping mask
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      size,
      size,
    );

    // Export
    canvas.toBlob((blob) => {
      const file = new File([blob], "group-123.png", {
        type: "image/jpeg",
      });
      const previewUrl = URL.createObjectURL(blob);

      formDataRef.current.append("icon", file);
      setCroppedPreview(previewUrl);
      setGroupState((prev) => ({
        ...prev,
        group_icon: "group-123.png",
      }));
      close();
    }, "image/jpeg");
  };
  const onFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    open();
    setPreview(imageUrl);
  };
  const resetGroupIcon = () => {
    formDataRef.current.append("icon", null);
    formDataRef.current.append("remove_icon", true);

    setGroupState((prev) => ({
      ...prev,
      group_icon: null,
    }));
    close();
  };

  return (
    <>
      <Text>Icon</Text>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <Group>
        <Button
          style={{
            flexGrow: 1,
          }}
          onClick={() => fileInputRef.current.click()}
        >
          Change Group Icon
        </Button>
        <Button
          style={{
            flexGrow: 1,
          }}
          color="red"
          variant="outline"
          onClick={resetGroupIcon}
        >
          Reset Group Icon
        </Button>
      </Group>

      <Divider color="gray.4" />
      <Modal
        opened={opened}
        onClose={close}
        title="Group Icon"
        centered
        // styles={{
        //   body: {
        //     width: 400,
        //     height: 300,
        //   },
        // }}
      >
        <Stack>
          <div className="crop-wrapper">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              locked
              aspect={1}
              circularCrop
              keepSelection
              onComplete={(PixelCrop, PercentCrop) => {
                console.log(PixelCrop, PercentCrop);
                setCompletedCrop(PixelCrop);
              }}
            >
              <img
                // width={400}
                // height={300}
                src={preview ?? "https://placehold.co/600x400"}
                ref={imgRef}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>
          <Button onClick={getCroppedImage} variant="outline">
            Save Group Icon
          </Button>
        </Stack>
      </Modal>
    </>
  );
});

export default GroupSettingsIcon;
