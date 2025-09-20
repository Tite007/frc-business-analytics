"use client";

import { useState, useEffect } from "react";
import { BuildingOfficeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { getBloombergStats, getBloombergReadership } from "@/lib/api";

export default function InstitutionsOverview({ ticker = null }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);

        if (ticker) {
          const data = await getBloombergReadership(ticker);
          if (data.success && data.data.readership_data) {
            // For specific ticker, get unique institutions
            const uniqueInstitutions = {};
            data.data.readership_data.forEach(record => {
              if (!uniqueInstitutions[record.institution_name]) {
                uniqueInstitutions[record.institution_name] = {
                  name: record.institution_name,
                  country: record.country,
                  reads: 0
                };
              }
              uniqueInstitutions[record.institution_name].reads++;
            });
            setInstitutions(Object.values(uniqueInstitutions));
          }
        } else {
          const data = await getBloombergStats();
          if (data.success) {
            // For overview, show top institutions from stats
            setInstitutions(data.top_institutions || []);
          }
        }
      } catch (error) {
        console.error("Error fetching institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <BuildingOfficeIcon className="h-5 w-5" />
          {ticker ? `Institutions Reading ${ticker}` : "Top Institutions"}
        </h3>
      </div>

      <div className="p-6">
        {institutions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No institutional data available
          </div>
        ) : (
          <div className="space-y-4">
            {institutions.slice(0, 10).map((institution, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {institution.name || institution.institution_name}
                    </div>
                    {institution.country && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <GlobeAltIcon className="h-4 w-4" />
                        {institution.country}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {institution.reads ? `${institution.reads} reads` : institution.count || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}