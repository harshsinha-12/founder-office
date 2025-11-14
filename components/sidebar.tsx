"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Calendar, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Meetings", href: "/meetings", icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Founder Copilot</h2>
        <p className="text-sm text-muted-foreground">Your startup command center</p>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => {
            // Handle logout
            window.location.href = "/api/auth/signout"
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
