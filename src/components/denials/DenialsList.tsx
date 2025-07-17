import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from 'date-fns'
import { createClient } from '@blinkdotnew/sdk'
import { CreateDenialForm } from './CreateDenialForm'
import { mockDataService, type Denial as MockDenial } from '@/lib/mockData'

const blink = createClient({
  projectId: 'healthcare-denial-management-ke7ap16s',
  authRequired: true
})

interface Denial {
  id: string
  claimNumber: string
  patientName: string
  patientId: string
  insuranceCompany: string
  denialDate: string
  serviceDate: string
  denialReason: string
  denialCode: string
  claimAmount: number
  status: string
  priority: string
  assignedTo: string
  notes: string
  createdAt: string
  updatedAt: string
}

export function DenialsList() {
  const [denials, setDenials] = useState<Denial[]>([])
  const [filteredDenials, setFilteredDenials] = useState<Denial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadDenials()
  }, [])

  useEffect(() => {
    filterDenials()
  }, [filterDenials])

  const loadDenials = async () => {
    try {
      const user = await blink.auth.me()
      try {
        // Try to load from database first
        const denialsData = await blink.db.denials.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        setDenials(denialsData)
      } catch (dbError) {
        console.log('Database not available, using mock data')
        // Fallback to mock data
        const mockDenials = await mockDataService.getDenials(user.id)
        setDenials(mockDenials)
      }
    } catch (error) {
      console.error('Error loading denials:', error)
      // If auth fails, use mock data with default user
      const mockDenials = await mockDataService.getDenials('user_123')
      setDenials(mockDenials)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDenials = useCallback(() => {
    let filtered = denials

    if (searchTerm) {
      filtered = filtered.filter(denial =>
        denial.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        denial.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        denial.insuranceCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        denial.denialReason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(denial => denial.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(denial => denial.priority === priorityFilter)
    }

    setFilteredDenials(filtered)
  }, [denials, searchTerm, statusFilter, priorityFilter])

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

  const getTotalAmount = () => {
    return filteredDenials.reduce((sum, denial) => sum + denial.claimAmount, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading denials...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Denials Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage insurance claim denials
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Denial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Denial</DialogTitle>
            </DialogHeader>
            <CreateDenialForm
              onSuccess={() => {
                setShowCreateForm(false)
                loadDenials()
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Denials</p>
                <p className="text-2xl font-bold text-gray-900">{denials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {denials.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {denials.filter(d => d.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${getTotalAmount().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter denials by status, priority, or search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient, claim number, or insurance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="appealing">Appealing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Denials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Denials ({filteredDenials.length})</CardTitle>
          <CardDescription>
            Showing {filteredDenials.length} of {denials.length} denials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Days Open</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDenials.map((denial) => (
                  <TableRow key={denial.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{denial.patientName}</div>
                        <div className="text-sm text-gray-500">{denial.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{denial.claimNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">{denial.insuranceCompany}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="truncate">{denial.denialReason}</div>
                        <div className="text-xs text-gray-500">{denial.denialCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${denial.claimAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(denial.status)}>
                        {denial.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(denial.priority)}>
                        {denial.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{getDaysOpen(denial.denialDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Denial
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Appeal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDenials.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No denials found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {denials.length === 0 
                  ? "Get started by creating your first denial record."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {denials.length === 0 && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Denial
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}