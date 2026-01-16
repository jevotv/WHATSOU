'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-6">Could not find requested resource</p>
                <Link
                    href="/dashboard"
                    className="inline-block bg-[#008069] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#017561] transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
