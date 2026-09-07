import React from "react";
import { Outlet } from "react-router";

const user = {
  email: "admin@gmail.com",
  role: "admin",
};

const ProtectedRoute = () => {
  if (user.role !== "admin")
    return <p>Forbiden: Bạn không có quyền vào đây!</p>;
  return <Outlet />;
};

export default ProtectedRoute;
