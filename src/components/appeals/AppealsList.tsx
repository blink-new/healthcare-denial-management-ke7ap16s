import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Filter, Eye, Edit, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@blinkdotnew/sdk'
import { CreateAppealForm } from './CreateAppealForm'
import { mockDataService, type Appeal as MockAppeal, type Denial as MockDenial } from '@/lib/mockData'

const blink = createClient({
  projectId: 'healthcare-denial-management-ke7ap16s',
  authRequired: true
})

interface Appeal {
  id: string
  denialId: string
  appealType: string
  appealDate: string
  deadlineDate: string
  status: string
  appealReason: string
  submittedBy: string
  createdAt: string
}

interface Denial {
  id: string
  claimNumber: string
  patientName: string
  insuranceCompany: string
}

export function AppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [denials, setDenials] = useState<Record<string, Denial>>({})
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadAppeals()
  }, [])

  useEffect(() => {
    filterAppeals()
  }, [filterAppeals])

  const loadAppeals = async () => {
    try {
      const user = await blink.auth.me()
      
      try {
        // Try to load from database first
        const appealsData = await blink.db.appeals.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        setAppeals(appealsData)

        // Load related denials
        const denialIds = [...new Set(appealsData.map(appeal => appeal.denialId))]
        const denialsData = await blink.db.denials.list({
          where: { 
            AND: [
              { userId: user.id },
              { id: { in: denialIds } }
            ]
          }
        })

        const denialsMap = denialsData.reduce((acc, denial) => {
          acc[denial.id] = denial
          return acc
        }, {} as Record<string, Denial>)
        setDenials(denialsMap)
      } catch (dbError) {
        console.log('Database not available, using mock data')
        // Fallback to mock data
        const mockAppeals = await mockDataService.getAppeals(user.id)
        const mockDenials = await mockDataService.getDenials(user.id)
        
        setAppeals(mockAppeals)
        const denialsMap = mockDenials.reduce((acc, denial) => {
          acc[denial.id] = denial
          return acc
        }, {} as Record<string, Denial>)
        setDenials(denialsMap)
      }

    } catch (error) {
      console.error('Error loading appeals:', error)
      // If auth fails, use mock data with default user
      const mockAppeals = await mockDataService.getAppeals('user_123')
      const mockDenials = await mockDataService.getDenials('user_123')
      
      setAppeals(mockAppeals)
      const denialsMap = mockDenials.reduce((acc, denial) => {
        acc[denial.id] = denial
        return acc
      }, {} as Record<string, Denial>)
      setDenials(denialsMap)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppeals = useCallback(() => {
    let filtered = appeals

    if (searchTerm) {
      filtered = filtered.filter(appeal => {
        const denial = denials[appeal.denialId]
        return (
          appeal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appeal.appealReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          denial?.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          denial?.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appeal => appeal.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(appeal => appeal.appealType === typeFilter)
    }

    setFilteredAppeals(filtered)
  }, [appeals, searchTerm, statusFilter, typeFilter, denials])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      submitted: { label: 'Submitted', variant: 'default' as const },
      'under-review': { label: 'Under Review', variant: 'default' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      denied: { label: 'Denied', variant: 'destructive' as const },
      'pending-response': { label: 'Pending Response', variant: 'default' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'first-level': { label: 'First Level', color: 'bg-blue-100 text-blue-800' },
      'second-level': { label: 'Second Level', color: 'bg-orange-100 text-orange-800' },
      'external-review': { label: 'External Review', color: 'bg-purple-100 text-purple-800' },
      'peer-to-peer': { label: 'Peer-to-Peer', color: 'bg-green-100 text-green-800' }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const isOverdue = (deadlineDate: string) => {
    if (!deadlineDate) return false
    return new Date(deadlineDate) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading appeals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appeals Management</h1>
          <p className="text-gray-600 mt-1">Track and manage insurance claim appeals</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appeal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Appeal</DialogTitle>
            </DialogHeader>
            <CreateAppealForm
              onSuccess={() => {
                setShowCreateForm(false)
                loadAppeals()
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
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appeals</p>
                <p className="text-2xl font-bold text-gray-900">{appeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appeals.filter(a => ['submitted', 'under-review', 'pending-response'].includes(a.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appeals.filter(a => a.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appeals.filter(a => isOverdue(a.deadlineDate)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search appeals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="pending-response">Pending Response</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="first-level">First Level</SelectItem>
                  <SelectItem value="second-level">Second Level</SelectItem>
                  <SelectItem value="external-review">External Review</SelectItem>
                  <SelectItem value="peer-to-peer">Peer-to-Peer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appeals ({filteredAppeals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Info</TableHead>
                  <TableHead>Appeal Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Appeal Date</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppeals.map((appeal) => {
                  const denial = denials[appeal.denialId]
                  const overdue = isOverdue(appeal.deadlineDate)
                  
                  return (
                    <TableRow key={appeal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{denial?.claimNumber || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{denial?.patientName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{denial?.insuranceCompany || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(appeal.appealType)}</TableCell>
                      <TableCell>{getStatusBadge(appeal.status)}</TableCell>
                      <TableCell>
                        {appeal.appealDate ? format(new Date(appeal.appealDate), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className={overdue ? 'text-red-600 font-medium' : ''}>
                          {appeal.deadlineDate ? format(new Date(appeal.deadlineDate), 'MMM dd, yyyy') : 'N/A'}
                          {overdue && <div className="text-xs">OVERDUE</div>}
                        </div>
                      </TableCell>
                      <TableCell>{appeal.submittedBy}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAppeals.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appeals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {appeals.length === 0 
                  ? "Get started by creating your first appeal."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {appeals.length === 0 && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Appeal
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