import React from "react";
import {
  RiArrowDownSLine,
  RiLogoutCircleRLine
} from "react-icons/ri";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");

  window.location.href = "/login"; // redirige
};

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-[7vh] md:h-[10vh] border-b border-secondary-100 p-8 flex items-center justify-end">
      <nav className="flex items-center gap-2">
        <Menu
          menuButton={
            <MenuButton className="flex items-center gap-x-2 hover:bg-secondary-100 p-2 rounded-lg transition-colors">
              <span>{user?.numero_empleado || "Cargando..."}</span>
              <RiArrowDownSLine />
            </MenuButton>
          }
          align="end"
          arrow
          arrowClassName="bg-secondary-100"
          transition
          menuClassName="bg-secondary-100 p-4"
        >
          <MenuItem className="p-0 hover:bg-transparent">
            <Link
              className="rounded-lg transition-colors text-gray-300 hover:bg-secondary-900 flex items-center gap-x-4 py-2 px-6 flex-1"
            >
              <div className="flex flex-col text-sm">
                <span className="text-sm">{user?.numero_empleado || "Cargando..."}</span>
             </div>
            </Link>
          </MenuItem>
          <hr className="my-4 border-gray-500" />
          
          <MenuItem className="p-0 hover:bg-transparent">
            <Link
              onClick={logout}
              className="rounded-lg transition-colors text-gray-300 hover:bg-secondary-900 flex items-center gap-x-4 py-2 px-6 flex-1"
            >
              <RiLogoutCircleRLine /> Salir
            </Link>
          </MenuItem>
        </Menu>
      </nav>
    </header>
  );
};

export default Header;
