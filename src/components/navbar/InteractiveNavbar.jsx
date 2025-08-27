"use client";

import React from "react";
import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import Image from "next/image";

const InteractiveNavbar = () => {
  return (
    <Navbar
      className="bg-[#1A2C45] shadow-2xl border-b border-blue-700/30"
      classNames={{
        wrapper: ["max-w-7xl", "px-4", "mx-auto"],
        base: [
          "sticky",
          "top-0",
          "z-50",
          "backdrop-blur-md",
          "backdrop-saturate-150",
        ],
      }}
      height="5rem"
      isBordered={false}
      isBlurred={true}
      position="sticky"
    >
      {/* Logo Only */}
      <NavbarContent justify="center">
        <NavbarBrand>
          <Link href="/" className="flex items-center">
            <div className="relative w-[140px] h-[45px] flex-shrink-0">
              <Image
                alt="FRC Logo"
                src="/FRC_Logo_FullWhite.png"
                width={140}
                height={45}
                priority={true}
                className="object-contain w-full h-full hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>
        </NavbarBrand>
      </NavbarContent>
    </Navbar>
  );
};

export default InteractiveNavbar;
