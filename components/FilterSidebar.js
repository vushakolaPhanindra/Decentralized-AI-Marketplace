import { useState } from 'react';

export default function FilterSidebar({ filters, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(true);

  const dataTypes = [
    { value: 'all', label: 'All Types', icon: '📊' },
    { value: 'medical', label: 'Medical / Healthcare', icon: '🏥' },
    { value: 'financial', label: 'Financial', icon: '🏦' },
    { value: 'behavioral', label: 'Behavioral / Customer', icon: '🛍️' },
    { value: 'iot', label: 'IoT / Sensor Data', icon: '📡' },
    { value: 'research', label: 'Research / Academic', icon: '🔬' },
    { value: 'other', label: 'Other', icon: '📈' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-1', label: 'Under 1 AVAX' },
    { value: '1-5', label: '1 - 5 AVAX' },
    { value: '5-10', label: '5 - 10 AVAX' },
    { value: '10-50', label: '10 - 50 AVAX' },
    { value: '50+', label: '50+ AVAX' }
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      dataType: 'all',
      priceRange: 'all',
      sortBy: 'newest',
      searchQuery: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Datasets
            </label>
            <input
              type="text"
              placeholder="Search by name, description..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <div className="space-y-2">
              {dataTypes.map((type) => (
                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dataType"
                    value={type.value}
                    checked={filters.dataType === type.value}
                    onChange={(e) => handleFilterChange('dataType', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {type.icon} {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range.value}
                    checked={filters.priceRange === range.value}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>

          {/* Quick Stats */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Datasets:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span>Active Sellers:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Price:</span>
                <span className="font-medium">8.5 AVAX</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
