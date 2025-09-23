"use client";

import { useState, useEffect } from "react";
import { BuildingOfficeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { getBloombergV3Institutions, getBloombergV3Analytics } from "@/lib/api";

export default function InstitutionsOverview({ ticker = null }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);

        if (ticker) {
          // For specific ticker, get analytics with top institutions
          const data = await getBloombergV3Analytics(ticker);
          if (data && data.top_institutions) {
            setInstitutions(data.top_institutions);
          }
        } else {
          // For overview, get top institutions from v3 API
          const response = await getBloombergV3Institutions({ limit: 10, min_reads: 5 });
          if (response && Array.isArray(response)) {
            const formattedInstitutions = response.map(inst => ({
              name: inst.customer_name,
              country: inst.customer_country,
              city: inst.customer_city,
              reads: inst.total_reads,
              is_embargoed: inst.is_embargoed_entity
            }));
            setInstitutions(formattedInstitutions);
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
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                institution.is_embargoed ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    institution.is_embargoed ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      institution.is_embargoed ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {institution.is_embargoed ? '🛡️' : index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {institution.name || institution.customer_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      {institution.country && (
                        <div className="flex items-center gap-1">
                          <GlobeAltIcon className="h-4 w-4" />
                          {institution.country} {institution.city && `• ${institution.city}`}
                        </div>
                      )}
                      {institution.is_embargoed && (
                        <span className="text-orange-600 text-xs">Embargoed</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {institution.reads || institution.read_count || institution.total_reads || 0} reads
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}