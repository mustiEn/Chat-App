import React from "react";
import ProductBackgroundSkeleton from "./ProductBackgroundSkeleton";
import Card from "react-bootstrap/Card";

const ProductBackground = ({ styles }) => {
  const bgs = [
    "kaneki.gif",
    "kaneki-2.gif",
    "michael-kaiser.gif",
    "blue-lock.gif",
  ];
  return (
    <>
      {bgs.map((bg, i) => (
        <Card
          className={`rounded-3 ${styles["card-product-bg"]} ${styles["card-div"]}`}
          key={i}
        >
          <div className={`${styles["card-bg-inner"]} position-relative`}>
            <div className={`w-100 h-100 position-relative top-0`}>
              <ProductBackgroundSkeleton />
            </div>

            <div
              className={`${styles["product-bg"]} position-absolute z-0 top-0 w-100 h-100`}
              style={{
                backgroundImage: `url(/${bg})`,
              }}
            ></div>
          </div>
          <Card.Body
            className={`${styles["card-body-div"]} text-white position-relative z-1`}
          >
            <Card.Title>Card Title</Card.Title>
            <Card.Text>£10.99</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default ProductBackground;
