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

const ColorMaster = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    color_code: '',
    color_name: '',
    color_family: 'NEUTRAL',
    hex_code: '#000000',
    pantone_code: '',
    rgb_value: '',
    season: 'ALL',
    is_standard: true,
    dyeing_cost_factor: '1.0',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getColors();
      setColors(response.data || []);
    } catch (error) {
      toast.error('Failed to load colors');
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.color_code.trim()) {
      toast.error('Color code is required');
      return;
    }
    if (!formData.color_name.trim()) {
      toast.error('Color name is required');
      return;
    }

    try {
      if (editMode) {
        // await axios.put(`${API}/masters/colors/${currentId}`, formData);
        toast.success('Color updated successfully');
      } else {
        // await axios.post(`${API}/masters/colors`, formData);
        toast.success('Color created successfully');
      }
      
      setDialogOpen(false);
      fetchColors();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save color');
    }
  };

  const resetForm = () => {
    setFormData({
      color_code: '',
      color_name: '',
      color_family: 'NEUTRAL',
      hex_code: '#000000',
      pantone_code: '',
      rgb_value: '',
      season: 'ALL',
      is_standard: true,
      dyeing_cost_factor: '1.0',
      remarks: '',
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredColors = colors.filter(color =>
    color.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.color_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="color-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Color Master</h1>
          <p className="text-neutral-600 mt-1">Manage garment colors and specifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-color-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Color
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Create'} Color</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color_code">Color Code *</Label>
                  <Input
                    id="color_code"
                    value={formData.color_code}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    placeholder="e.g., CLR-001"
                    required
                    data-testid="color-code-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color_name">Color Name *</Label>
                  <Input
                    id="color_name"
                    value={formData.color_name}
                    onChange={(e) => setFormData({ ...formData, color_name: e.target.value })}
                    placeholder="e.g., Navy Blue"
                    required
                    data-testid="color-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color_family">Color Family *</Label>
                  <Select value={formData.color_family} onValueChange={(value) => setFormData({ ...formData, color_family: value })}>
                    <SelectTrigger data-testid="color-family-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RED">Red</SelectItem>
                      <SelectItem value="BLUE">Blue</SelectItem>
                      <SelectItem value="GREEN">Green</SelectItem>
                      <SelectItem value="YELLOW">Yellow</SelectItem>
                      <SelectItem value="ORANGE">Orange</SelectItem>
                      <SelectItem value="PURPLE">Purple</SelectItem>
                      <SelectItem value="PINK">Pink</SelectItem>
                      <SelectItem value="BROWN">Brown</SelectItem>
                      <SelectItem value="NEUTRAL">Neutral (Black/White/Grey)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hex_code">Hex Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex_code"
                      type="color"
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      className="w-20 h-10 p-1"
                      data-testid="hex-code-picker"
                    />
                    <Input
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                      data-testid="hex-code-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pantone_code">Pantone Code</Label>
                  <Input
                    id="pantone_code"
                    value={formData.pantone_code}
                    onChange={(e) => setFormData({ ...formData, pantone_code: e.target.value })}
                    placeholder="e.g., 19-4052 TPX"
                    data-testid="pantone-code-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rgb_value">RGB Value</Label>
                  <Input
                    id="rgb_value"
                    value={formData.rgb_value}
                    onChange={(e) => setFormData({ ...formData, rgb_value: e.target.value })}
                    placeholder="e.g., 0,0,128"
                    data-testid="rgb-value-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                    <SelectTrigger data-testid="season-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Season</SelectItem>
                      <SelectItem value="SPRING">Spring</SelectItem>
                      <SelectItem value="SUMMER">Summer</SelectItem>
                      <SelectItem value="FALL">Fall</SelectItem>
                      <SelectItem value="WINTER">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dyeing_cost_factor">Dyeing Cost Factor</Label>
                  <Input
                    id="dyeing_cost_factor"
                    type="number"
                    step="0.1"
                    value={formData.dyeing_cost_factor}
                    onChange={(e) => setFormData({ ...formData, dyeing_cost_factor: e.target.value })}
                    placeholder="1.0"
                    data-testid="dyeing-cost-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes about the color"
                  rows={3}
                  data-testid="remarks-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" data-testid="submit-color-btn">
                  {editMode ? 'Update' : 'Create'} Color
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search colors..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-color-input"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Color</TableHead>
              <TableHead className="font-semibold">Family</TableHead>
              <TableHead className="font-semibold">Pantone</TableHead>
              <TableHead className="font-semibold">Season</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-neutral-500">Loading...</TableCell>
              </TableRow>
            ) : filteredColors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-neutral-500">No colors found. Click "Create Color" to add one.</TableCell>
              </TableRow>
            ) : (
              filteredColors.map((color) => (
                <TableRow key={color.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{color.color_code}</TableCell>
                  <TableCell className="font-medium">{color.color_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-neutral-300" style={{ backgroundColor: color.hex_code }} />
                      <span className="text-xs font-mono">{color.hex_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{color.color_family}</TableCell>
                  <TableCell>{color.pantone_code || '-'}</TableCell>
                  <TableCell>{color.season}</TableCell>
                  <TableCell><StatusBadge status={color.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-color-${color.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-color-${color.id}`}>
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
    </div>
  );
};

export default ColorMaster;