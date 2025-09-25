"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploadArea({ onFileUpload, disabled = false }: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type - Updated to match Document AI supported formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/tiff',
      'image/webp',
      'image/bmp'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload PDF or image files (JPEG, PNG, GIF, TIFF, WebP, BMP). Word documents are not currently supported.');
      return;
    }

    // Validate file size (20MB limit to match backend)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(`File size (${fileSizeMB}MB) exceeds the maximum limit of 20MB. Please use a smaller file.`);
      return;
    }

    if (file.size === 0) {
      alert('File appears to be empty. Please upload a valid document.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {selectedFile ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
          <Button
            onClick={handleUpload}
            disabled={disabled}
            className="w-full text-xs sm:text-sm"
          >
            Upload & Process
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.tiff,.webp,.bmp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center">
            <div className="mb-3 sm:mb-4">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
              Upload a document
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Supports PDF and image files (JPEG, PNG, GIF, TIFF, WebP, BMP) up to 20MB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

