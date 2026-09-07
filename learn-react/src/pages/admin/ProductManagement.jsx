import React, { useEffect, useState } from "react";
import api from "../../api";
import { createProduct, getProducts } from "../../api/productApi";
import { useProducts } from "../../hooks/useProducts";

const ProductManagement = () => {
  // const [products, setProducts] = useState([]);

  // useEffect(() => {
  //   (async () => {
  //     const data = await getProducts();
  //     setProducts(data);
  //   })();
  // }, []);

  const { loading, error, data } = useProducts();

  console.log(data);
  const handleSubmit = async () => {
    event.preventDefault();
    const formData = new FormData(formProduct);
    const data = Object.fromEntries(formData);
    console.log(data);
    const res = await createProduct(data);
    console.log(res);
  };

  // * http://localhost:5173/admin/products?title=sdadsad&price=3232323

  return (
    <div>
      <h2>Product Management</h2>
      <form id="formProduct" onSubmit={() => handleSubmit()}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input type="text" name="title" />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input type="number" name="price" />
        </div>

        <button>Submit</button>
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item._id}</td>
              <td>{item.title}</td>
              <td>{item.price}</td>
              <td>
                <button>Update</button> <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
