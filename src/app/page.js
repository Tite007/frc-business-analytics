"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCompanies, getStats } from "@/lib/api";

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    usCompanies: 0,
    canadianCompanies: 0,
    companiesWithReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await getCompanies();
        if (response && response.companies) {
          const companies = response.companies;
          const us = companies.filter(
            (c) =>
              c.exchange === "NASDAQ" ||
              c.exchange === "NYSE" ||
              c.exchange === "NYSE Arca"
          );
          const canada = companies.filter(
            (c) => c.exchange === "TSX" || c.exchange === "TSXV"
          );
          const withReports = companies.filter((c) => c.reports_count > 0);

          setStats({
            totalCompanies: companies.length,
            usCompanies: us.length,
            canadianCompanies: canada.length,
            companiesWithReports: withReports.length,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Show loading while session is being loaded
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 sm:py-20 md:py-24 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 2xl:-mx-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome Message */}
            {session && (
              <div className="mb-6">
                <p className="text-lg md:text-xl text-blue-200">
                  Welcome back,{" "}
                  <span className="font-semibold text-white">
                    {session.user?.name || session.user?.email}
                  </span>
                  !
                </p>
              </div>
            )}

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              FRC Business Analytics
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Comprehensive financial analysis and insights for institutional
              investors
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              <Link
                href="/companies"
                className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                Explore Companies
              </Link>
              <Link
                href="/analysis"
                className="w-full sm:w-auto border-2 border-white text-bla px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                View Analysis
              </Link>
            </div>

            {/* Quick Stats */}
            {!loading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
                  <div className="text-3xl font-bold text-black mb-1">
                    {stats.totalCompanies}
                  </div>
                  <div className="text-sm text-blue-400 font-medium">
                    Companies Covered
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
                  <div className="text-3xl font-bold text-black mb-1">
                    {stats.usCompanies}
                  </div>
                  <div className="text-sm text-blue-400 font-medium">
                    US Markets
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
                  <div className="text-3xl font-bold text-black mb-1">
                    {stats.canadianCompanies}
                  </div>
                  <div className="text-sm text-blue-400 font-medium">
                    Canadian Markets
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-30">
                  <div className="text-3xl font-bold text-black mb-1">
                    {stats.companiesWithReports}
                  </div>
                  <div className="text-sm text-blue-400 font-medium">
                    Active Reports
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Analytics Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access comprehensive financial data, interactive charts, and
              AI-powered insights for informed investment decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Interactive Charts
              </h3>
              <p className="text-gray-600">
                Dynamic stock performance charts with advanced technical
                indicators and historical data analysis.
              </p>
              <Link
                href="/companies"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Charts →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-green-600 text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Performance Metrics
              </h3>
              <p className="text-gray-600">
                Detailed performance analysis including volume changes, price
                movements, and report impact assessments.
              </p>
              <Link
                href="/reports"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Reports →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-purple-600 text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600">
                Advanced artificial intelligence provides deep insights and
                predictive analytics for strategic decision making.
              </p>
              <Link
                href="/analysis"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Analysis →
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-orange-600 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Company Research
              </h3>
              <p className="text-gray-600">
                Comprehensive company profiles with financial data, industry
                analysis, and competitive positioning.
              </p>
              <Link
                href="/companies"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse Companies →
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-red-600 text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Research Reports
              </h3>
              <p className="text-gray-600">
                Access to institutional-grade research reports with detailed
                analysis and investment recommendations.
              </p>
              <Link
                href="/reports"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Access Reports →
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-teal-600 text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Secure Platform
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with role-based access control and
                encrypted data transmission.
              </p>
              <div className="inline-block mt-4 text-gray-500 font-medium">
                ✓ Authenticated Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Quick Access
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/companies"
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="text-blue-600 text-3xl mb-3 group-hover:scale-110 transition-transform">
                🏢
              </div>
              <div className="font-semibold text-gray-800">Companies</div>
              <div className="text-sm text-gray-600 mt-1">
                {stats.totalCompanies} Available
              </div>
            </Link>

            <Link
              href="/analysis"
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="text-green-600 text-3xl mb-3 group-hover:scale-110 transition-transform">
                📊
              </div>
              <div className="font-semibold text-gray-800">Analysis</div>
              <div className="text-sm text-gray-600 mt-1">AI Insights</div>
            </Link>

            <Link
              href="/reports"
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="text-purple-600 text-3xl mb-3 group-hover:scale-110 transition-transform">
                📋
              </div>
              <div className="font-semibold text-gray-800">Reports</div>
              <div className="text-sm text-gray-600 mt-1">Research Papers</div>
            </Link>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-gray-400 text-3xl mb-3">👤</div>
              <div className="font-semibold text-gray-800">Profile</div>
              <div className="text-sm text-gray-600 mt-1">
                {session?.user?.role || "User"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
