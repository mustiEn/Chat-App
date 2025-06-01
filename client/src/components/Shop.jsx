import React from "react";
import ShopList from "./ShopList";

const Shop = () => {
  return (
    <>
      <div className="d-flex flex-column px-2">
        <h1 className="my-5">Shop</h1>
        <ShopList />
      </div>
    </>
  );
};

export default Shop;
