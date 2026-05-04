import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { scanAllCollections } from '../utils/scanCollections'

export const DiagnosticPage = () => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async () => {
    try {
      setLoading(true)
      const collections = await scanAllCollections()
      setResults(collections)
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Diagnostic</h1>
        <p className="text-gray-600 mt-2">Find your products collection</p>
      </div>

      <Card>
        <div className="space-y-6">
          <p className="text-gray-700">
            Click the button below to scan your Firestore database and find all collections with data.
          </p>
          
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? 'Scanning...' : 'Scan Database'}
          </Button>
        </div>
      </Card>

      {loading && <LoadingSpinner message="Scanning all collections..." />}

      {results && results.length > 0 && (
        <Card className="bg-green-50 border border-green-200">
          <h2 className="text-xl font-bold text-green-900 mb-4">✅ Collections Found: {results.length}</h2>
          
          <div className="space-y-4">
            {results.map((col, idx) => (
              <div key={idx} className="p-4 bg-white border border-green-100 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Collection: <code className="bg-gray-100 px-2 py-1 rounded">{col.name}</code>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      📊 Contains <strong>{col.count}</strong> documents
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Field Names:</p>
                  <div className="flex flex-wrap gap-2">
                    {col.fields.map((field) => (
                      <code 
                        key={field}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100"
                      >
                        {field}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                  <p className="font-semibold text-gray-700 mb-2">Sample Document:</p>
                  <pre className="overflow-auto">{JSON.stringify(col.sampleData, null, 2)}</pre>
                </div>

                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded">
                  <p className="text-xs text-yellow-800">
                    💡 To use this collection, update your product service with:
                  </p>
                  <code className="text-xs bg-yellow-100 text-yellow-900 px-2 py-1 rounded block mt-1">
                    PRODUCTS_COLLECTION = '{col.name}'
                  </code>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {results && results.length === 0 && (
        <Card className="bg-red-50 border border-red-200">
          <h2 className="text-xl font-bold text-red-900 mb-2">❌ No Collections Found</h2>
          <p className="text-red-700">
            No collections with data were found in your Firestore database.
          </p>
          <p className="text-red-600 text-sm mt-3">
            Please check:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside mt-2 space-y-1">
            <li>Firebase credentials are correct in firebase.js</li>
            <li>Firestore database is enabled</li>
            <li>Your database actually has collections with data</li>
          </ul>
        </Card>
      )}

      <Card className="bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
        <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
          <li>Click "Scan Database" button above</li>
          <li>Check browser Console (F12) for detailed output</li>
          <li>Find the collection that contains your products</li>
          <li>Note the collection name and field names</li>
          <li>Tell me the collection name and I'll update the admin panel</li>
        </ol>
      </Card>
    </div>
  )
}

export default DiagnosticPage
