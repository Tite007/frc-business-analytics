# 🏢 Companies Dashboard & Profile Pages Guide

## 📊 Complete Companies Dashboard

Create `pages/companies/index.tsx` (or `app/companies/page.tsx` for App Router):

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCompanies, useSummaryStats } from '../../hooks/useApi';
import InteractiveChart from '../../components/charts/InteractiveChart';

const CompaniesDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('');
  const [showChartsOnly, setShowChartsOnly] = useState(false);
  
  const pageSize = 12;
  const skip = (currentPage - 1) * pageSize;

  // Fetch companies with filters
  const { data: companiesData, isLoading, error } = useCompanies({
    skip,
    limit: pageSize,
    search: searchQuery || undefined,
    exchange: selectedExchange || undefined,
    has_chart: showChartsOnly || undefined,
  });

  // Fetch summary statistics
  const { data: stats } = useSummaryStats();

  const companies = companiesData?.companies || [];
  const totalCompanies = companiesData?.total_companies || 0;
  const totalPages = Math.ceil(totalCompanies / pageSize);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedExchange('');
    setShowChartsOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          FRC Covered Companies
        </h1>
        <p className="text-gray-600">
          Explore {totalCompanies} companies covered by Fundamental Research Corp
        </p>
      </div>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-sm text-blue-600 font-medium">Total Companies</div>
            <div className="text-3xl font-bold text-blue-700">{stats.total_companies}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-sm text-green-600 font-medium">With Charts</div>
            <div className="text-3xl font-bold text-green-700">{stats.companies_with_charts}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-sm text-purple-600 font-medium">Total Reports</div>
            <div className="text-3xl font-bold text-purple-700">{stats.total_reports}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="text-sm text-orange-600 font-medium">Exchanges</div>
            <div className="text-3xl font-bold text-orange-700">{stats.exchanges?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search companies by name or ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔍
              </button>
            </form>
          </div>

          {/* Exchange Filter */}
          <div>
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Exchanges</option>
              {stats?.exchanges?.map((exchange) => (
                <option key={exchange} value={exchange}>
                  {exchange}
                </option>
              ))}
            </select>
          </div>

          {/* Charts Filter & Clear */}
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={showChartsOnly}
                onChange={(e) => setShowChartsOnly(e.target.checked)}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">Charts Only</span>
            </label>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Companies</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      )}

      {/* Companies Grid */}
      {!isLoading && !error && (
        <>
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h2>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {companies.map((company) => (
                  <CompanyCard key={company.ticker} company={company} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// Company Card Component
interface CompanyCardProps {
  company: {
    company_name: string;
    ticker: string;
    exchange: string;
    currency: string;
    reports_count: number;
    has_chart: boolean;
  };
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <Link href={`/companies/${company.ticker}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        
        {/* Mini Chart Preview */}
        {company.has_chart && (
          <div className="h-32 bg-gray-50 border-b">
            <InteractiveChart 
              ticker={company.ticker} 
              height={128} 
              showControls={false}
            />
          </div>
        )}
        
        {/* Company Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {company.company_name}
              </h3>
              <p className="text-blue-600 font-semibold">
                {company.ticker}
              </p>
            </div>
            
            {company.has_chart && (
              <div className="ml-2">
                <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {company.exchange}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {company.currency}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span>📄</span>
              <span>{company.reports_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompaniesDashboard;
```

## 🔍 Advanced Search Component

Create `components/search/CompanySearch.tsx`:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchCompanies } from '../../hooks/useApi';

interface CompanySearchProps {
  placeholder?: string;
  limit?: number;
  onSelect?: (ticker: string) => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ 
  placeholder = "Search companies...",
  limit = 5,
  onSelect 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { data, isLoading } = useSearchCompanies(query, limit);
  const companies = data?.companies || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleSelect = (ticker: string) => {
    setIsOpen(false);
    setQuery('');
    onSelect?.(ticker);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          🔍
        </div>
        
        {isLoading && query.length >= 2 && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {companies.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              No companies found for "{query}"
            </div>
          ) : (
            companies.map((company) => (
              <div
                key={company.ticker}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelect(company.ticker)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {company.company_name}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-blue-600 font-semibold">
                        {company.ticker}
                      </span>
                      <span>•</span>
                      <span>{company.exchange}</span>
                      {company.has_chart && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">📊 Chart</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {company.reports_count} reports
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
```

## 🏠 Main Layout Component

Create `components/layout/Layout.tsx`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CompanySearch from '../search/CompanySearch';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleSearchSelect = (ticker: string) => {
    router.push(`/companies/${ticker}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="font-bold text-gray-900">FRC Dashboard</div>
                <div className="text-xs text-gray-500">Fundamental Research Corp</div>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <CompanySearch 
                placeholder="Search companies by name or ticker..."
                onSelect={handleSearchSelect}
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link 
                href="/companies" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Companies
              </Link>
              <Link 
                href="/analytics" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Analytics
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📊</div>
                <div className="font-bold">FRC Dashboard</div>
              </div>
              <p className="text-gray-400 text-sm">
                Interactive stock analysis dashboard powered by 
                Fundamental Research Corp data and AI insights.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/companies" className="block text-gray-400 hover:text-white">
                  Browse Companies
                </Link>
                <Link href="/analytics" className="block text-gray-400 hover:text-white">
                  Market Analytics
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white">
                  About FRC
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📧 info@researchfrc.com</p>
                <p>🌐 www.researchfrc.com</p>
                <p>📍 Vancouver, BC, Canada</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-400">
            © 2025 Fundamental Research Corp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
```

## ✅ Complete Frontend Structure

With these components, you'll have:

1. **✅ Companies Dashboard** - Browse all 122 FRC companies with search and filters
2. **✅ Individual Company Profiles** - Complete details with interactive charts
3. **✅ Real-time Search** - Instant company search with auto-complete
4. **✅ Interactive Charts** - Plotly.js charts from your backend data
5. **✅ Responsive Design** - Works on all device sizes
6. **✅ Professional Layout** - Clean, modern design with proper navigation

Your backend's `dashboard.py` charts will display perfectly in the React frontend! 🚀
