import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Chilli Boys Plan Portal',
  description: 'Terms of service for Chilli Boys Manufacturing Plan Portal.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-steel-400 text-sm mb-8">Last updated: May 19, 2025</p>

      <div className="space-y-8 text-steel-300 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Chilli Boys Plan Portal (the "Service"), you agree to be
            bound by these Terms of Service. If you disagree with any part of the terms, you may
            not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">2. Description of Service</h2>
          <p>
            The Service provides tools for browsing our manufacturing catalog, creating project
            storyboards, submitting quote requests, and communicating with our team about custom
            metalwork and fabrication projects.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">3. User Accounts</h2>
          <p className="mb-2">
            When you create an account with us, you must provide accurate, complete, and current
            information at all times. Failure to do so constitutes a breach of the Terms, which
            may result in immediate termination of your account.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service
            and for any activities or actions under your password.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">4. Quote Requests & Projects</h2>
          <p className="mb-2">
            All quotes provided through the Service are estimates based on the information you
            provide. Final pricing may vary after an in-person assessment, material selection,
            and project scope confirmation.
          </p>
          <p>
            Submitting a project request does not constitute a binding contract. A project is
            only confirmed upon signed agreement and deposit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">5. Intellectual Property</h2>
          <p>
            All content on the Service — including text, graphics, logos, images, and software —
            is the property of Chilli Boys Manufacturing and is protected by Mexican and
            international copyright laws. You may not reproduce, distribute, or create derivative
            works without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">6. User Content</h2>
          <p>
            By uploading designs, descriptions, or other content to the Service, you grant us a
            non-exclusive, royalty-free license to use, reproduce, and modify that content solely
            for the purpose of evaluating, quoting, and completing your project.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">7. Limitation of Liability</h2>
          <p>
            In no event shall Chilli Boys Manufacturing be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or relating to your use
            of the Service. Our total liability shall not exceed the amount paid by you, if any,
            for accessing the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">8. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Mexico,
            without regard to its conflict of law provisions. Any disputes shall be resolved in
            the courts of Baja California Sur, Mexico.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide
            notice of any material changes by posting the new Terms on this page. Your continued
            use of the Service after any changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
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
