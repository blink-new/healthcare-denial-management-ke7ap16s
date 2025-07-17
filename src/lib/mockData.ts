// Mock data service for Healthcare Denial Management System
// This provides realistic sample data when database is not available

export interface Denial {
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
  status: 'pending' | 'appealing' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  notes: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Appeal {
  id: string
  denialId: string
  appealType: string
  appealDate: string
  deadlineDate: string
  status: string
  appealReason: string
  submittedBy: string
  createdAt: string
  userId: string
}

// Mock denials data
export const mockDenials: Denial[] = [
  {
    id: 'denial_001',
    claimNumber: 'CLM-2024-001',
    patientName: 'Sarah Johnson',
    patientId: 'PAT-001',
    insuranceCompany: 'Blue Cross Blue Shield',
    denialDate: '2024-01-15',
    serviceDate: '2024-01-10',
    denialReason: 'Prior Authorization Required - The submitted procedure requires prior authorization which was not obtained before service.',
    denialCode: 'PA001',
    claimAmount: 2450.00,
    status: 'pending',
    priority: 'high',
    assignedTo: 'Dr. Smith',
    notes: 'Patient requires urgent follow-up. Prior auth was submitted but not approved in time.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    userId: 'user_123'
  },
  {
    id: 'denial_002',
    claimNumber: 'CLM-2024-002',
    patientName: 'Michael Chen',
    patientId: 'PAT-002',
    insuranceCompany: 'Aetna Healthcare',
    denialDate: '2024-01-14',
    serviceDate: '2024-01-08',
    denialReason: 'Medical Necessity Documentation - Additional documentation required to establish medical necessity.',
    denialCode: 'MN002',
    claimAmount: 1890.00,
    status: 'appealing',
    priority: 'medium',
    assignedTo: 'Dr. Johnson',
    notes: 'Appeal submitted with additional clinical notes and test results.',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    userId: 'user_123'
  },
  {
    id: 'denial_003',
    claimNumber: 'CLM-2024-003',
    patientName: 'Emily Davis',
    patientId: 'PAT-003',
    insuranceCompany: 'Cigna Health',
    denialDate: '2024-01-13',
    serviceDate: '2024-01-05',
    denialReason: 'Duplicate Claim Submission - This claim appears to be a duplicate of a previously processed claim.',
    denialCode: 'DUP001',
    claimAmount: 3200.00,
    status: 'resolved',
    priority: 'low',
    assignedTo: 'Dr. Wilson',
    notes: 'Resolved - Found original claim was processed under different member ID.',
    createdAt: '2024-01-13T11:45:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    userId: 'user_123'
  },
  {
    id: 'denial_004',
    claimNumber: 'CLM-2024-004',
    patientName: 'Robert Wilson',
    patientId: 'PAT-004',
    insuranceCompany: 'UnitedHealthcare',
    denialDate: '2024-01-12',
    serviceDate: '2024-01-03',
    denialReason: 'Experimental Treatment - The procedure is considered experimental and not covered under current policy.',
    denialCode: 'EXP001',
    claimAmount: 4750.00,
    status: 'pending',
    priority: 'urgent',
    assignedTo: 'Dr. Brown',
    notes: 'Researching recent FDA approvals and clinical trial data for appeal.',
    createdAt: '2024-01-12T08:15:00Z',
    updatedAt: '2024-01-12T08:15:00Z',
    userId: 'user_123'
  },
  {
    id: 'denial_005',
    claimNumber: 'CLM-2024-005',
    patientName: 'Lisa Anderson',
    patientId: 'PAT-005',
    insuranceCompany: 'Humana',
    denialDate: '2024-01-11',
    serviceDate: '2024-01-02',
    denialReason: 'Incorrect Procedure Code - The submitted procedure code does not match the documented service.',
    denialCode: 'IPC001',
    claimAmount: 1250.00,
    status: 'appealing',
    priority: 'medium',
    assignedTo: 'Dr. Davis',
    notes: 'Corrected procedure code submitted with appeal documentation.',
    createdAt: '2024-01-11T13:20:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
    userId: 'user_123'
  },
  {
    id: 'denial_006',
    claimNumber: 'CLM-2024-006',
    patientName: 'James Rodriguez',
    patientId: 'PAT-006',
    insuranceCompany: 'Kaiser Permanente',
    denialDate: '2024-01-10',
    serviceDate: '2023-12-28',
    denialReason: 'Timely Filing Limit Exceeded - Claim was submitted after the timely filing deadline.',
    denialCode: 'TFL001',
    claimAmount: 890.00,
    status: 'rejected',
    priority: 'low',
    assignedTo: 'Dr. Martinez',
    notes: 'Unable to appeal due to timely filing limits. Process improvement needed.',
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
    userId: 'user_123'
  }
]

// Mock appeals data
export const mockAppeals: Appeal[] = [
  {
    id: 'appeal_001',
    denialId: 'denial_002',
    appealType: 'first-level',
    appealDate: '2024-01-16',
    deadlineDate: '2024-01-30',
    status: 'submitted',
    appealReason: 'Submitting additional clinical documentation to support medical necessity including lab results, imaging studies, and physician notes.',
    submittedBy: 'Dr. Johnson',
    createdAt: '2024-01-16T09:15:00Z',
    userId: 'user_123'
  },
  {
    id: 'appeal_002',
    denialId: 'denial_005',
    appealType: 'first-level',
    appealDate: '2024-01-15',
    deadlineDate: '2024-01-29',
    status: 'under-review',
    appealReason: 'Correcting procedure code from 99213 to 99214 based on documentation review and time spent with patient.',
    submittedBy: 'Dr. Davis',
    createdAt: '2024-01-15T10:45:00Z',
    userId: 'user_123'
  }
]

// Mock data service
export class MockDataService {
  private static instance: MockDataService
  private denials: Denial[] = [...mockDenials]
  private appeals: Appeal[] = [...mockAppeals]

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  // Denial methods
  async getDenials(userId: string): Promise<Denial[]> {
    return this.denials.filter(denial => denial.userId === userId)
  }

  async createDenial(denial: Omit<Denial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Denial> {
    const newDenial: Denial = {
      ...denial,
      id: `denial_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.denials.push(newDenial)
    return newDenial
  }

  async updateDenial(id: string, updates: Partial<Denial>): Promise<Denial | null> {
    const index = this.denials.findIndex(denial => denial.id === id)
    if (index === -1) return null
    
    this.denials[index] = {
      ...this.denials[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.denials[index]
  }

  async deleteDenial(id: string): Promise<boolean> {
    const index = this.denials.findIndex(denial => denial.id === id)
    if (index === -1) return false
    
    this.denials.splice(index, 1)
    return true
  }

  // Appeal methods
  async getAppeals(userId: string): Promise<Appeal[]> {
    return this.appeals.filter(appeal => appeal.userId === userId)
  }

  async createAppeal(appeal: Omit<Appeal, 'id' | 'createdAt'>): Promise<Appeal> {
    const newAppeal: Appeal = {
      ...appeal,
      id: `appeal_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    this.appeals.push(newAppeal)
    return newAppeal
  }

  async updateAppeal(id: string, updates: Partial<Appeal>): Promise<Appeal | null> {
    const index = this.appeals.findIndex(appeal => appeal.id === id)
    if (index === -1) return null
    
    this.appeals[index] = {
      ...this.appeals[index],
      ...updates
    }
    return this.appeals[index]
  }

  async deleteAppeal(id: string): Promise<boolean> {
    const index = this.appeals.findIndex(appeal => appeal.id === id)
    if (index === -1) return false
    
    this.appeals.splice(index, 1)
    return true
  }

  // Analytics methods
  getStats(userId: string) {
    const userDenials = this.denials.filter(denial => denial.userId === userId)
    const userAppeals = this.appeals.filter(appeal => appeal.userId === userId)
    
    return {
      totalDenials: userDenials.length,
      pendingDenials: userDenials.filter(d => d.status === 'pending').length,
      appealingDenials: userDenials.filter(d => d.status === 'appealing').length,
      resolvedDenials: userDenials.filter(d => d.status === 'resolved').length,
      totalAppeals: userAppeals.length,
      totalAmount: userDenials.reduce((sum, denial) => sum + denial.claimAmount, 0)
    }
  }
}

export const mockDataService = MockDataService.getInstance()