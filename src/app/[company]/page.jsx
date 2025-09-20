"use client";

import { useParams } from "next/navigation";
import { useCompanyData } from "@/hooks/useCompanyData";
import LoadingState from "@/components/company/LoadingState";
import ErrorState from "@/components/company/ErrorState";
import BackNavigation from "@/components/company/BackNavigation";
import CompanyHeader from "@/components/company/CompanyHeader";
import ContentSections from "@/components/company/ContentSections";
import PDFExportButton from "@/components/company/PDFExportButton";

export default function CompanyPage() {     
  const params = useParams();
  const ticker = params?.company?.toUpperCase();

  const { loading, error, companyData, chartData, metricsData, analysisData } =
    useCompanyData(ticker);

  // Loading state
  if (loading) {
    return <LoadingState ticker={ticker} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} ticker={ticker} />;
  }

  // No company data
  if (!companyData) {
    return <ErrorState ticker={ticker} />;
  }

  return (
    <div className="min-h-screen">
      <div className="xl:container mx-auto max-w-7xl">
        <BackNavigation />
        <CompanyHeader companyData={companyData} ticker={ticker} />

        {/* PDF Export Button - Improved positioning */}
        <div className="px-4 lg:px-6 -mt-6 mb-6 relative z-10">
          <div className="flex justify-end">
            <PDFExportButton
              companyData={companyData}
              chartData={chartData}
              metricsData={metricsData}
              analysisData={analysisData}
              bloombergData={null}
              ticker={ticker}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex items-center gap-2"
              data-pdf-export
            />
          </div>
        </div>

        <ContentSections
          chartData={chartData}
          metricsData={metricsData}
          analysisData={analysisData}
          companyData={companyData}
          ticker={ticker}
        />
      </div>
    </div>
  );
}
