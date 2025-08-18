import dynamic from 'next/dynamic';

// Dynamically import the test component to avoid SSR issues with pdf.js
const PDFTestComponent = dynamic(
  () => import('@/components/test/PDFTestComponent').then(mod => ({ default: mod.PDFTestComponent })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20C997] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF test component...</p>
        </div>
      </div>
    )
  }
);

export default function PDFTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PDFTestComponent />
    </div>
  );
}
