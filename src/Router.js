import { Route, Routes } from "react-router-dom";
import React from "react";
import routes from "./routes";
import Dashboard from "./containers/Dashboard";
import Swap from "./containers/Swap";
// import Farm from "./containers/Farm";

console.log(routes.path);

const Router = () => {
  return (
    <div className="content scroll_bar">
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            exact
            path={route.path}
            element={route.element}
          
          />
        ))}
        {/* <Route exact element={<Dashboard />} path="*" /> */}
        <Route exact element={<Swap />} path="*" />
        {/* <Route exact element={<Farm />} path="/farm" /> */}
      </Routes>


    </div>
  );
};

export default Router;
