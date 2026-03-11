export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full mx-6 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          No worries! You can try again whenever you&apos;re ready.
        </p>

        <div className="space-y-3">
          <a
            href="/domains"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </a>
          <a
            href="/"
            className="block w-full py-3 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Still have questions? Contact us at support@pagecraft.io
        </p>
      </div>
    </div>
  );
}
