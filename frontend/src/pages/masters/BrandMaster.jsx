import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandMaster = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    brand_code: '',
    brand_name: '',
    brand_category: 'PREMIUM',
    country_of_origin: '',
    target_market: 'DOMESTIC',
    website: '',
    contact_person: '',
    email: '',
    phone: '',
    license_number: '',
    quality_standard: '',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getBrands();
      setBrands(response.data || []);
    } catch (error) {
      toast.error('Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brand_code.trim() || !formData.brand_name.trim()) {
      toast.error('Brand code and name are required');
      return;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      toast.success(editMode ? 'Brand updated successfully' : 'Brand created successfully');
      setDialogOpen(false);
      fetchBrands();
      resetForm();
    } catch (error) {
      toast.error('Failed to save brand');
    }
  };

  const resetForm = () => {
    setFormData({
      brand_code: '',
      brand_name: '',
      brand_category: 'PREMIUM',
      country_of_origin: '',
      target_market: 'DOMESTIC',
      website: '',
      contact_person: '',
      email: '',
      phone: '',
      license_number: '',
      quality_standard: '',
      remarks: '',
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="space-y-6" data-testid="brand-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Brand Master</h1>
          <p className="text-neutral-600 mt-1">Manage garment brands and licensing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-brand-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Create'} Brand</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_code">Brand Code *</Label>
                  <Input id="brand_code" value={formData.brand_code} onChange={(e) => setFormData({ ...formData, brand_code: e.target.value })} placeholder="e.g., BRN-001" required data-testid="brand-code-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name *</Label>
                  <Input id="brand_name" value={formData.brand_name} onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })} placeholder="e.g., Zara" required data-testid="brand-name-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_category">Brand Category</Label>
                  <Select value={formData.brand_category} onValueChange={(value) => setFormData({ ...formData, brand_category: value })}>
                    <SelectTrigger data-testid="brand-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LUXURY">Luxury</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="MID_RANGE">Mid Range</SelectItem>
                      <SelectItem value="ECONOMY">Economy</SelectItem>
                      <SelectItem value="BUDGET">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_market">Target Market</Label>
                  <Select value={formData.target_market} onValueChange={(value) => setFormData({ ...formData, target_market: value })}>
                    <SelectTrigger data-testid="target-market-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      <SelectItem value="INTERNATIONAL">International</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_of_origin">Country of Origin</Label>
                  <Input id="country_of_origin" value={formData.country_of_origin} onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })} placeholder="e.g., Spain" data-testid="country-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" data-testid="website-input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="John Doe" data-testid="contact-person-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@brand.com" data-testid="email-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1234567890" data-testid="phone-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input id="license_number" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} placeholder="e.g., LIC-123456" data-testid="license-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality_standard">Quality Standard</Label>
                  <Input id="quality_standard" value={formData.quality_standard} onChange={(e) => setFormData({ ...formData, quality_standard: e.target.value })} placeholder="e.g., ISO 9001" data-testid="quality-standard-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows={3} data-testid="remarks-input" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" data-testid="submit-brand-btn">{editMode ? 'Update' : 'Create'} Brand</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search brands..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="search-brand-input" />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold">Market</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-neutral-500">No brands found. Click "Create Brand" to add one.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BrandMaster;