import AIAnalysis from "./company/AIAnalysis";

export default function AnalysisComponent({
  analysis,
  ticker,
  status,
  generatedDate,
}) {
  return (
    <div className="mt-4">
      <AIAnalysis
        ticker={ticker}
        analysis={analysis}
        status={status || "success"}
        generatedDate={generatedDate}
      />
    </div>
  );
}
