import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { getLaboratories, updateLaboratory, deleteLaboratory } from '../services/laboratoryService';
import { createLaboratoryPartner } from '../services/partnerService';

export default function ManageLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    serviceAreas: '',
    registrationNumber: '',
    nablNumber: '',
    gstNumber: '',
    isActive: true,
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const data = await getLaboratories();
      setLabs(data);
    } catch (error) {
      toast.error('Failed to fetch laboratories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const serviceAreasArray = formData.serviceAreas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

      const labDocData = {
        name: formData.name,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        serviceAreas: serviceAreasArray,
        registrationNumber: formData.registrationNumber,
        nablNumber: formData.nablNumber || null,
        gstNumber: formData.gstNumber || null,
        isActive: formData.isActive,
      };

      const authData = {
        email: formData.email,
        password: formData.password
      };

      await createLaboratoryPartner(labDocData, authData);
      toast.success('Laboratory Partner created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchLabs();
    } catch (error) {
      toast.error(error.message || 'Failed to create partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ownerName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      serviceAreas: '',
      registrationNumber: '',
      nablNumber: '',
      gstNumber: '',
      isActive: true,
    });
  };

  const toggleStatus = async (lab) => {
    try {
      await updateLaboratory(lab.id, { isActive: !lab.isActive });
      toast.success(`Laboratory ${lab.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchLabs();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (labId) => {
    if (!window.confirm('Are you sure you want to delete this laboratory? This cannot be undone.')) return;
    try {
      await deleteLaboratory(labId);
      toast.success('Laboratory deleted successfully');
      fetchLabs();
    } catch (error) {
      toast.error('Failed to delete laboratory');
    }
  };

  if (loading) return <LoadingSpinner message="Loading laboratories..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratories</h1>
          <p className="text-gray-600 mt-2">Manage partner diagnostic laboratories and their coverage areas</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} variant="primary" size="lg">
          <Plus size={20} className="mr-2" />
          Add Laboratory
        </Button>
      </div>

      {/* Table */}
      <Card>
        {labs.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No laboratories yet"
            description="Add your first laboratory partner to get started"
            action={<Button onClick={() => setIsModalOpen(true)}>Add Laboratory</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-gray-700">Lab Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Owner</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Service Areas</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labs.map((lab) => (
                  <tr key={lab.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{lab.name}</p>
                      <p className="text-xs text-gray-500">Reg: {lab.registrationNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lab.ownerName}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{lab.phone}</p>
                      <p className="text-xs text-gray-500">{lab.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {lab.serviceAreas?.join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                        lab.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {lab.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(lab)}
                        className={`p-2 rounded-lg transition-colors ${lab.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={lab.isActive ? "Disable Lab" : "Enable Lab"}
                      >
                        {lab.isActive ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(lab.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Lab"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Laboratory Partner"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab Information */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Laboratory Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login ID) *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Address & Service */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Address & Service Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lab Pincode *</label>
                  <input type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas (Comma separated pincodes) *</label>
                  <input type="text" name="serviceAreas" required placeholder="e.g. 302001, 302002" value={formData.serviceAreas} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lab Registration Number *</label>
                  <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NABL Number (Optional)</label>
                  <input type="text" name="nablNumber" value={formData.nablNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active Account</label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Partner'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
