export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6f2ff] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-[#3366ff] mb-4">Thank You!</h1>
        <p className="text-gray-700 mb-2">
          Your demo class request has been received.
        </p>
        <p className="text-gray-600">
          We&rsquo;ll be in touch soon to confirm your demo class details.
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-[#3366ff] text-white rounded-lg hover:bg-[#294bb5] transition-colors font-semibold"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
