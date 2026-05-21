"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, BookOpen, Menu } from "lucide-react"
import Link from "next/link"
import { routes } from "@/shared/constants/routes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">IELTS 8.0 Master</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {/* hover thì có hiệu ứng to lên, và nhảy lên và có gạch thẳng là class ảo (không phải underline) ở dưới  */}
            <Link href={routes.dashboard} className="hover:text-primary hover:scale-105 hover:translate-y-[-2px] mr-2">Dashboard</Link>
            <Link href={routes.games} className="hover:text-primary hover:scale-105 hover:translate-y-[-2px] mr-2">Games</Link>
            <Link href={routes.profile} className="hover:text-primary hover:scale-105 hover:translate-y-[-2px] mr-2">Profile</Link>
            <Link href={routes.adminUsers} className="hover:text-primary hover:scale-105 hover:translate-y-[-2px] mr-2">Admin Users</Link>
            <Link href={routes.adminVocabulary} className="hover:text-primary hover:scale-105 hover:translate-y-[-2px] mr-2">Admin Vocabulary</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation menu">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 md:hidden">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href={routes.dashboard}>Dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={routes.games}>Games</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={routes.profile}>Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={routes.adminUsers}>Admin Users</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={routes.adminVocabulary}>Admin Vocabulary</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  U
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={routes.profile}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}
               variant="destructive"
               className="">
                <LogOut className="mr-2 h-4 w-4 text-destructive focus:text-primary" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

