export default function TestLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
        <p className="text-gray-600">This is a test page to verify the login route is working.</p>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline">
            Go to actual login page
          </a>
        </div>
      </div>
    </div>
  );
}
