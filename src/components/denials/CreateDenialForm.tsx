import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'healthcare-denial-management-ke7ap16s',
  authRequired: true
})

interface CreateDenialFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateDenialForm({ onSuccess, onCancel }: CreateDenialFormProps) {
  const [formData, setFormData] = useState({
    claimNumber: '',
    patientName: '',
    patientId: '',
    insuranceCompany: '',
    denialDate: undefined as Date | undefined,
    serviceDate: undefined as Date | undefined,
    denialReason: '',
    denialCode: '',
    claimAmount: '',
    priority: 'medium',
    assignedTo: '',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = await blink.auth.me()
      
      // Create denial record
      const denialId = `denial_${Date.now()}`
      
      const denialData = {
        id: denialId,
        userId: user.id,
        claimNumber: formData.claimNumber,
        patientName: formData.patientName,
        patientId: formData.patientId,
        insuranceCompany: formData.insuranceCompany,
        denialDate: formData.denialDate?.toISOString().split('T')[0] || '',
        serviceDate: formData.serviceDate?.toISOString().split('T')[0] || '',
        denialReason: formData.denialReason,
        denialCode: formData.denialCode,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        status: 'pending',
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.denials.create(denialData)

      // Upload files if any
      for (const file of uploadedFiles) {
        const { publicUrl } = await blink.storage.upload(
          file,
          `denials/${denialId}/${file.name}`,
          { upsert: true }
        )

        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await blink.db.documents.create({
          id: documentId,
          denialId: denialId,
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
      console.error('Error creating denial:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Create New Denial</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="claimNumber">Claim Number *</Label>
              <Input
                id="claimNumber"
                value={formData.claimNumber}
                onChange={(e) => handleInputChange('claimNumber', e.target.value)}
                placeholder="Enter claim number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                placeholder="Enter patient ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceCompany">Insurance Company *</Label>
              <Input
                id="insuranceCompany"
                value={formData.insuranceCompany}
                onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                placeholder="Enter insurance company"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Denial Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.denialDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.denialDate ? format(formData.denialDate, "PPP") : "Select denial date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.denialDate}
                    onSelect={(date) => handleDateChange('denialDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Service Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.serviceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.serviceDate ? format(formData.serviceDate, "PPP") : "Select service date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.serviceDate}
                    onSelect={(date) => handleDateChange('serviceDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Denial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="denialCode">Denial Code</Label>
              <Input
                id="denialCode"
                value={formData.denialCode}
                onChange={(e) => handleInputChange('denialCode', e.target.value)}
                placeholder="Enter denial code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="claimAmount">Claim Amount *</Label>
              <Input
                id="claimAmount"
                type="number"
                step="0.01"
                value={formData.claimAmount}
                onChange={(e) => handleInputChange('claimAmount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="denialReason">Denial Reason *</Label>
            <Textarea
              id="denialReason"
              value={formData.denialReason}
              onChange={(e) => handleInputChange('denialReason', e.target.value)}
              placeholder="Enter denial reason"
              rows={3}
              required
            />
          </div>

          {/* Priority and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload files or drag and drop
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Denial'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}