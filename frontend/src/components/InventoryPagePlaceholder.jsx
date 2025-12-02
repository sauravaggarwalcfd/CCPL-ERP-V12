const InventoryPagePlaceholder = ({ title, description, module }) => {
  return (
    <div className="space-y-6" data-testid={`inventory-${module}-page`}>
      <div>
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">{title}</h1>
        <p className="text-neutral-600 mt-1">{description}</p>
      </div>
      <div className="bg-white border border-neutral-200 rounded-lg p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-neutral-900">Module Under Development</p>
            <p className="text-sm text-neutral-600 mt-2">This {module} module will be implemented with full ERP functionality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPagePlaceholder;