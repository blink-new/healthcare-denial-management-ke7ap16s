import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Plus,
  Filter,
  Calendar,
  ArrowRight
} from "lucide-react"
import { mockDataService, type Denial } from '@/lib/mockData'
import { blink } from '@/lib/blink'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalDenials: 0,
    pendingDenials: 0,
    appealingDenials: 0,
    resolvedDenials: 0,
    totalAppeals: 0,
    totalAmount: 0
  })
  const [recentDenials, setRecentDenials] = useState<Denial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      let userId = 'user_123' // Default fallback
      
      try {
        const user = await blink.auth.me()
        userId = user.id
      } catch (authError) {
        console.log('Auth not available, using default user')
      }

      // Load stats and recent denials
      const dashboardStats = mockDataService.getStats(userId)
      const denials = await mockDataService.getDenials(userId)
      
      setStats(dashboardStats)
      setRecentDenials(denials.slice(0, 5)) // Show only 5 most recent
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'appealing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysOpen = (denialDate: string) => {
    const denial = new Date(denialDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - denial.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return formatCurrency(amount)
  }

  const statsCards = [
    {
      title: "Total Denials",
      value: stats.totalDenials.toString(),
      change: "+12%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Active Appeals",
      value: stats.totalAppeals.toString(),
      change: "+5%",
      trend: "up", 
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Resolved Cases",
      value: stats.resolvedDenials.toString(),
      change: "+23%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Recovery Amount",
      value: formatAmount(stats.totalAmount),
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your denial management activities
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Denial
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Denials */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Denials</CardTitle>
            <CardDescription>
              Latest denial cases requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDenials.map((denial) => (
                <div key={denial.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{denial.patientName}</span>
                      <Badge variant="outline" className="text-xs">
                        {denial.claimNumber}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(denial.priority)}`}>
                        {denial.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {denial.insuranceCompany} • {denial.denialReason.substring(0, 50)}...
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(denial.denialDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getDaysOpen(denial.denialDate)} days open</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatCurrency(denial.claimAmount)}</div>
                    <Badge className={`text-xs ${getStatusColor(denial.status)} mb-2`}>
                      {denial.status}
                    </Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recentDenials.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent denials found
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Denials
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Denial
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create Appeal
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Review Deadlines
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appeal Success Rate</CardTitle>
              <CardDescription>This month's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Success Rate</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Time</span>
                    <span className="font-medium">2.3 days</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Appeals requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded border-l-4 border-red-400">
                  <div>
                    <div className="text-sm font-medium">Appeal #A001</div>
                    <div className="text-xs text-muted-foreground">Sarah Johnson</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-red-600 font-medium">Due Today</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div>
                    <div className="text-sm font-medium">Appeal #A002</div>
                    <div className="text-xs text-muted-foreground">Michael Chen</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-orange-600 font-medium">Due Tomorrow</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <div>
                    <div className="text-sm font-medium">Appeal #A003</div>
                    <div className="text-xs text-muted-foreground">Robert Wilson</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-yellow-600 font-medium">Due in 3 days</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                View All Deadlines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}