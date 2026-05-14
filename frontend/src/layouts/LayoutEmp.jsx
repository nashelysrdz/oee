import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/HeaderEmp";

const LayoutAdmin = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="h-[90vh] overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutAdmin;
