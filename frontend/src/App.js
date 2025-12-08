import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import { inventoryRoutes } from '@/router/inventoryRoutes';

// Masters
import ItemCategories from '@/pages/masters/ItemCategories';
import ItemCategoryMaster from '@/pages/masters/ItemCategoryMaster';
import CategoryForm from '@/pages/masters/CategoryForm';
import ItemMaster from '@/pages/masters/ItemMaster';
import ItemMasterForm from '@/pages/masters/ItemMasterForm';
import ColorMaster from '@/pages/masters/ColorMaster';
import ColorForm from '@/pages/masters/ColorForm';
import SizeMaster from '@/pages/masters/SizeMaster';
import SizeForm from '@/pages/masters/SizeForm';
import BrandMaster from '@/pages/masters/BrandMaster';
import BrandForm from '@/pages/masters/BrandForm';
import SupplierMaster from '@/pages/masters/SupplierMaster';
import SupplierForm from '@/pages/masters/SupplierForm';
import UOMMaster from '@/pages/masters/UOMMaster';
import UOMForm from '@/pages/masters/UOMForm';
import WarehouseMaster from '@/pages/masters/WarehouseMaster';
import WarehouseForm from '@/pages/masters/WarehouseForm';
import BINLocationMaster from '@/pages/masters/BINLocationMaster';
import TaxHSNMaster from '@/pages/masters/TaxHSNMaster';
import FabricCategoryMaster from '@/pages/masters/FabricCategoryMaster';

// Purchase
import PurchaseIndents from '@/pages/purchase/PurchaseIndents';
import PurchaseIndentForm from '@/pages/purchase/PurchaseIndentForm';
import PurchaseOrders from '@/pages/purchase/PurchaseOrders';
import PurchaseOrderForm from '@/pages/purchase/PurchaseOrderForm';
import POApprovalPanel from '@/pages/purchase/POApprovalPanel';

// Quality
import QualityChecks from '@/pages/quality/QualityChecks';

// Inventory
import GRN from '@/pages/inventory/GRN';
import StockInward from '@/pages/inventory/StockInward';
import StockTransfer from '@/pages/inventory/StockTransfer';
import IssueToDepartment from '@/pages/inventory/IssueToDepartment';
import ReturnFromDepartment from '@/pages/inventory/ReturnFromDepartment';
import StockAdjustment from '@/pages/inventory/StockAdjustment';
import OpeningStockPage from '@/inventory/transactions/OpeningStockPage';
import StockIssuePage from '@/inventory/transactions/StockIssuePage';
import StockAuditPage from '@/inventory/transactions/StockAuditPage';

// Reports
import StockLedger from '@/pages/reports/StockLedger';
import ItemBalanceReport from '@/pages/reports/ItemBalanceReport';
import IssueReturnRegister from '@/pages/reports/IssueReturnRegister';
import PendingPOReport from '@/pages/reports/PendingPOReport';
import BINStockPage from '@/inventory/reports/BINStockPage';
import DeadStockPage from '@/inventory/reports/DeadStockPage';

// Settings
import ApprovalFlows from '@/pages/settings/ApprovalFlows';
import NumberSeries from '@/pages/settings/NumberSeries';
import RolesPermissions from '@/pages/settings/RolesPermissions';
import AccountMapping from '@/pages/settings/AccountMapping';

import '@/App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Masters */}
              <Route path="masters/item-categories" element={<ItemCategoryMaster />} />
              <Route path="masters/item-categories/old" element={<ItemCategories />} />
              <Route path="masters/item-categories/new" element={<CategoryForm />} />
              <Route path="masters/item-categories/edit/:id" element={<CategoryForm />} />
              <Route path="masters/items" element={<ItemMaster />} />
              <Route path="masters/items/new" element={<ItemMasterForm />} />
              <Route path="masters/items/edit/:id" element={<ItemMasterForm />} />
              <Route path="masters/colors" element={<ColorMaster />} />
              <Route path="masters/colors/new" element={<ColorForm />} />
              <Route path="masters/colors/edit/:id" element={<ColorForm />} />
              <Route path="masters/sizes" element={<SizeMaster />} />
              <Route path="masters/sizes/new" element={<SizeForm />} />
              <Route path="masters/sizes/edit/:id" element={<SizeForm />} />
              <Route path="masters/brands" element={<BrandMaster />} />
              <Route path="masters/brands/new" element={<BrandForm />} />
              <Route path="masters/brands/edit/:id" element={<BrandForm />} />
              <Route path="masters/suppliers" element={<SupplierMaster />} />
              <Route path="masters/suppliers/new" element={<SupplierForm />} />
              <Route path="masters/suppliers/edit/:id" element={<SupplierForm />} />
              <Route path="masters/uoms" element={<UOMMaster />} />
              <Route path="masters/uoms/new" element={<UOMForm />} />
              <Route path="masters/uoms/edit/:id" element={<UOMForm />} />
              <Route path="masters/warehouses" element={<WarehouseMaster />} />
              <Route path="masters/warehouses/new" element={<WarehouseForm />} />
              <Route path="masters/warehouses/edit/:id" element={<WarehouseForm />} />
              <Route path="masters/suppliers" element={<SupplierMaster />} />
              <Route path="masters/warehouses" element={<WarehouseMaster />} />
              <Route path="masters/bin-locations" element={<BINLocationMaster />} />
              <Route path="masters/tax-hsn" element={<TaxHSNMaster />} />
              <Route path="masters/fabric-categories" element={<FabricCategoryMaster />} />
              <Route path="masters/colors" element={<ColorMaster />} />
              <Route path="masters/sizes" element={<SizeMaster />} />
              <Route path="masters/brands" element={<BrandMaster />} />

              {/* Purchase */}
              <Route path="purchase/indents" element={<PurchaseIndents />} />
              <Route path="purchase/indents/new" element={<PurchaseIndentForm />} />
              <Route path="purchase/indents/edit/:id" element={<PurchaseIndentForm />} />
              <Route path="purchase/orders" element={<PurchaseOrders />} />
              <Route path="purchase/orders/new" element={<PurchaseOrderForm />} />
              <Route path="purchase/orders/edit/:id" element={<PurchaseOrderForm />} />
              <Route path="purchase/approvals" element={<POApprovalPanel />} />

              {/* Quality */}
              <Route path="quality/checks" element={<QualityChecks />} />

              {/* Inventory Transactions */}
              <Route path="inventory/opening-stock" element={<OpeningStockPage />} />
              <Route path="inventory/grn" element={<GRN />} />
              <Route path="inventory/stock-inward" element={<StockInward />} />
              <Route path="inventory/stock-issue" element={<StockIssuePage />} />
              <Route path="inventory/stock-transfer" element={<StockTransfer />} />
              <Route path="inventory/adjustment" element={<StockAdjustment />} />
              <Route path="inventory/audit" element={<StockAuditPage />} />
              <Route path="inventory/issue" element={<IssueToDepartment />} />
              <Route path="inventory/return" element={<ReturnFromDepartment />} />

              {/* Reports */}
              <Route path="reports/stock-ledger" element={<StockLedger />} />
              <Route path="reports/item-balance" element={<ItemBalanceReport />} />
              <Route path="reports/bin-stock" element={<BINStockPage />} />
              <Route path="reports/dead-stock" element={<DeadStockPage />} />
              <Route path="reports/issue-return" element={<IssueReturnRegister />} />
              <Route path="reports/pending-po" element={<PendingPOReport />} />

              {/* Settings */}
              <Route path="settings/approval-flows" element={<ApprovalFlows />} />
              <Route path="settings/number-series" element={<NumberSeries />} />
              <Route path="settings/roles" element={<RolesPermissions />} />
              <Route path="settings/account-mapping" element={<AccountMapping />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
