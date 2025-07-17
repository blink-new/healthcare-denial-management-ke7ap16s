import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Calendar
} from "lucide-react"

export function Analytics() {
  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', denials: 45, appeals: 32, resolved: 28, amount: 125000 },
    { month: 'Feb', denials: 52, appeals: 38, resolved: 35, amount: 145000 },
    { month: 'Mar', denials: 48, appeals: 41, resolved: 39, amount: 165000 },
    { month: 'Apr', denials: 61, appeals: 45, resolved: 42, amount: 185000 },
    { month: 'May', denials: 55, appeals: 48, resolved: 45, amount: 195000 },
    { month: 'Jun', denials: 67, appeals: 52, resolved: 48, amount: 215000 }
  ]

  const denialReasons = [
    { name: 'Prior Authorization', value: 35, color: '#0066CC' },
    { name: 'Medical Necessity', value: 28, color: '#FF6B35' },
    { name: 'Incorrect Coding', value: 18, color: '#10B981' },
    { name: 'Duplicate Claims', value: 12, color: '#F59E0B' },
    { name: 'Other', value: 7, color: '#8B5CF6' }
  ]

  const insuranceData = [
    { name: 'Blue Cross', denials: 45, success: 73 },
    { name: 'Aetna', denials: 38, success: 68 },
    { name: 'Cigna', denials: 32, success: 75 },
    { name: 'UnitedHealth', denials: 28, success: 71 },
    { name: 'Humana', denials: 22, success: 69 }
  ]

  const performanceMetrics = [
    {
      title: "Average Resolution Time",
      value: "4.2 days",
      change: "-12%",
      trend: "down",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Appeal Success Rate",
      value: "73%",
      change: "+5%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Total Recovery",
      value: "$1.2M",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Cases",
      value: "89",
      change: "+3%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-yellow-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for denial management
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                )}
                {metric.change} from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Denial and appeal trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="denials" 
                  stackId="1"
                  stroke="#FF6B35" 
                  fill="#FF6B35" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="appeals" 
                  stackId="1"
                  stroke="#0066CC" 
                  fill="#0066CC" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Denial Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Top Denial Reasons</CardTitle>
            <CardDescription>
              Distribution of denial reasons this quarter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={denialReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {denialReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {denialReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: reason.color }}
                    />
                    <span className="text-sm">{reason.name}</span>
                  </div>
                  <span className="text-sm font-medium">{reason.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurance Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Performance</CardTitle>
            <CardDescription>
              Appeal success rates by insurance company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insuranceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="success" fill="#0066CC" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {insuranceData.map((insurance, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{insurance.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{insurance.denials} denials</span>
                    <Badge variant="outline" className="text-xs">
                      {insurance.success}% success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Amount Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Amount Trend</CardTitle>
          <CardDescription>
            Monthly recovery amounts from successful appeals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Recovery Amount']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#0066CC" 
                strokeWidth={3}
                dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}