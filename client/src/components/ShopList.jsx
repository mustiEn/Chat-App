import React, { useState } from "react";
import styles from "../css/shop_list.module.css";
import ProductBackground from "./ProductBackground";
import ProductProfileIcons from "./ProductProfileIcons";
import ProductAnimatedView from "./ProductAnimatedView";

const ShopList = () => {
  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        <ProductBackground styles={styles} />
        <ProductProfileIcons styles={styles} />
        <ProductAnimatedView styles={styles} />
      </div>
    </>
  );
};

export default ShopList;
