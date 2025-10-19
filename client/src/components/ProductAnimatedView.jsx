import React from "react";
import ProductAnimatedViewSkeleton from "./ProductAnimatedViewSkeleton";
import Card from "react-bootstrap/Card";

const animatedViews = [
  "atomic.gif",
  "circles.gif",
  "data-grid.gif",
  "fire.gif",
  "green-galaxy.gif",
  "matrix.gif",
  "network.gif",
  "organic-lines.gif",
  "particles.gif",
  "silky-blue.gif",
];

const ProductAnimatedView = ({ styles }) => {
  return (
    <>
      {animatedViews.map((view, i) => (
        <Card
          className={`rounded-3 ${styles["card-div"]} ${styles["card-animated-view"]}`}
          key={i}
        >
          <div
            className={`${styles["card-animated-view-inner"]} position-relative`}
          >
            <div className={` w-100 h-100 position-relative top-0`}>
              <ProductAnimatedViewSkeleton
                styles={styles}
                animatedViewName={view}
              />
            </div>
          </div>
          <Card.Body className={`text-white ${styles["card-body-div"]}`}>
            <Card.Title>Card Title</Card.Title>
            <Card.Text>£10.99</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default ProductAnimatedView;
