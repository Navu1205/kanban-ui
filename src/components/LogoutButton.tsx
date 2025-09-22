"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <Button variant={"destructive"} size={"sm"} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
