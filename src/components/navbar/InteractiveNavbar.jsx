"use client";

import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import Image from "next/image";

const InteractiveNavbar = () => {
  return (
    <Navbar className="bg-[#1A2C45]">
      {/* Brand */}
      <NavbarBrand>
        <Link href="/" className="flex items-center">
          <Image
            alt="Fundamental Research Corp. Logo"
            src="/FRC_Logo_FullWhite.png"
            width={100}
            height={32}
            priority={true}
            className="object-contain"
          />
        </Link>
      </NavbarBrand>

      {/* Navigation Links */}
      <NavbarContent className="hidden sm:flex" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/" className="text-white">
            Home
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Profile Dropdown */}
      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="User"
              size="sm"
              src="https://i.pravatar.cc/150?u=user"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">user@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="analytics">Analytics</DropdownItem>
            <DropdownItem key="help">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default InteractiveNavbar;
