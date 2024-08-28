import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Switch,
} from "@nextui-org/react";
import { AcmeLogo } from "./Acme.jsx";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext.jsx";
import { SunIcon } from "../assets/SunIcon.jsx";
import { MoonIcon } from "../assets/MoonIcon.jsx";

export default function TopBar({
  isDarkMode,
  setIsDarkMode
}) {
  const [active, setActive] = useState(2);
  const navigate = useNavigate();
  const auth = getAuth();
  const currUser = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleNavigation = (path) => {
    console.log(currUser);

    navigate(path);
  };

  return (
    <>
      <Navbar isBordered maxWidth="full" isMenuOpen={isMenuOpen}>
        {currUser.user ? (
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex sm:hidden"
          />
        ) : null}

        <NavbarContent>
          <NavbarBrand>
            <p className="font-bold text-inherit">21st Kitchenware</p>
          </NavbarBrand>
        </NavbarContent>

        {currUser.user ? (
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={active == 1} onClick={() => setActive(1)}>
              <Link
                color={active == 1 ? "secondary" : "foreground"}
                className="cursor-pointer"
              >
                <div
                  onClick={() => {
                    setActive(1);
                    handleNavigation("/products");
                  }}
                >
                  Products
                </div>
              </Link>
            </NavbarItem>
            <NavbarItem isActive={active == 2} onClick={() => setActive(2)}>
              <Link
                color={active == 2 ? "secondary" : "foreground"}
                className="cursor-pointer"
              >
                <div
                  onClick={() => {
                    setActive(2);
                    handleNavigation("/dashboard");
                  }}
                >
                  Dashboard
                </div>
              </Link>
            </NavbarItem>
            <NavbarItem isActive={active == 3} onClick={() => setActive(3)}>
              <Link
                color={active == 3 ? "secondary" : "foreground"}
                className="cursor-pointer"
              >
                <div
                  onClick={() => {
                    setActive(3);
                    handleNavigation("/dealers");
                  }}
                >
                  Dealers
                </div>
              </Link>
            </NavbarItem>

            <NavbarItem isActive={active == 3} onClick={() => setActive(4)}>
              <Link
                color={active == 4 ? "secondary" : "foreground"}
                className="cursor-pointer"
              >
                <div
                  onClick={() => {
                    setActive(4);
                    handleNavigation("/companies");
                  }}
                >
                  Company
                </div>
              </Link>
            </NavbarItem>
          </NavbarContent>
        ) : null}

        {currUser.user ? (
          <NavbarContent as="div" justify="end">
            <Switch
              defaultSelected
              size="lg"
              color="secondary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <SunIcon className={className} />
                ) : (
                  
                  <MoonIcon className={className} />
                )
              }
              onValueChange={() => setIsDarkMode(!isDarkMode)}
            >
              <span className="hidden sm:flex">Dark mode</span>
            </Switch>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  name="Admin"
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">admin@email.com</p>
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        ) : null}

        {currUser.user ? (
          <NavbarMenu isOpen={isMenuOpen}>
            <NavbarMenuItem>
              <Link
                color={active === 2 ? "secondary" : "foreground"}
                className="cursor-pointer"
                onClick={() => {
                  setActive(2);
                  handleNavigation("/dashboard");
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                color={active === 1 ? "secondary" : "foreground"}
                className="cursor-pointer"
                onClick={() => {
                  setActive(1);
                  handleNavigation("/products");
                  setIsMenuOpen(false);
                }}
              >
                Products
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                color={active === 3 ? "secondary" : "foreground"}
                className="cursor-pointer"
                onClick={() => {
                  setActive(3);
                  handleNavigation("/dealers");
                  setIsMenuOpen(false);
                }}
              >
                Dealers
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                color={active === 4 ? "secondary" : "foreground"}
                className="cursor-pointer"
                onClick={() => {
                  setActive(4);
                  handleNavigation("/companies");
                  setIsMenuOpen(false);
                }}
              >
                Company
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        ) : null}
      </Navbar>
    </>
  );
}
