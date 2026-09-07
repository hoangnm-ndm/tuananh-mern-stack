/**
 * Input: params search, find, filter, pagination
 * Output: thông tin trang hiện tại và kết quả sau query.
 */

import { useEffect, useState } from "react";
import { createProduct, getProducts } from "../api/productApi";

export const useProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setData(data);
    } catch (error) {
      setError(`Co loi xay ra: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (body) => {
    const data = await createProduct(body);
    console.log(data);
    fetchProducts();
  };

  // const updateProduct = async (body) => {
  //   const data = await updateProduct(body);
  //   fetchProducts();
  // };

  return { data, loading, error };
};
