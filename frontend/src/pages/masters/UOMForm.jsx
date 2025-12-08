import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, FileText, ArrowRightLeft, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const UOMForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uoms, setUOMs] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');
  const [conversions, setConversions] = useState([]);
  const [newConversion, setNewConversion] = useState({ to_uom: '', conversion_factor: '' });

  const [formData, setFormData] = useState({
    uom_name: '', uom_type: 'QUANTITY', uom_category: 'COUNT',
    decimal_precision: '2', symbol: '', description: '',
    is_base_unit: false, base_uom_id: '', base_uom_name: '',
    conversion_factor: '1.0', status: 'Active'
  });

  useEffect(() => {
    fetchUOMs();
    if (id) fetchUOM(id);
  }, [id]);

  const fetchUOMs = async () => {
    try {
      const response = await mastersAPI.getUOMs();
      setUOMs(response.data || []);
    } catch (error) {
      toast.error('Failed to load UOMs');
    }
  };

  const fetchUOM = async (uomId) => {
    try {
      const response = await mastersAPI.getUOM(uomId);
      setFormData(response.data);
      setConversions(response.data.conversions || []);
    } catch (error) {
      toast.error('Failed to load UOM');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uom_name.trim()) {
      toast.error('UOM Name is required');
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
        conversion_factor: parseFloat(formData.conversion_factor) || 1.0,
        conversions: conversions
      };

      if (id) {
        toast.success('UOM updated successfully');
      } else {
        await mastersAPI.createUOM(payload);
        toast.success('UOM created successfully');
      }
      navigate('/masters/uoms');
    } catch (error) {
      toast.error('Failed to save UOM');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'conversion', label: 'UOM Conversion', icon: ArrowRightLeft }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/uoms')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} UOM Master</h1>
              <p className="text-base text-emerald-100">Unit of measurement with conversion mapping</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/uoms')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="uom-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} UOM
            </Button>
          </div>
        </div>

        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${activeSection === section.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50/50'}`}>
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-full px-8 py-6 mt-4">
        <div className="max-w-full mx-auto">
          <form id="uom-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="uom_name" className="text-base font-medium">UOM Name *</Label>
                    <Input id="uom_name" value={formData.uom_name} onChange={(e) => setFormData({ ...formData, uom_name: e.target.value })} placeholder="Kilogram, Meter" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-base font-medium">Symbol</Label>
                    <Input id="symbol" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} placeholder="KG, MTR" className="h-11 text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="uom_type" className="text-base font-medium">UOM Type *</Label>
                    <Select value={formData.uom_type} onValueChange={(value) => setFormData({ ...formData, uom_type: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
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
                    <Label htmlFor="uom_category" className="text-base font-medium">Category *</Label>
                    <Select value={formData.uom_category} onValueChange={(value) => setFormData({ ...formData, uom_category: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
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
                    <Label htmlFor="decimal_precision" className="text-base font-medium">Decimal Precision *</Label>
                    <Select value={formData.decimal_precision} onValueChange={(value) => setFormData({ ...formData, decimal_precision: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
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
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" className="h-11 text-base" />
                </div>
              </CardContent>
            </Card>

            <Card id="conversion" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><ArrowRightLeft className="h-6 w-6 text-green-600" />UOM Conversion Mapping</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="flex items-center space-x-3 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox id="is_base_unit" checked={formData.is_base_unit} onCheckedChange={(checked) => setFormData({ ...formData, is_base_unit: checked, base_uom_id: '', conversion_factor: '1.0' })} className="h-5 w-5" />
                  <Label htmlFor="is_base_unit" className="text-base font-medium cursor-pointer">This is a Base Unit (no conversion required)</Label>
                </div>

                {!formData.is_base_unit && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 space-y-5">
                    <Label className="text-lg font-semibold text-purple-900">Base UOM Mapping</Label>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="base_uom_id" className="text-base font-medium">Base UOM</Label>
                        <Select value={formData.base_uom_id} onValueChange={(value) => {
                          const baseUOM = uoms.find(u => u.id === value);
                          setFormData({ ...formData, base_uom_id: value, base_uom_name: baseUOM?.uom_name || '' });
                        }}>
                          <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select base UOM" /></SelectTrigger>
                          <SelectContent>
                            {uoms.filter(u => u.is_base_unit && u.uom_category === formData.uom_category).map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.uom_name} ({u.symbol})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-purple-600">Only showing base units in same category</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conversion_factor" className="text-base font-medium">Conversion Factor</Label>
                        <Input id="conversion_factor" type="number" step="0.0001" value={formData.conversion_factor} onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })} placeholder="1.0" className="h-11 text-base" />
                        <p className="text-xs text-neutral-500">1 {formData.uom_name || 'Unit'} = {formData.conversion_factor || '1'} {formData.base_uom_name || 'Base Unit'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-amber-900">Additional Conversions</Label>
                    <span className="text-xs text-amber-600">1 {formData.uom_name || 'Unit'} =</span>
                  </div>

                  {conversions.length > 0 && (
                    <div className="space-y-3">
                      {conversions.map((conv, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white border-2 border-neutral-200 rounded-lg">
                          <div className="flex-1 flex items-center gap-3">
                            <span className="font-mono text-lg font-medium text-amber-900">{conv.factor}</span>
                            <span className="text-neutral-600">×</span>
                            <span className="font-medium text-lg">{conv.to_uom}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveConversion(index)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Add New Conversion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">To UOM</Label>
                          <Input value={newConversion.to_uom} onChange={(e) => setNewConversion({ ...newConversion, to_uom: e.target.value })} placeholder="Target unit" className="h-10 text-base" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Factor</Label>
                          <Input type="number" step="0.0001" value={newConversion.conversion_factor} onChange={(e) => setNewConversion({ ...newConversion, conversion_factor: e.target.value })} placeholder="1.0" className="h-10 text-base" />
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddConversion} className="w-full gap-2">
                        <Plus className="h-3 w-3" />Add Conversion
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UOMForm;