import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchDatabaseSchema, fetchCollection } from '../utils/fetchSchema'
import { detectDatabaseStructure } from '../utils/autoDetect'

export const SchemaInspector = () => {
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [collectionData, setCollectionData] = useState(null)

  const handleAutoDetect = async () => {
    try {
      setLoading(true)
      const result = await detectDatabaseStructure()
      setSchema(result.structure)
      console.log('Auto-detected structure:', result)
    } catch (error) {
      console.error('Error:', error)
      alert('Error detecting database structure. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchSchema = async () => {
    try {
      setLoading(true)
      const result = await fetchDatabaseSchema()
      setSchema(result)
      console.log('Schema fetched:', result)
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching schema. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchCollection = async (collectionName) => {
    try {
      setLoading(true)
      setSelectedCollection(collectionName)
      const data = await fetchCollection(collectionName, 5)
      setCollectionData(data)
    } catch (error) {
      console.error('Error:', error)
      alert(`Error fetching collection: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Inspector</h1>
        <p className="text-gray-600 mt-2">View your Firestore database schema and structure</p>
      </div>

      {/* Quick Scan Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Auto-Detect Structure</h3>
              <p className="text-gray-600 text-sm mt-1">Scan all collections automatically</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAutoDetect}
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Auto-Detect'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Scan Database</h3>
              <p className="text-gray-600 text-sm mt-1">Standard schema scan</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFetchSchema}
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Schema Results */}
      {loading && <LoadingSpinner message="Scanning database..." />}

      {schema && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Collections Found</h2>
          
          {Object.keys(schema).length === 0 ? (
            <p className="text-gray-600">No collections found. Open DevTools Console (F12) to see scan results.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(schema).map(([collectionName, info]) => (
                <div
                  key={collectionName}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{collectionName}</h3>
                      {info.isEmpty ? (
                        <p className="text-sm text-gray-500 mt-1">Empty collection</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mt-1">
                            Fields: {info.fields.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            📊 Contains data
                          </p>
                        </>
                      )}
                    </div>
                    {!info.isEmpty && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleFetchCollection(collectionName)}
                      >
                        View Data
                      </Button>
                    )}
                  </div>

                  {!info.isEmpty && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Fields in this collection:</p>
                      <div className="flex flex-wrap gap-2">
                        {info.fields.map((field) => (
                          <span
                            key={field}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Collection Data Viewer */}
      {collectionData && selectedCollection && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {selectedCollection} - Sample Documents ({collectionData.length})
          </h2>

          <div className="space-y-4">
            {collectionData.map((doc, index) => (
              <div key={doc.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">Document #{index + 1}</p>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-800 max-w-xs truncate">
                    {doc.id}
                  </code>
                </div>

                <pre className="text-xs overflow-auto bg-white p-3 rounded border border-gray-200 text-gray-800 max-h-96">
                  {JSON.stringify(doc.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900">📋 How to Use</h3>
        <ol className="text-sm text-blue-800 mt-3 space-y-2 list-decimal list-inside">
          <li>Click "Auto-Detect" to scan your database</li>
          <li>View all collections and their fields</li>
          <li>Click "View Data" to see sample documents</li>
          <li>Open DevTools Console (F12) to see detailed logs</li>
          <li>Share collection names with developer to update dashboard</li>
        </ol>
      </Card>
    </div>
  )
}

export default SchemaInspector
