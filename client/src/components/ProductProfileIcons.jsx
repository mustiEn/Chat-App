import React from "react";
import Card from "react-bootstrap/Card";

const ProductProfileIcons = ({ styles }) => {
  const icons = [
    "alien.gif",
    "angel.gif",
    "smiling-face.gif",
    "uranus.gif",
    "valentines-day.gif",
    "shooting-star.gif",
    "rocket-launch.gif",
    "mars.gif",
    "galaxy.gif",
    "meteor-rain.gif",
    "core-value.gif",
    "core-values.gif",
    "star.gif",
  ];
  return (
    <>
      {icons.map((icon) => (
        <Card
          className={`rounded-3 ${styles["card-product-profile-icon"]} ${styles["card-div"]}`}
        >
          <div className={`${styles["card-img-div"]} position-relative`}>
            <img
              src={"https://placehold.co/150"}
              className="rounded-circle position-absolute translate-middle top-50 start-50"
              width={150}
              height={150}
              alt=""
            />
            <img
              src={"mona.jpg"}
              className={`${styles.profile} rounded-circle position-absolute translate-middle top-50 start-50 z-1`}
              width={150}
              height={150}
              alt=""
            />
            <img
              src={`/${icon}`}
              width={50}
              height={50}
              style={{ transform: "translate(-65px, 40px)" }}
              className={`rounded-circle position-absolute end-0 z-1`}
              alt=""
            />
          </div>
          <Card.Body className={`${styles["card-body-div"]} text-white`}>
            <Card.Title>Card Title</Card.Title>
            <Card.Text>£10.99</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default ProductProfileIcons;
