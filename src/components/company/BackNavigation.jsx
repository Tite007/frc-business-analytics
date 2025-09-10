import Link from "next/link";

export default function BackNavigation() {
  return (
    <div className="mb-8">
      <Link
        href="/companies"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
      >
        ← Back to Companies
      </Link>
    </div>
  );
}
