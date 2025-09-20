import DataAvailabilityGrid from "./DataAvailabilityGrid";
import QuickStatsBar from "./QuickStatsBar";

export default function CompanyHeader({ companyData, ticker }) {
  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.company_data?.name ||
      companyData.data?.company_profile?.name ||
      ticker
    );
  };

  const getExchange = () => {
    return (
      companyData.exchange ||
      companyData.company_data?.exchange ||
      companyData.data?.company_profile?.exchange ||
      "N/A"
    );
  };

  const getCurrency = () => {
    return (
      companyData.currency ||
      companyData.company_data?.currency ||
      companyData.data?.company_profile?.currency ||
      "USD"
    );
  };

  const getIndustry = () => {
    return (
      companyData.industry ||
      companyData.company_data?.industry ||
      companyData.data?.company_profile?.industry ||
      "N/A"
    );
  };

  const getSector = () => {
    return (
      companyData.sector ||
      companyData.company_data?.sector ||
      companyData.data?.company_profile?.sector ||
      "N/A"
    );
  };

  const getDescription = () => {
    return (
      companyData.company_data?.description ||
      companyData.data?.company_profile?.description ||
      null
    );
  };

  const getCEO = () => {
    return (
      companyData.company_data?.ceo ||
      companyData.data?.company_profile?.ceo ||
      null
    );
  };

  const getWebsite = () => {
    return (
      companyData.company_data?.website_url ||
      companyData.data?.company_profile?.website_url ||
      null
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
              {getCEO() && (
                <div className="flex items-center gap-3">
                  <span className="text-base">👤 CEO</span>
                  <span className="text-base font-medium">{getCEO()}</span>
                </div>
              )}
              {getWebsite() && (
                <div className="flex items-center gap-3">
                  <span className="text-base">🌐 Website</span>
                  <a
                    href={getWebsite()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-blue-200 hover:text-white underline"
                  >
                    {getWebsite().replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Company Description */}
            {getDescription() && (
              <div className="mt-6 text-blue-100">
                <p className="text-sm leading-relaxed max-w-4xl">
                  {getDescription()}
                </p>
              </div>
            )}
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
