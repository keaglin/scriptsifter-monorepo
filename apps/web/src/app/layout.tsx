
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import NavBar from '@/components/NavBar'
// import AuthButton from '@/components/AuthButton'
import Nav from '@/components/Nav'
import { Package2Icon, SearchIcon } from '@/components/Icons'
// import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
// import Image from 'next/image'
import UserDropdown from '@/components/UserDropdown'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scriptsifter',
  description: 'Sift your scripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  console.log('headersList', headersList)
  const pathname = headersList.get('x-url-path') || ''
  console.log('pathname', pathname)
  return (
    <html lang="en">
      <body className={`grid-container ${inter.className}`}>

        <Nav />
        <header className="top-bar flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px] dark:bg-gray-800/40">
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
            {/* TODO: Move Search to its own component */}
            <form>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="w-full appearance-none bg-white pl-8 shadow-none md:w-2/3 lg:w-1/3 dark:bg-gray-950"
                  placeholder="Search media..."
                  type="search"
                />
              </div>
            </form>
          </div>
          <UserDropdown />
        </header>


        <main className="card-list-container">
          {children}
        </main>
        <footer className='main'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </footer>
      </body>
    </html>
  )
}
