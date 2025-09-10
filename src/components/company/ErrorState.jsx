import Link from "next/link";

function CMSRedirectError({ error }) {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center py-16">
        <div className="text-blue-500 text-6xl mb-4">🔄</div>
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Redirecting to CMS
        </h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/cms"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to CMS Now
          </Link>
          <Link
            href="/companies"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Browse Companies
          </Link>
        </div>
      </div>
    </div>
  );
}

function PDFOnlyError({ error, ticker }) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Companies
        </Link>
      </div>
      <div className="text-center py-16">
        <div className="text-amber-500 text-6xl mb-4">📄</div>
        <h1 className="text-3xl font-bold text-amber-600 mb-4">
          PDF Reports Available
        </h1>
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error.company.company_name} ({ticker})
          </h2>
          <div className="flex justify-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {error.company.exchange}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {error.company.currency}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {error.company.industry}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          This company is covered by FRC with PDF reports available. Digital
          reports and interactive features are not yet available for this
          company.
        </p>

        {error.company.has_chart && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <span>📊</span>
              <span className="text-sm font-medium">Stock data available</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            For access to PDF reports, please contact FRC directly.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/companies"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              ← Back to Companies
            </Link>
            <button
              onClick={() =>
                window.open(
                  "mailto:contact@researchfrc.com?subject=PDF Report Request for " +
                    ticker,
                  "_blank"
                )
              }
              className="bg-amber-600 text-white px-6 py-3 rounded hover:bg-amber-700"
            >
              Request PDF Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralError({ error, ticker }) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Companies
        </Link>
      </div>
      <div className="text-center py-16">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {error?.error ? "API Connection Error" : "Company Not Found"}
        </h1>
        <p className="text-gray-600 mb-4">
          {error?.error
            ? `Failed to connect to backend API: ${
                error.message || "Unknown error"
              }`
            : `${ticker} is not found or not covered by FRC analysis.`}
        </p>
        {error?.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-red-800 mb-2">
              Debug Information:
            </h3>
            <div className="text-sm text-red-700 space-y-1">
              <p>
                <strong>API Base URL:</strong> {error.baseURL}
              </p>
              <p>
                <strong>Status:</strong> {error.status}
              </p>
              <p>
                <strong>Error:</strong> {error.message}
              </p>
            </div>
          </div>
        )}
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 inline-block"
        >
          ← Back to Companies
        </Link>
      </div>
    </div>
  );
}

function NoDataError({ ticker }) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Companies
        </Link>
      </div>
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-600 mb-4">
          No Data Available
        </h1>
        <p className="text-gray-500 mb-4">
          No company data could be loaded for {ticker}.
        </p>
      </div>
    </div>
  );
}

export default function ErrorState({ error, ticker }) {
  if (error?.isCMSRedirect) {
    return <CMSRedirectError error={error} />;
  }

  if (error?.isPdfOnly && error.company) {
    return <PDFOnlyError error={error} ticker={ticker} />;
  }

  if (error) {
    return <GeneralError error={error} ticker={ticker} />;
  }

  return <NoDataError ticker={ticker} />;
}
