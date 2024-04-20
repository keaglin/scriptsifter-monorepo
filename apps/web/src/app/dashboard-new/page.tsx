/**
 * v0 by Vercel.
 * @see https://v0.dev/t/eeZ09Red92R
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/DropdownMenu";
import { Package2Icon, SearchIcon } from "@/components/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";

import Nav from "@/components/Nav";
import ItemCard from "@/components/ItemCard";
import Image from "next/image";


export default function Dashboard() {
  return (
    <div>
      <div className="grid auto-rows gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
      </div>
    </div >
  );
}
