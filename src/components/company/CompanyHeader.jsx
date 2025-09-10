import DataAvailabilityGrid from "./DataAvailabilityGrid";
import QuickStatsBar from "./QuickStatsBar";

export default function CompanyHeader({ companyData, ticker }) {
  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.data?.company_profile?.name ||
      companyData.company_data?.name ||
      ticker
    );
  };

  const getExchange = () => {
    return (
      companyData.exchange ||
      companyData.data?.company_profile?.exchange ||
      "N/A"
    );
  };

  const getCurrency = () => {
    return (
      companyData.currency ||
      companyData.data?.company_profile?.currency ||
      "USD"
    );
  };

  const getIndustry = () => {
    return (
      companyData.data?.company_profile?.industry ||
      companyData.industry ||
      companyData.company_data?.industry ||
      "N/A"
    );
  };

  const getSector = () => {
    return (
      companyData.data?.company_profile?.sector ||
      companyData.sector ||
      companyData.company_data?.sector ||
      "N/A"
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl mb-10">
      <div className="p-8 lg:p-12 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Company Info */}
          <div className="mb-8 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {getCompanyName()}{" "}
              <span className="text-blue-200">({ticker})</span>
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-5 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full text-sm font-medium">
                {getExchange()}
              </span>
              <span className="px-5 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full text-sm font-medium">
                {getCurrency()}
              </span>
              <span className="px-5 py-3 bg-emerald-500 text-white rounded-full text-sm font-bold">
                ✓ FRC Covered
              </span>
            </div>

            {/* Industry & Sector Info */}
            <div className="flex flex-wrap items-center gap-8 text-blue-100">
              <div className="flex items-center gap-3">
                <span className="text-base">🏭 Industry</span>
                <span className="text-base font-medium">{getIndustry()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base">🏢 Sector</span>
                <span className="text-base font-medium">{getSector()}</span>
              </div>
            </div>
          </div>

          {/* Data Availability Grid */}
          <DataAvailabilityGrid companyData={companyData} />
        </div>
      </div>

      {/* Quick Stats Bar */}
      <QuickStatsBar companyData={companyData} />
    </div>
  );
}
