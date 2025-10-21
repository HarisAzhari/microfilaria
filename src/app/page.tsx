'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Detection {
  id: number
  class: string
  confidence: number
  bbox: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

interface DetectionResponse {
  success: boolean
  timestamp: string
  image_info: {
    width: number
    height: number
    filename: string
  }
  detection_stats: {
    total_count: number
    average_confidence: number
    confidence_threshold: number
  }
  detections: Detection[]
  annotated_image: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DetectionResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [confidence, setConfidence] = useState(0.25)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResults(null)
      setError('')
    }
  }

  const handleDetect = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('confidence', confidence.toString())

    try {
      const response = await fetch('http://localhost:1000/api/detect', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || 'Detection failed')
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure Flask server is running on port 5000')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🔬 Microfiliaria Detection System
          </h1>
          <p className="text-xl text-gray-600">
            YOLOv8m - Automated Blood Smear Analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload & Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Upload Image
            </h2>

            {/* File Input */}
            <div className="mb-6">
              <label className="block w-full">
                <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 transition cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to select image'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Supports: JPG, PNG, JPEG
                  </p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Preview
                </h3>
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Confidence Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold: {confidence.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1 (Low)</span>
                <span>0.9 (High)</span>
              </div>
            </div>

            {/* Detect Button */}
            <button
              onClick={handleDetect}
              disabled={!selectedFile || loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Detecting...
                </span>
              ) : (
                '🔍 Run Detection'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Detection Results
            </h2>

            {!results && (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg">No results yet</p>
                  <p className="text-sm mt-2">Upload an image and run detection</p>
                </div>
              </div>
            )}

            {results && (
              <div>
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-gray-600">Total Detections</p>
                    <p className="text-3xl font-bold text-green-600">
                      {results.detection_stats.total_count}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {(results.detection_stats.average_confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Annotated Image */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Annotated Image
                  </h3>
                  <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={results.annotated_image}
                      alt="Detection Result"
                      className="w-full object-contain"
                    />
                  </div>
                </div>

                {/* Detection List */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Detection Details ({results.detections.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {results.detections.map((detection) => (
                      <div
                        key={detection.id}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">
                            #{detection.id} - {detection.class}
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                            {(detection.confidence * 100).toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Box: [{detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)}, {detection.bbox.x2.toFixed(0)}, {detection.bbox.y2.toFixed(0)}]
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Powered by YOLOv8m | Flask Backend | Next.js Frontend
          </p>
        </div>
      </div>
    </main>
  )
}