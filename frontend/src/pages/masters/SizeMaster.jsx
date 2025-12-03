import React, { useEffect, useState } from 'react';
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

const SizeMaster = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    size_code: '',
    size_name: '',
    category: 'APPAREL',
    age_group: 'ADULT',
    gender: 'UNISEX',
    size_order: '',
    measurements: {
      chest: '',
      waist: '',
      hip: '',
      shoulder: '',
      length: '',
      sleeve: ''
    },
    international_equivalent: '',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getSizes();
      setSizes(response.data || []);
    } catch (error) {
      toast.error('Failed to load sizes');
      setSizes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.size_code.trim() || !formData.size_name.trim()) {
      toast.error('Size code and name are required');
      return;
    }

    try {
      toast.success(editMode ? 'Size updated successfully' : 'Size created successfully');
      setDialogOpen(false);
      fetchSizes();
      resetForm();
    } catch (error) {
      toast.error('Failed to save size');
    }
  };

  const resetForm = () => {
    setFormData({
      size_code: '',
      size_name: '',
      category: 'APPAREL',
      age_group: 'ADULT',
      gender: 'UNISEX',
      size_order: '',
      measurements: { chest: '', waist: '', hip: '', shoulder: '', length: '', sleeve: '' },
      international_equivalent: '',
      remarks: '',
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="space-y-6" data-testid="size-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Size Master</h1>
          <p className="text-neutral-600 mt-1">Manage garment sizes and measurements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-size-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Size
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Create'} Size</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_code">Size Code *</Label>
                  <Input id="size_code" value={formData.size_code} onChange={(e) => setFormData({ ...formData, size_code: e.target.value })} placeholder="e.g., SZ-M" required data-testid="size-code-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_name">Size Name *</Label>
                  <Input id="size_name" value={formData.size_name} onChange={(e) => setFormData({ ...formData, size_name: e.target.value })} placeholder="e.g., Medium" required data-testid="size-name-input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPAREL">Apparel</SelectItem>
                      <SelectItem value="FOOTWEAR">Footwear</SelectItem>
                      <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_group">Age Group</Label>
                  <Select value={formData.age_group} onValueChange={(value) => setFormData({ ...formData, age_group: value })}>
                    <SelectTrigger data-testid="age-group-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFANT">Infant</SelectItem>
                      <SelectItem value="TODDLER">Toddler</SelectItem>
                      <SelectItem value="KIDS">Kids</SelectItem>
                      <SelectItem value="TEEN">Teen</SelectItem>
                      <SelectItem value="ADULT">Adult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger data-testid="gender-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Measurements (in inches)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chest" className="text-sm">Chest</Label>
                    <Input id="chest" type="number" step="0.5" value={formData.measurements.chest} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, chest: e.target.value } })} placeholder="38" data-testid="chest-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist" className="text-sm">Waist</Label>
                    <Input id="waist" type="number" step="0.5" value={formData.measurements.waist} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, waist: e.target.value } })} placeholder="32" data-testid="waist-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hip" className="text-sm">Hip</Label>
                    <Input id="hip" type="number" step="0.5" value={formData.measurements.hip} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, hip: e.target.value } })} placeholder="40" data-testid="hip-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shoulder" className="text-sm">Shoulder</Label>
                    <Input id="shoulder" type="number" step="0.5" value={formData.measurements.shoulder} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, shoulder: e.target.value } })} placeholder="16" data-testid="shoulder-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length" className="text-sm">Length</Label>
                    <Input id="length" type="number" step="0.5" value={formData.measurements.length} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, length: e.target.value } })} placeholder="28" data-testid="length-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleeve" className="text-sm">Sleeve</Label>
                    <Input id="sleeve" type="number" step="0.5" value={formData.measurements.sleeve} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, sleeve: e.target.value } })} placeholder="24" data-testid="sleeve-input" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="international_equivalent">International Equivalent</Label>
                  <Input id="international_equivalent" value={formData.international_equivalent} onChange={(e) => setFormData({ ...formData, international_equivalent: e.target.value })} placeholder="e.g., US: M, EU: 50" data-testid="intl-equiv-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_order">Display Order</Label>
                  <Input id="size_order" type="number" value={formData.size_order} onChange={(e) => setFormData({ ...formData, size_order: e.target.value })} placeholder="e.g., 3" data-testid="size-order-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows={2} data-testid="remarks-input" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" data-testid="submit-size-btn">{editMode ? 'Update' : 'Create'} Size</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search sizes..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="search-size-input" />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Age Group</TableHead>
              <TableHead className="font-semibold">Gender</TableHead>
              <TableHead className="font-semibold">Chest</TableHead>
              <TableHead className="font-semibold">Waist</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-neutral-500">No sizes found. Click "Create Size" to add one.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SizeMaster;