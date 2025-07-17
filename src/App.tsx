import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { DenialsList } from "@/components/denials/DenialsList"
import { Analytics } from "@/components/analytics/Analytics"
import { AppealsList } from "@/components/appeals/AppealsList"
import { blink } from "@/lib/blink"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, LogOut } from "lucide-react"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'denials':
        return <DenialsList />
      case 'analytics':
        return <Analytics />
      case 'appeals':
        return <AppealsList />
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-96">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar view for tracking deadlines and appointments.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case 'team':
        return (
          <div className="flex items-center justify-center h-96">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage team members and assignments.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case 'search':
        return (
          <div className="flex items-center justify-center h-96">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced search and filtering capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Application settings and preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Healthcare Denial Management...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Healthcare Denial Management</CardTitle>
            <CardDescription>
              Please sign in to access your denial management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => blink.auth.login()} className="w-full">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar 
          activeItem={activeView} 
          onItemClick={setActiveView} 
        />
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            {/* Top Header */}
            <header className="flex items-center justify-between p-4 border-b bg-card">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Healthcare Denial Management System
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6">
              {renderContent()}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App