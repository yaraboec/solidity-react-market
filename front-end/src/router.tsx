import { Route, Routes } from "react-router-dom";

import Home from "components/home/home";
import Inventory from "components/inventory/inventory";
import { ROUTES } from "utils/constants";

export default function Router() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.INVENTORY} element={<Inventory />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
