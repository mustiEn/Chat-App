import React from "react";
import UserStatus from "./UserStatus";
import { concatName } from "../utils";
import { useAuthUserStore } from "../stores/useAuthUserStore";
import styles from "../css/group_member_item.module.css";
import GroupMemberCard from "./GroupMemberCard";
import { useState } from "react";

const GroupMemberItem = ({ member, setIsMemberCardOpen, isMemberCardOpen }) => {
  const authUser = useAuthUserStore((s) => s.authUser);
  const [refEl, setRefEl] = React.useState(null);

  return (
    <>
      {/* <div
        key={member.id}
        color={"dark"}
        w={"100%"}
        h={"100%"}
        justify="flex-start"
        style={{
          position: "relative",
        }}
      >
        <div
          w={"100%"}
          h={"100%"}
          style={{
            // backgroundImage: "url(/atomic.gif)",
            zIndex: 0,
            position: "absolute",
            top: 0,
            left: 0,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "100% 30%",
            maskImage:
              "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
          }}
        ></div>
        <Flex
          align={"center"}
          gap={"xs"}
          style={{
            position: "absolute",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 32,
              height: 32,
            }}
          >
            <Image
              src={member.profile ?? "https://placehold.co/32"}
              radius={"xl"}
              alt=""
            />
            {member.status && (
              <UserStatus
                status={
                  authUser.id == member.id ? authUser.status : member.status
                }
                w={12}
                h={12}
                absolute={true}
              />
            )}
          </div>
          <Text>{concatName(member.display_name)}</Text>
        </Flex>
      </div> */}
      <div
        className={styles.member}
        key={member.id}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          justifyContent: "flex-start",
          color: "dark",
        }}
        onClick={() => setIsMemberCardOpen(member.id)}
        ref={setRefEl}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // backgroundImage: "url(/atomic.gif)",
            zIndex: 0,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "100% 30%",
            maskImage:
              "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "var(--mantine-spacing-xs)", // Mantine value placeholder
          }}
        >
          <div
            style={{
              position: "relative",
              width: 32,
              height: 32,
            }}
          >
            <img
              src={member.profile ?? "https://placehold.co/32"}
              alt=""
              style={{
                borderRadius: "50%",
              }}
            />
            {member?.status && (
              <UserStatus
                status={
                  authUser.id == member.id ? authUser.status : member.status
                }
                w={12}
                h={12}
                absolute={true}
              />
            )}
          </div>
          <span>{concatName(member.display_name)}</span>
        </div>
        {isMemberCardOpen == member.id && (
          <GroupMemberCard
            member={member}
            referenceEl={refEl}
            opened={isMemberCardOpen == member.id}
          />
        )}
      </div>
    </>
  );
};

export default GroupMemberItem;
