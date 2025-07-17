import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload, X, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'healthcare-denial-management-ke7ap16s',
  authRequired: true
})

interface CreateAppealFormProps {
  denialId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface Denial {
  id: string
  claimNumber: string
  patientName: string
  insuranceCompany: string
  denialReason: string
  claimAmount: number
}

export function CreateAppealForm({ denialId, onSuccess, onCancel }: CreateAppealFormProps) {
  const [denial, setDenial] = useState<Denial | null>(null)
  const [formData, setFormData] = useState({
    appealType: '',
    appealDate: new Date(),
    deadlineDate: undefined as Date | undefined,
    appealReason: '',
    submittedBy: '',
    supportingDocuments: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [availableDenials, setAvailableDenials] = useState<Denial[]>([])
  const [selectedDenialId, setSelectedDenialId] = useState(denialId || '')

  useEffect(() => {
    loadAvailableDenials()
    if (denialId) {
      loadDenialDetails(denialId)
    }
  }, [denialId])

  const loadAvailableDenials = async () => {
    try {
      const user = await blink.auth.me()
      const denials = await blink.db.denials.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setAvailableDenials(denials)
    } catch (error) {
      console.error('Error loading denials:', error)
    }
  }

  const loadDenialDetails = async (id: string) => {
    try {
      const denials = await blink.db.denials.list({
        where: { id: id }
      })
      if (denials.length > 0) {
        setDenial(denials[0])
      }
    } catch (error) {
      console.error('Error loading denial details:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
  }

  const handleDenialSelect = (id: string) => {
    setSelectedDenialId(id)
    loadDenialDetails(id)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateAppealTemplate = () => {
    if (!denial) return

    const template = `
APPEAL LETTER TEMPLATE

Date: ${format(formData.appealDate, 'MMMM dd, yyyy')}

To: ${denial.insuranceCompany}
Re: Appeal for Claim #${denial.claimNumber}
Patient: ${denial.patientName}

Dear Claims Review Team,

I am writing to formally appeal the denial of claim #${denial.claimNumber} for patient ${denial.patientName}. 

Original Denial Reason: ${denial.denialReason}
Claim Amount: $${denial.claimAmount.toFixed(2)}

APPEAL JUSTIFICATION:
${formData.appealReason}

We respectfully request that you reconsider this claim and approve payment for the services rendered. The medical necessity and appropriateness of the treatment provided is well-documented and meets all coverage criteria.

Please find attached supporting documentation for your review.

Sincerely,
${formData.submittedBy}

---
This template can be customized based on your specific appeal requirements.
    `.trim()

    setFormData(prev => ({ ...prev, supportingDocuments: template }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = await blink.auth.me()
      
      const appealId = `appeal_${Date.now()}`
      
      const appealData = {
        id: appealId,
        denialId: selectedDenialId,
        userId: user.id,
        appealType: formData.appealType,
        appealDate: formData.appealDate.toISOString().split('T')[0],
        deadlineDate: formData.deadlineDate?.toISOString().split('T')[0] || '',
        status: 'draft',
        appealReason: formData.appealReason,
        supportingDocuments: formData.supportingDocuments,
        submittedBy: formData.submittedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.appeals.create(appealData)

      // Upload files if any
      for (const file of uploadedFiles) {
        const { publicUrl } = await blink.storage.upload(
          file,
          `appeals/${appealId}/${file.name}`,
          { upsert: true }
        )

        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await blink.db.documents.create({
          id: documentId,
          appealId: appealId,
          userId: user.id,
          fileName: file.name,
          fileUrl: publicUrl,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error creating appeal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Create New Appeal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Denial Selection */}
          {!denialId && (
            <div className="space-y-2">
              <Label htmlFor="denial">Select Denial *</Label>
              <Select value={selectedDenialId} onValueChange={handleDenialSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a denial to appeal" />
                </SelectTrigger>
                <SelectContent>
                  {availableDenials.map((denial) => (
                    <SelectItem key={denial.id} value={denial.id}>
                      {denial.claimNumber} - {denial.patientName} (${denial.claimAmount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Denial Summary */}
          {denial && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-medium text-blue-900 mb-2">Denial Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Claim Number:</span> {denial.claimNumber}
                  </div>
                  <div>
                    <span className="font-medium">Patient:</span> {denial.patientName}
                  </div>
                  <div>
                    <span className="font-medium">Insurance:</span> {denial.insuranceCompany}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> ${denial.claimAmount.toFixed(2)}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Denial Reason:</span> {denial.denialReason}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appeal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="appealType">Appeal Type *</Label>
              <Select value={formData.appealType} onValueChange={(value) => handleInputChange('appealType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appeal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-level">First Level Appeal</SelectItem>
                  <SelectItem value="second-level">Second Level Appeal</SelectItem>
                  <SelectItem value="external-review">External Review</SelectItem>
                  <SelectItem value="peer-to-peer">Peer-to-Peer Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submittedBy">Submitted By *</Label>
              <Input
                id="submittedBy"
                value={formData.submittedBy}
                onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Appeal Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.appealDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.appealDate}
                    onSelect={(date) => handleDateChange('appealDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Deadline Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadlineDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadlineDate ? format(formData.deadlineDate, "PPP") : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.deadlineDate}
                    onSelect={(date) => handleDateChange('deadlineDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Appeal Reason */}
          <div className="space-y-2">
            <Label htmlFor="appealReason">Appeal Justification *</Label>
            <Textarea
              id="appealReason"
              value={formData.appealReason}
              onChange={(e) => handleInputChange('appealReason', e.target.value)}
              placeholder="Provide detailed justification for the appeal..."
              rows={4}
              required
            />
          </div>

          {/* Template Generator */}
          {denial && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Appeal Letter Template</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAppealTemplate}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Template
                </Button>
              </div>
              <Textarea
                value={formData.supportingDocuments}
                onChange={(e) => handleInputChange('supportingDocuments', e.target.value)}
                placeholder="Appeal letter content will appear here..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload supporting documents
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      Medical records, prior authorizations, clinical notes
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Uploaded Files:</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedDenialId}>
              {isSubmitting ? 'Creating...' : 'Create Appeal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}