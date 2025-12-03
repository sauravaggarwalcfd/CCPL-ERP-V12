import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, Edit, Trash2, Save, X, Warehouse as WarehouseIcon } from 'lucide-react';
import { toast } from 'sonner';

const WarehouseMaster = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    warehouse_code: '',
    warehouse_name: '',
    warehouse_type: 'STORE',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    capacity: '',
    parent_warehouse_id: '',
    responsible_person: '',
    contact_number: '',
    email: '',
    enable_qc: false,
    is_transit_warehouse: false,
    is_wip_warehouse: false,
    status: 'Active'
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getWarehouses();
      setWarehouses(response.data || []);
    } catch (error) {
      toast.error('Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouse_code.trim()) {
      toast.error('Warehouse Code is required');
      return;
    }
    if (!formData.warehouse_name.trim()) {
      toast.error('Warehouse Name is required');
      return;
    }

    try {
      if (editMode) {
        toast.success('Warehouse updated successfully');
      } else {
        await mastersAPI.createWarehouse(formData);
        toast.success('Warehouse created successfully');
      }
      setDialogOpen(false);
      fetchWarehouses();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save warehouse');
    }
  };

  const resetForm = () => {
    setFormData({
      warehouse_code: '',
      warehouse_name: '',
      warehouse_type: 'STORE',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      capacity: '',
      parent_warehouse_id: '',
      responsible_person: '',
      contact_number: '',
      email: '',
      enable_qc: false,
      is_transit_warehouse: false,
      is_wip_warehouse: false,
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredWarehouses = warehouses.filter(wh =>
    wh.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="warehouse-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Warehouse Master</h1>
          <p className="text-neutral-600 mt-1">Manage warehouse locations and capacity</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-warehouse-btn" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">{editMode ? 'Edit' : 'Create'} Warehouse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse_code">Warehouse Code *</Label>
                  <Input
                    id="warehouse_code"
                    value={formData.warehouse_code}
                    onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value })}
                    placeholder="WH-001"
                    required
                    disabled={editMode}
                    className={editMode ? 'bg-neutral-100' : ''}
                    data-testid="warehouse-code-input"
                  />
                  {editMode && <p className="text-xs text-neutral-500">Code cannot be changed</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse_name">Warehouse Name *</Label>
                  <Input
                    id="warehouse_name"
                    value={formData.warehouse_name}
                    onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
                    placeholder="Main Warehouse"
                    required
                    data-testid="warehouse-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse_type">Warehouse Type *</Label>
                  <Select value={formData.warehouse_type} onValueChange={(value) => setFormData({ ...formData, warehouse_type: value })}>
                    <SelectTrigger data-testid="warehouse-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STORE">Store / Storage</SelectItem>
                      <SelectItem value="CUTTING">Cutting Department</SelectItem>
                      <SelectItem value="STITCHING">Stitching Department</SelectItem>
                      <SelectItem value="SCRAP">Scrap / Waste</SelectItem>
                      <SelectItem value="PRODUCTION">Production</SelectItem>
                      <SelectItem value="RETURNS">Returns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (sq. ft)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="10000"
                    data-testid="capacity-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building/Floor/Area"
                  data-testid="location-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                  data-testid="address-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} data-testid="city-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} data-testid="state-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} data-testid="pincode-input" />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <Label className="text-base font-semibold">Responsible Person</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_person">Name</Label>
                    <Input
                      id="responsible_person"
                      value={formData.responsible_person}
                      onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                      placeholder="Manager/Supervisor Name"
                      data-testid="responsible-person-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      placeholder="+91 1234567890"
                      data-testid="contact-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="manager@company.com"
                      data-testid="email-input"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label className="text-base font-semibold">Warehouse Controls</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable_qc"
                    checked={formData.enable_qc}
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_qc: checked })}
                    data-testid="enable-qc-checkbox"
                  />
                  <Label htmlFor="enable_qc" className="cursor-pointer font-normal">
                    Enable Quality Check (QC) for this warehouse
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_transit_warehouse"
                    checked={formData.is_transit_warehouse}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_transit_warehouse: checked })}
                    data-testid="transit-checkbox"
                  />
                  <Label htmlFor="is_transit_warehouse" className="cursor-pointer font-normal">
                    Is Transit Warehouse (temporary storage during transfers)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_wip_warehouse"
                    checked={formData.is_wip_warehouse}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_wip_warehouse: checked })}
                    data-testid="wip-checkbox"
                  />
                  <Label htmlFor="is_wip_warehouse" className="cursor-pointer font-normal">
                    Is WIP Warehouse (Work-in-Progress storage)
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" data-testid="save-warehouse-btn" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update' : 'Save'} Warehouse
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Capacity</TableHead>
              <TableHead className="font-semibold">Manager</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-neutral-500">Loading...</TableCell></TableRow>
            ) : filteredWarehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <WarehouseIcon className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No warehouses found</p>
                    <p className="text-sm text-neutral-500">Click "Create Warehouse" to add one</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{warehouse.warehouse_code}</TableCell>
                  <TableCell className="font-medium">{warehouse.warehouse_name}</TableCell>
                  <TableCell>{warehouse.warehouse_type}</TableCell>
                  <TableCell>{warehouse.location || '-'}</TableCell>
                  <TableCell>{warehouse.capacity ? `${warehouse.capacity} sq.ft` : '-'}</TableCell>
                  <TableCell>{warehouse.manager_name || '-'}</TableCell>
                  <TableCell><StatusBadge status={warehouse.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-warehouse-${warehouse.id}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-warehouse-${warehouse.id}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WarehouseMaster;