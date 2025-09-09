// components/fileUpload/DragDropFileUpload.tsx
"use client"
import React, { useCallback, useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react'
import Button from '@/components/ui/button/Button'
import { useTranslation } from '@/hooks/useTranslation'

interface DragDropFileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

const DragDropFileUpload: React.FC<DragDropFileUploadProps> = ({
  files,
  onFilesChange,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  maxSize = 10,
  className = "",
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t} = useTranslation();
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`)
      return false
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })

    if (!isAccepted) {
      setError(`File type "${file.type}" is not accepted.`)
      return false
    }

    setError(null)
    return true
  }

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).filter(validateFile)
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles])
    }
  }, [files, onFilesChange, maxSize, accept])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [disabled, processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFilesChange(updatedFiles)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    } else if (file.type.includes('document') || file.type.includes('word')) {
      return <FileText className="w-6 h-6 text-blue-600" />
    }
    return <File className="w-6 h-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          bg-gray-50 dark:bg-gray-800
        `}
        onClick={!disabled ? handleButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-gray-600 dark:text-gray-300">
            <p className="text-sm font-medium">
              {isDragOver ? t("case.dnd_text_des_over") : t("case.dnd_text_des")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("case.supports")} {t("case.images")}, PDF, DOC, DOCX, TXT ({t("case.max")} {maxSize}MB {t("case.each")} )
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("case.display.attach_file")} ({files.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <FilePreviewCard
                key={`${file.name}-${index}`}
                file={file}
                index={index}
                onRemove={removeFile}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FilePreviewCardProps {
  file: File
  index: number
  onRemove: (index: number) => void
  getFileIcon: (file: File) => React.ReactNode
  formatFileSize: (bytes: number) => string
  disabled?: boolean
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  file,
  index,
  onRemove,
  getFileIcon,
  formatFileSize,
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(null)
  const { t} = useTranslation();
  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const handleDownload = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      {/* Remove Button - Only show if not disabled */}
      {!disabled && (
        <Button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 z-10 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
          size="sm"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* File Content */}
      <div className="p-3">
        {preview ? (
          /* Image Preview */
          <div className="mb-2">
            <img
              src={preview}
              alt={file.name}
              className="w-full h-24 object-cover rounded cursor-pointer"
              onClick={handleDownload}
            />
          </div>
        ) : (
          /* Document Icon */
          <div className="flex items-center justify-center h-24 bg-gray-50 dark:bg-gray-700 rounded mb-2 cursor-pointer"
               onClick={handleDownload}>
            {getFileIcon(file)}
          </div>
        )}

        {/* File Info */}
        <div className="space-y-1">
          <p
            className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            title={file.name}
            onClick={handleDownload}
          >
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(file.size)}
          </p>
          {file.type && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          )}
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="w-full mt-2 text-xs py-1 h-7"
        >
          {t("case.download")}
        </Button>
      </div>
    </div>
  )
}

export default DragDropFileUpload