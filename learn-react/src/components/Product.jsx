import React from "react";

const Product = ({ product }) => {
  return (
    <div>
      <h2>{product.title}</h2>
      <p>Price: {product.price}</p>
      <button>Mua hang</button>
    </div>
  );
};

export default Product;
