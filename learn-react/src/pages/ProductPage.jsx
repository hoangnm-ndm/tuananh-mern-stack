import React from "react";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router";

const ProductPage = () => {
  const { data, loading, error } = useProducts();
  if (loading) return <p>Dang tai...</p>;
  if (error) return <p>{error}</p>;
  // DRY = Don't Repeat Yourselt
  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          {/* <Link to={`/products/${item.id}`}> */}
          <Link to={`${item.id}`}>
            <h2>{item.title}</h2>
          </Link>
          <img src={item.thumbnail} alt={item.title} />
        </div>
      ))}
    </div>
  );
};

export default ProductPage;
