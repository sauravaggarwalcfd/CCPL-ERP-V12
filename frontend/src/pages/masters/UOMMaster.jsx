import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Save, X, ArrowRightLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const UOMMaster = () => {
  const navigate = useNavigate();
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uomToDelete, setUOMToDelete] = useState(null);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [selectedUOM, setSelectedUOM] = useState(null);

  const [formData, setFormData] = useState({
    uom_name: '',
    uom_type: 'QUANTITY',
    uom_category: 'COUNT',
    decimal_precision: '2',
    symbol: '',
    description: '',
    is_base_unit: false,
    base_uom_id: '',
    base_uom_name: '',
    conversion_factor: '1.0',
    status: 'Active'
  });

  const [conversions, setConversions] = useState([]);
  const [newConversion, setNewConversion] = useState({
    to_uom: '',
    conversion_factor: ''
  });

  useEffect(() => {
    fetchUOMs();
  }, []);

  const fetchUOMs = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockUOMs = [
        {
          id: '1',
          uom_name: 'Piece',
          uom_type: 'QUANTITY',
          uom_category: 'COUNT',
          decimal_precision: 0,
          symbol: 'PCS',
          is_base_unit: true,
          base_uom_id: null,
          conversion_factor: 1.0,
          status: 'Active',
          conversions: []
        },
        {
          id: '2',
          uom_name: 'Kilogram',
          uom_type: 'WEIGHT',
          uom_category: 'WEIGHT',
          decimal_precision: 3,
          symbol: 'KG',
          is_base_unit: true,
          base_uom_id: null,
          conversion_factor: 1.0,
          status: 'Active',
          conversions: [
            { to_uom: 'Gram', factor: 1000 },
            { to_uom: 'Ton', factor: 0.001 }
          ]
        },
        {
          id: '3',
          uom_name: 'Meter',
          uom_type: 'LENGTH',
          uom_category: 'LENGTH',
          decimal_precision: 2,
          symbol: 'MTR',
          is_base_unit: true,
          base_uom_id: null,
          conversion_factor: 1.0,
          status: 'Active',
          conversions: [
            { to_uom: 'Centimeter', factor: 100 },
            { to_uom: 'Kilometer', factor: 0.001 }
          ]
        },
        {
          id: '4',
          uom_name: 'Gram',
          uom_type: 'WEIGHT',
          uom_category: 'WEIGHT',
          decimal_precision: 2,
          symbol: 'GM',
          is_base_unit: false,
          base_uom_id: '2',
          base_uom_name: 'Kilogram',
          conversion_factor: 0.001,
          status: 'Active',
          conversions: []
        }
      ];
      setUOMs(mockUOMs);
    } catch (error) {
      toast.error('Failed to load UOMs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uom_name.trim()) {
      toast.error('UOM Name is required');
      return;
    }
    if (!formData.uom_type) {
      toast.error('UOM Type is required');
      return;
    }
    if (formData.decimal_precision === '' || parseInt(formData.decimal_precision) < 0) {
      toast.error('Valid decimal precision is required');
      return;
    }

    try {
      const payload = {
        ...formData,
        decimal_precision: parseInt(formData.decimal_precision),
        conversions: conversions
      };

      if (editMode) {
        toast.success('UOM updated successfully');
        setUOMs(uoms.map(u => u.id === currentId ? { ...u, ...payload } : u));
      } else {
        toast.success('UOM created successfully');
        setUOMs([...uoms, { ...payload, id: Date.now().toString() }]);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save UOM');
    }
  };

  const handleEdit = (uom) => {
    setFormData({
      uom_name: uom.uom_name,
      uom_type: uom.uom_type,
      decimal_precision: uom.decimal_precision.toString(),
      symbol: uom.symbol || '',
      description: uom.description || '',
      is_base_unit: uom.is_base_unit || false,
      status: uom.status
    });
    setConversions(uom.conversions || []);
    setCurrentId(uom.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      toast.success('UOM deleted successfully');
      setUOMs(uoms.filter(u => u.id !== uomToDelete.id));
      setDeleteDialogOpen(false);
      setUOMToDelete(null);
    } catch (error) {
      toast.error('Failed to delete UOM');
    }
  };

  const openDeleteDialog = (uom) => {
    setUOMToDelete(uom);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      uom_name: '',
      uom_type: 'QUANTITY',
      decimal_precision: '2',
      symbol: '',
      description: '',
      is_base_unit: false,
      status: 'Active'
    });
    setConversions([]);
    setEditMode(false);
    setCurrentId(null);
  };

  const handleAddConversion = () => {
    if (!newConversion.to_uom || !newConversion.conversion_factor) {
      toast.error('Please fill all conversion fields');
      return;
    }

    if (parseFloat(newConversion.conversion_factor) <= 0) {
      toast.error('Conversion factor must be positive');
      return;
    }

    const conversion = {
      to_uom: newConversion.to_uom,
      factor: parseFloat(newConversion.conversion_factor)
    };

    setConversions([...conversions, conversion]);
    setNewConversion({ to_uom: '', conversion_factor: '' });
    toast.success('Conversion added');
  };

  const handleRemoveConversion = (index) => {
    setConversions(conversions.filter((_, i) => i !== index));
    toast.success('Conversion removed');
  };

  const openConversionDialog = (uom) => {
    setSelectedUOM(uom);
    setConversionDialogOpen(true);
  };

  const filteredUOMs = uoms.filter(uom =>
    uom.uom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uom.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'WEIGHT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LENGTH': return 'bg-green-100 text-green-800 border-green-200';
      case 'VOLUME': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AREA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TIME': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="uom-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">UOM Master</h1>
          <p className="text-neutral-600 mt-1">Manage units of measurement and conversion factors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-uom-btn" className="gap-2">
              <Plus className="h-4 w-4" />
              Create UOM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">
                {editMode ? 'Edit' : 'Create'} UOM
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uom_name">UOM Name *</Label>
                    <Input
                      id="uom_name"
                      value={formData.uom_name}
                      onChange={(e) => setFormData({ ...formData, uom_name: e.target.value })}
                      placeholder="e.g., Kilogram, Meter"
                      required
                      data-testid="uom-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      placeholder="e.g., KG, MTR"
                      data-testid="symbol-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uom_type">UOM Type *</Label>
                    <Select value={formData.uom_type} onValueChange={(value) => setFormData({ ...formData, uom_type: value })}>
                      <SelectTrigger data-testid="uom-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUANTITY">Quantity</SelectItem>
                        <SelectItem value="WEIGHT">Weight</SelectItem>
                        <SelectItem value="LENGTH">Length</SelectItem>
                        <SelectItem value="VOLUME">Volume</SelectItem>
                        <SelectItem value="AREA">Area</SelectItem>
                        <SelectItem value="TIME">Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uom_category">Category *</Label>
                    <Select value={formData.uom_category} onValueChange={(value) => setFormData({ ...formData, uom_category: value })}>
                      <SelectTrigger data-testid="uom-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEIGHT">Weight</SelectItem>
                        <SelectItem value="LENGTH">Length</SelectItem>
                        <SelectItem value="COUNT">Count</SelectItem>
                        <SelectItem value="VOLUME">Volume</SelectItem>
                        <SelectItem value="AREA">Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimal_precision">Decimal Precision *</Label>
                    <Select value={formData.decimal_precision} onValueChange={(value) => setFormData({ ...formData, decimal_precision: value })}>
                      <SelectTrigger data-testid="precision-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (No decimals)</SelectItem>
                        <SelectItem value="1">1 decimal</SelectItem>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                        <SelectItem value="4">4 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    data-testid="description-input"
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_base_unit"
                      checked={formData.is_base_unit}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_base_unit: checked, base_uom_id: '', conversion_factor: '1.0' })}
                      data-testid="base-unit-checkbox"
                    />
                    <Label htmlFor="is_base_unit" className="cursor-pointer">
                      This is a Base Unit (no conversion required)
                    </Label>
                  </div>

                  {!formData.is_base_unit && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                        <Label className="text-sm font-semibold text-blue-900">Base UOM Mapping</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="base_uom_id" className="text-xs">Base UOM</Label>
                            <Select value={formData.base_uom_id} onValueChange={(value) => {
                              const baseUOM = uoms.find(u => u.id === value);
                              setFormData({ ...formData, base_uom_id: value, base_uom_name: baseUOM?.uom_name || '' });
                            }}>
                              <SelectTrigger data-testid="base-uom-select">
                                <SelectValue placeholder="Select base UOM" />
                              </SelectTrigger>
                              <SelectContent>
                                {uoms.filter(u => u.is_base_unit && u.uom_category === formData.uom_category).map(u => (
                                  <SelectItem key={u.id} value={u.id}>{u.uom_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-blue-600">Only showing base units in same category</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="conversion_factor" className="text-xs">Conversion Factor</Label>
                            <Input
                              id="conversion_factor"
                              type="number"
                              step="0.0001"
                              value={formData.conversion_factor}
                              onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                              placeholder="1.0"
                              data-testid="base-conversion-factor-input"
                            />
                            <p className="text-xs text-neutral-500">1 {formData.uom_name || 'Unit'} = {formData.conversion_factor || '1'} {formData.base_uom_name || 'Base Unit'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Conversion Mapping</Label>
                  <span className="text-xs text-neutral-500">1 {formData.uom_name || 'Unit'} =</span>
                </div>

                {conversions.length > 0 && (
                  <div className="space-y-2">
                    {conversions.map((conv, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-md border border-neutral-200">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{conv.factor}</span>
                          <span className="text-neutral-600">×</span>
                          <span className="font-medium">{conv.to_uom}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveConversion(index)}
                          data-testid={`remove-conversion-${index}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Add Conversion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="to_uom" className="text-xs">To UOM</Label>
                        <Input
                          id="to_uom"
                          value={newConversion.to_uom}
                          onChange={(e) => setNewConversion({ ...newConversion, to_uom: e.target.value })}
                          placeholder="Target unit"
                          data-testid="conversion-to-uom-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conversion_factor" className="text-xs">Factor</Label>
                        <Input
                          id="conversion_factor"
                          type="number"
                          step="0.0001"
                          value={newConversion.conversion_factor}
                          onChange={(e) => setNewConversion({ ...newConversion, conversion_factor: e.target.value })}
                          placeholder="1.0"
                          data-testid="conversion-factor-input"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddConversion}
                      className="w-full"
                      data-testid="add-conversion-btn"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Add Conversion
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} data-testid="cancel-btn">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" data-testid="save-btn" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update' : 'Save'} UOM
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total UOMs</CardDescription>
            <CardTitle className="text-3xl">{uoms.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weight Units</CardDescription>
            <CardTitle className="text-3xl">{uoms.filter(u => u.uom_type === 'WEIGHT').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Length Units</CardDescription>
            <CardTitle className="text-3xl">{uoms.filter(u => u.uom_type === 'LENGTH').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quantity Units</CardDescription>
            <CardTitle className="text-3xl">{uoms.filter(u => u.uom_type === 'QUANTITY').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search UOMs by name or symbol..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-uom-input"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">UOM Name</TableHead>
              <TableHead className="font-semibold">Symbol</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Precision</TableHead>
              <TableHead className="font-semibold">Conversions</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                  Loading UOMs...
                </TableCell>
              </TableRow>
            ) : filteredUOMs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRightLeft className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No UOMs found</p>
                    <p className="text-sm text-neutral-500">Click "Create UOM" to add your first unit</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUOMs.map((uom) => (
                <TableRow key={uom.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-medium">{uom.uom_name}</TableCell>
                  <TableCell>
                    {uom.symbol && (
                      <Badge variant="outline" className="font-mono">{uom.symbol}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getTypeColor(uom.uom_type)}`}>
                      {uom.uom_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{uom.decimal_precision}</TableCell>
                  <TableCell>
                    {uom.conversions && uom.conversions.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConversionDialog(uom)}
                        className="h-7 text-xs"
                        data-testid={`view-conversions-${uom.id}`}
                      >
                        <ArrowRightLeft className="h-3 w-3 mr-1" />
                        {uom.conversions.length} conversions
                      </Button>
                    ) : (
                      <span className="text-xs text-neutral-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      uom.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {uom.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(uom)} data-testid={`edit-uom-${uom.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(uom)} data-testid={`delete-uom-${uom.id}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete UOM</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{uomToDelete?.uom_name}</strong>? 
              This action cannot be undone and may affect existing inventory items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete-btn">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={conversionDialogOpen} onOpenChange={setConversionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Conversion Factors - {selectedUOM?.uom_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedUOM?.conversions && selectedUOM.conversions.length > 0 ? (
              selectedUOM.conversions.map((conv, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-neutral-600">
                        1 {selectedUOM.uom_name} =
                      </div>
                      <div className="text-lg font-semibold">
                        <span className="font-mono text-primary">{conv.factor}</span>
                        <span className="mx-2">×</span>
                        <span>{conv.to_uom}</span>
                      </div>
                    </div>
                    <ArrowRightLeft className="h-5 w-5 text-neutral-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No conversions defined for this UOM
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setConversionDialogOpen(false)} data-testid="close-conversion-dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UOMMaster;
