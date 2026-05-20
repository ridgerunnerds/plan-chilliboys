import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Chilli Boys Plan Portal',
  description: 'Privacy policy for Chilli Boys Manufacturing Plan Portal.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
      <p className="text-steel-400 text-sm mb-8">Last updated: May 19, 2025</p>

      <div className="space-y-8 text-steel-300 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. Introduction</h2>
          <p>
            Chilli Boys Manufacturing (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Plan Portal
            (the &quot;Service&quot;). This page informs you of our policies regarding the collection,
            use, and disclosure of personal data when you use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. Information We Collect</h2>
          <p className="mb-2">We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-white">Contact information:</strong> name, email address,
              phone number, and project details you provide through our quote wizard or
              registration forms.
            </li>
            <li>
              <strong className="text-white">Account information:</strong> if you create an
              account, we store your login credentials (email and password) to authenticate you.
            </li>
            <li>
              <strong className="text-white">Project data:</strong> designs, storyboards,
              descriptions, feedback messages, and quote preferences you submit.
            </li>
            <li>
              <strong className="text-white">Technical data:</strong> browser type, device
              information, and IP address collected automatically for security and performance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain our Service</li>
            <li>To respond to your project inquiries and send quotes</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To monitor and improve the security of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">4. Data Storage</h2>
          <p>
            Data is stored locally in your browser (localStorage) and on our secure servers.
            We retain your information for as long as your account is active or as needed to
            provide you services. You may request deletion of your data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">5. Sharing of Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may
            share data with trusted service providers who assist us in operating our Service,
            provided they agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">6. Security</h2>
          <p>
            The security of your data is important to us. We use commercially reasonable
            safeguards to protect your personal information. However, no method of transmission
            over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">7. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your personal data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:info@chilliboys.mx" className="text-chilliblue-400 hover:text-chilliblue-300">
              info@chilliboys.mx
            </a>{' '}
            or call +52 624-229-4158.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-steel-700">
        <Link href="/" className="text-chilliblue-400 hover:text-chilliblue-300 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
