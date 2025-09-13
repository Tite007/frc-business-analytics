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
        
        {/* Export Button - Positioned at top right */}
        <div className="flex justify-end mb-4">
          <PDFExportButton 
            companyData={companyData}
            chartData={chartData}
            metricsData={metricsData}
            analysisData={analysisData}
            ticker={ticker}
            className="shadow-lg"
          />
        </div>
        
        <CompanyHeader companyData={companyData} ticker={ticker} />
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
