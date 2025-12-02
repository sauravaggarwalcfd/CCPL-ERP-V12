import React from 'react';
import InventoryLayout from '@/layouts/InventoryLayout';

// Masters
import ItemCategoryPage from '@/inventory/masters/ItemCategoryPage';
import ItemMasterPage from '@/inventory/masters/ItemMasterPage';
import UOMMasterPage from '@/inventory/masters/UOMMasterPage';
import WarehouseMasterPage from '@/inventory/masters/WarehouseMasterPage';
import BINMasterPage from '@/inventory/masters/BINMasterPage';
import BrandMasterPage from '@/inventory/masters/BrandMasterPage';
import AttributesMasterPage from '@/inventory/masters/AttributesMasterPage';

// Transactions
import OpeningStockPage from '@/inventory/transactions/OpeningStockPage';
import GoodsReceiptPage from '@/inventory/transactions/GoodsReceiptPage';
import StockIssuePage from '@/inventory/transactions/StockIssuePage';
import StockTransferPage from '@/inventory/transactions/StockTransferPage';
import StockAdjustmentPage from '@/inventory/transactions/StockAdjustmentPage';
import StockAuditPage from '@/inventory/transactions/StockAuditPage';

// Reports
import StockLedgerPage from '@/inventory/reports/StockLedgerPage';
import ItemBalancePage from '@/inventory/reports/ItemBalancePage';
import BINStockPage from '@/inventory/reports/BINStockPage';
import DeadStockPage from '@/inventory/reports/DeadStockPage';

// Settings
import NumberingPage from '@/inventory/settings/NumberingPage';
import RolesPage from '@/inventory/settings/RolesPage';
import GLMappingPage from '@/inventory/settings/GLMappingPage';
import ApprovalPage from '@/inventory/settings/ApprovalPage';

export const inventoryRoutes = {
  path: 'inventory',
  element: <InventoryLayout />,
  children: [
    // Masters
    { path: 'masters/item-category', element: <ItemCategoryPage /> },
    { path: 'masters/item-master', element: <ItemMasterPage /> },
    { path: 'masters/uom', element: <UOMMasterPage /> },
    { path: 'masters/warehouse', element: <WarehouseMasterPage /> },
    { path: 'masters/bin', element: <BINMasterPage /> },
    { path: 'masters/brand', element: <BrandMasterPage /> },
    { path: 'masters/attributes', element: <AttributesMasterPage /> },

    // Transactions
    { path: 'transactions/opening-stock', element: <OpeningStockPage /> },
    { path: 'transactions/goods-receipt', element: <GoodsReceiptPage /> },
    { path: 'transactions/stock-issue', element: <StockIssuePage /> },
    { path: 'transactions/transfer', element: <StockTransferPage /> },
    { path: 'transactions/adjustment', element: <StockAdjustmentPage /> },
    { path: 'transactions/audit', element: <StockAuditPage /> },

    // Reports
    { path: 'reports/stock-ledger', element: <StockLedgerPage /> },
    { path: 'reports/item-balance', element: <ItemBalancePage /> },
    { path: 'reports/bin-stock', element: <BINStockPage /> },
    { path: 'reports/dead-stock', element: <DeadStockPage /> },

    // Settings
    { path: 'settings/numbering', element: <NumberingPage /> },
    { path: 'settings/roles', element: <RolesPage /> },
    { path: 'settings/gl-mapping', element: <GLMappingPage /> },
    { path: 'settings/approval', element: <ApprovalPage /> }
  ]
};

export default inventoryRoutes;