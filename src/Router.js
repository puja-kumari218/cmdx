import { Route, Routes } from "react-router-dom";
import React from "react";
import routes from "./routes";
import Dashboard from "./containers/Dashboard";
import Swap from "./containers/Swap";

console.log(routes.path);

const Router = () => {
  return (
    <div className="content scroll_bar">
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            exact
            element={route.element}
            path={route.path}
          />
        ))}
        {/* <Route exact element={<Dashboard />} path="*" /> */}
        <Route exact element={<Swap />} path="*" />
      </Routes>


    </div>
  );
};

export default Router;
