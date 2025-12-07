import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Flashclip        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your application        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/videos"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Videos
          </Link>
          <Link
            to="/devices"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Devices
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Video Management</h3>
          <p className="text-gray-600">
            Upload, organize, and manage your video library with ease.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Device Control</h3>
          <p className="text-gray-600">
            Monitor and control your devices from a centralized dashboard.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
          <p className="text-gray-600">
            Get instant updates on video processing and device status.
          </p>
        </div>
      </div>
    </div>
  );
}
