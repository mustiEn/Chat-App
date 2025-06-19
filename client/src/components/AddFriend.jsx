import React from "react";
import Form from "react-bootstrap/Form";
import FriendsPanelTop from "./FriendsPanelTop";
import Button from "react-bootstrap/esm/Button";

const AddFriend = () => {
  return (
    <>
      {/* <FriendsPanelTop /> */}

      <div className="d-flex w-100">
        <div>
          <div className="fs-4">Add Friend</div>
          <p>You can add friends with their Discord usernames.</p>
          <Form className="border-bottom border-white border-opacity-25 px-2">
            <Form.Control
              type="text"
              placeholder="Enter your friend's usenrame."
            />
            <Button variant="dark">Send Friend Request</Button>
          </Form>
        </div>
        <div>
          <div className="fs-4">Other Places to Make Friends</div>
          <p>
            Don't have a username ? Cheak out our list of groups you can join
          </p>
        </div>
        <Button variant="dark">Explore Groups</Button>
      </div>
    </>
  );
};

export default AddFriend;
