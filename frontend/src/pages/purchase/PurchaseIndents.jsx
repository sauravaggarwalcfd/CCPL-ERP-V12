import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseAPI, mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Send, Search, FileDown, X } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

const PurchaseIndents = () => {
  const navigate = useNavigate();
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    try {
      setLoading(true);
      const response = await purchaseAPI.getIndents();
      setIndents(response.data || []);
    } catch (error) {
      toast.error('Failed to load indents');
      setIndents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndents = indents.filter(indent =>
    indent.indent_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indent.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="purchase-indents-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Purchase Indent / Requisition</h1>
          <p className="text-neutral-600 mt-1">Create and manage purchase requisitions</p>
        </div>
        <Button onClick={() => navigate('/purchase/indents/new')} className="gap-2" data-testid="create-indent-btn">
          <Plus className="h-4 w-4" />
          New Indent
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search indents..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-indent-input"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Indent No.</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Total Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-500">Loading...</TableCell>
              </TableRow>
            ) : filteredIndents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-5xl">📝</div>
                    <p className="text-neutral-600 font-medium">No purchase indents found</p>
                    <Button onClick={() => navigate('/purchase/indents/new')} className="mt-2">
                      Create First Indent
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredIndents.map((indent) => (
                <TableRow key={indent.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{indent.indent_number || indent.indent_no}</TableCell>
                  <TableCell>{new Date(indent.date || indent.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{indent.department}</TableCell>
                  <TableCell>{indent.items?.length || 0} items</TableCell>
                  <TableCell className="font-semibold">₹{(indent.estimated_total || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell><StatusBadge status={indent.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="Submit"><Send className="h-4 w-4 text-blue-600" /></Button>
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

export default PurchaseIndents;