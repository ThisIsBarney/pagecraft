export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full mx-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Pro!</h1>
        <p className="text-gray-600 mb-6">
          Your payment was successful. Your custom domain will be activated shortly.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-green-900 mb-2">Next Steps:</h3>
          <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
            <li>Add CNAME record in your DNS provider</li>
            <li>Wait 5-10 minutes for propagation</li>
            <li>Your site will be live!</li>
          </ol>
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          <a
            href="/domains"
            className="block w-full py-3 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Manage Domains
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Session ID: {searchParams.session_id}
        </p>
      </div>
    </div>
  );
}
