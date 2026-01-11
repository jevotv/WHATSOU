import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - WhatSou',
    description: 'Privacy Policy for WhatSou mobile application and services.',
};

export default function PrivacyPolicyPage() {
    const effectiveDate = 'January 5, 2026';
    const contactEmail = 'jevotv@gmail.com';
    const appName = 'WhatSou';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Effective Date: {effectiveDate}</p>

                <div className="prose prose-green max-w-none">
                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to {appName}. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy explains how we collect, use, disclose, and safeguard your information when you
                            use our mobile application and related services.
                        </p>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            Please read this privacy policy carefully. By using {appName}, you agree to the collection and use
                            of information in accordance with this policy.
                        </p>
                    </section>

                    {/* Developer Information */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Developer Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            <strong>App Name:</strong> {appName}<br />
                            <strong>Developer:</strong> JevoTV<br />
                            <strong>Contact Email:</strong>{' '}
                            <a href={`mailto:${contactEmail}`} className="text-green-600 hover:underline">
                                {contactEmail}
                            </a>
                        </p>
                    </section>

                    {/* Permissions */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">App Permissions</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {appName} may request the following permissions to provide its core functionality:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>
                                <strong>Camera:</strong> To capture product photos for your store catalog.
                            </li>
                            <li>
                                <strong>Location (Approximate/Precise):</strong> To help customers find your store and enable
                                delivery services.
                            </li>
                            <li>
                                <strong>Push Notifications:</strong> To notify you of new orders and important updates.
                            </li>
                            <li>
                                <strong>Biometric Authentication:</strong> Optional security feature to protect your dashboard
                                access.
                            </li>
                            <li>
                                <strong>Internet Access:</strong> Required for app functionality and data synchronization.
                            </li>
                        </ul>
                    </section>

                    {/* Data Collection */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We collect the following types of information:
                        </p>

                        <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Personal Information</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Phone number (for account registration and login)</li>
                            <li>Store name and business information</li>
                            <li>Email address (optional, for communications)</li>
                            <li>WhatsApp number (for order notifications)</li>
                            <li>Location data (store address and coordinates)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Usage Data</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Device information (device type, operating system)</li>
                            <li>App usage statistics</li>
                            <li>Order and transaction data</li>
                            <li>Product catalog information</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Media</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Product images you upload</li>
                            <li>Store logo and branding images</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We use the information we collect for the following purposes:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>
                                <strong>App Functionality:</strong> To provide and maintain our service, including order
                                management and store operations.
                            </li>
                            <li>
                                <strong>Communications:</strong> To send you order notifications, updates, and support messages.
                            </li>
                            <li>
                                <strong>Analytics:</strong> To understand how users interact with our app and improve our services.
                            </li>
                            <li>
                                <strong>Security:</strong> To protect against fraud, unauthorized access, and other security issues.
                            </li>
                            <li>
                                <strong>Legal Compliance:</strong> To comply with applicable laws and regulations.
                            </li>
                        </ul>
                    </section>

                    {/* Third-Party Sharing */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Third-Party Services</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We may share your information with the following third-party services:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>
                                <strong>Supabase:</strong> Our backend provider for data storage and authentication.
                            </li>
                            <li>
                                <strong>Firebase Cloud Messaging:</strong> For push notification delivery.
                            </li>
                            <li>
                                <strong>Paymob:</strong> For payment processing (when applicable).
                            </li>
                            <li>
                                <strong>WhatsApp:</strong> For order notifications to your business number.
                            </li>
                            <li>
                                <strong>Vercel:</strong> Our hosting provider.
                            </li>
                        </ul>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Retention</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We retain your personal data only for as long as necessary to provide our services and fulfill
                            the purposes described in this policy. Specifically:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                            <li>
                                <strong>Account Data:</strong> Retained while your account is active and for up to 30 days
                                after deletion request.
                            </li>
                            <li>
                                <strong>Order Data:</strong> Retained for 2 years for business records and legal compliance.
                            </li>
                            <li>
                                <strong>Analytics Data:</strong> Retained in anonymized form indefinitely.
                            </li>
                        </ul>
                    </section>

                    {/* Account Deletion - Google Play Required Section */}
                    <section id="delete-account" className="mb-8 bg-red-50 rounded-xl p-6 border border-red-100">
                        <h2 className="text-xl font-semibold text-red-800 mb-4">Account Deletion</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You have the right to delete your account and all associated data at any time.
                        </p>

                        <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">How to Delete Your Account</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>
                                <strong>From the App:</strong> Open {appName} → Go to Settings → Tap &quot;Delete Account&quot;
                            </li>
                            <li>
                                <strong>From the Website:</strong> Visit{' '}
                                <a href="https://www.whatsou.com/dashboard/settings" className="text-green-600 hover:underline">
                                    www.whatsou.com/dashboard/settings
                                </a>{' '}
                                → Log in → Click &quot;Delete Account&quot;
                            </li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-700 mt-6 mb-2">What Gets Deleted</h3>
                        <p className="text-gray-600 leading-relaxed mb-2">
                            When you delete your account, the following data will be <strong>permanently removed</strong>:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>Your store and all its settings</li>
                            <li>All products in your catalog</li>
                            <li>Order history and customer data</li>
                            <li>All uploaded photos (product images, store logo)</li>
                            <li>Your login credentials and account information</li>
                            <li>Subscription and payment history</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-700 mt-6 mb-2">Alternative Method</h3>
                        <p className="text-gray-600 leading-relaxed">
                            If you are unable to access the app or website, you can request account deletion by email.
                            Send an email to{' '}
                            <a href={`mailto:${contactEmail}?subject=Account%20Deletion%20Request`} className="text-green-600 hover:underline">
                                {contactEmail}
                            </a>{' '}
                            with the subject &quot;Account Deletion Request&quot; and include the phone number associated with your account.
                            We will process your request within 30 days.
                        </p>
                    </section>

                    {/* Security */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Security</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your personal data,
                            including:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                            <li>Encryption of data in transit (HTTPS/TLS)</li>
                            <li>Secure password hashing</li>
                            <li>Optional biometric authentication</li>
                            <li>Regular security audits</li>
                            <li>Access controls and authentication</li>
                        </ul>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Children&apos;s Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {appName} is not intended for use by children under the age of 13. We do not knowingly collect
                            personal information from children under 13. If you are a parent or guardian and believe your
                            child has provided us with personal information, please contact us at{' '}
                            <a href={`mailto:${contactEmail}`} className="text-green-600 hover:underline">
                                {contactEmail}
                            </a>
                            .
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Depending on your location, you may have the following rights regarding your personal data:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>
                                <strong>Access:</strong> Request a copy of your personal data.
                            </li>
                            <li>
                                <strong>Correction:</strong> Request correction of inaccurate data.
                            </li>
                            <li>
                                <strong>Deletion:</strong> Request deletion of your data.
                            </li>
                            <li>
                                <strong>Portability:</strong> Request transfer of your data to another service.
                            </li>
                            <li>
                                <strong>Opt-out:</strong> Opt out of marketing communications.
                            </li>
                        </ul>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            To exercise any of these rights, please contact us at{' '}
                            <a href={`mailto:${contactEmail}`} className="text-green-600 hover:underline">
                                {contactEmail}
                            </a>
                            .
                        </p>
                    </section>

                    {/* Links to Other Sites */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Links to Other Websites</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our app may contain links to third-party websites or services that are not operated by us.
                            We have no control over and assume no responsibility for the content, privacy policies, or
                            practices of any third-party sites or services. We encourage you to review the privacy
                            policies of these third-party sites.
                        </p>
                    </section>

                    {/* Policy Updates */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Changes to This Privacy Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any changes by
                            posting the new privacy policy on this page and updating the "Effective Date" at the top.
                            You are advised to review this privacy policy periodically for any changes.
                        </p>
                    </section>

                    {/* Contact Us */}
                    <section className="mb-8 bg-green-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="mt-4 space-y-2">
                            <p className="text-gray-700">
                                <strong>Email:</strong>{' '}
                                <a href={`mailto:${contactEmail}`} className="text-green-600 hover:underline">
                                    {contactEmail}
                                </a>
                            </p>
                            <p className="text-gray-700">
                                <strong>App:</strong> {appName}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} {appName}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
