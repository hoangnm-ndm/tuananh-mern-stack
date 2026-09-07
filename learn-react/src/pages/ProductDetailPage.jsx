import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import api from "../api";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get(`products/${id}`);
      console.log(data);
      setProduct(data);
    })();
    //IIFE
  });
  return (
    <div>
      <div>Chi tiet san pham</div>
      {product ? (
        <div>
          <img src={product.thumbnail} alt={product.title} />
          <h1>{product.title}</h1>
          <button>Mua ngay</button>
        </div>
      ) : (
        <p>San pham khong con ton tai hoac da ngung kinh doanh!</p>
      )}
    </div>
  );
};

export default ProductDetailPage;
