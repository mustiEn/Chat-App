import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import styles from "../css/shop_list.module.css";
import ProductProfileSkeleton from "./ProductProfileSkeleton";
import ProductBackground from "./ProductBackground";
import ProductProfileIcons from "./ProductProfileIcons";

const ShopList = () => {
  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        <ProductBackground styles={styles} />
        <ProductProfileIcons styles={styles} />
      </div>
    </>
  );
};

export default ShopList;
