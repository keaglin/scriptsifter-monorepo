'use client'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/Button";
import Image from "next/image";

export default function UserDropdown() {
  return (


    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-800"
          size="icon"
          variant="ghost"
        >
          <Image
            alt="Avatar"
            className="rounded-full"
            height="32"
            src="/placeholder.jpg"
            style={{
              aspectRatio: "32/32",
              objectFit: "cover",
            }}
            width="32"
          />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
