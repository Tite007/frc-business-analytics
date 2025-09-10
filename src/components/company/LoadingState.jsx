export default function LoadingState({ ticker }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Loading {ticker} data...
        </h2>
        <p className="text-gray-500 mt-2">
          Please wait while we fetch the company information.
        </p>
      </div>
    </div>
  );
}
