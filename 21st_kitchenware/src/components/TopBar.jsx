import React, { useState } from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
import {AcmeLogo} from "./Acme.jsx";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopBar() {

    const [active,setActive] = useState(2);
    const navigate = useNavigate();
    const auth = getAuth();
    const currUser = useAuth();

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
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">21st Kitchenware</p>
      </NavbarBrand>

      {currUser.user ? <NavbarContent className="sm:flex gap-4" justify="center">
        <NavbarItem isActive={active == 1} onClick={() => setActive(1)} >
          <Link color= {(active == 1) ? "secondary" : "foreground"} className="cursor-pointer">
            <div onClick={() => {
                setActive(1);
                handleNavigation('/products')
            }}>Products</div>
          </Link>
        </NavbarItem>
        <NavbarItem isActive={active == 2} onClick={() => setActive(2)}>
          <Link color={(active == 2) ? "secondary" : "foreground"} className="cursor-pointer">
            <div onClick={() => {
                setActive(2);
                handleNavigation('/dashboard');
            }}>Dashboard</div>
          </Link>
        </NavbarItem>
        <NavbarItem isActive={active == 3} onClick={() => setActive(3)}>
          <Link color={(active == 3) ? "secondary" : "foreground"} className="cursor-pointer">
            <div onClick={() => {
                setActive(3);
                handleNavigation('/customers');
            }}>Customers</div>
          </Link>
        </NavbarItem>

        <NavbarItem isActive={active == 3} onClick={() => setActive(4)}>
          <Link color={(active == 4) ? "secondary" : "foreground"} className="cursor-pointer">
            <div onClick={() => {
                setActive(4);
                handleNavigation('/companies');
            }}>Company</div>
          </Link>
        </NavbarItem>
      </NavbarContent> : null}

      {
        currUser.user ? <NavbarContent as="div" justify="end">
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
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent> : null
      }
    </Navbar>
  );
}
