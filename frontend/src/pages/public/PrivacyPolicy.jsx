import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, CheckCircle, Mail, MapPin, Phone, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    { id: 'section-1', title: '1. Introduction & Acceptance of Terms' },
    { id: 'section-2', title: '2. Information We Collect' },
    { id: 'section-3', title: '3. Purpose and Use of Collected Information' },
    { id: 'section-4', title: '4. Information Sharing & Lending Partner Disclosure' },
    { id: 'section-5', title: '5. Data Security & Storage Standards' },
    { id: 'section-6', title: '6. User Data Rights & Retention Policy' },
    { id: 'section-7', title: '7. Cookies and Tracking Technologies' },
    { id: 'section-8', title: '8. Grievance Officer & Contact Information' },
  ];

  return (
    <div className="min-h-screen bg-brand-black text-brand-lightGrey py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-w-0 max-w-full">
      <div className="max-w-5xl mx-auto min-w-0">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal & Data Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base sm:text-lg text-brand-grey max-w-3xl">
            RealCred Technology Private Limited ("RealCred") is committed to protecting your personal and financial information with bank-grade security protocols and transparent privacy practices.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-brand-grey">
            <span><strong>Effective Date:</strong> January 1, 2026</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> November 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 1.0 (Official Release)</span>
          </div>
        </div>

        {/* Layout Grid: Table of Contents + Policy Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-dark/80 backdrop-blur-md rounded-2xl border border-brand-border p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-red" />
                Table of Contents
              </h3>
              <nav className="space-y-1.5 text-xs">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block py-1.5 px-2.5 rounded-lg text-brand-grey hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-brand-border">
                <p className="text-[11px] text-brand-grey leading-relaxed">
                  Need legal clarifications or have privacy inquiries?
                </p>
                <a
                  href="mailto:contact@realcred.in"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-red font-semibold hover:underline"
                >
                  <Mail className="w-3 h-3" />
                  contact@realcred.in
                </a>
              </div>
            </div>
          </div>

          {/* Main Policy Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* SECTION 1 - APPROVED VERBATIM TEXT */}
            <section id="section-1" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-brand-red font-bold text-sm mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>SECTION 1.1 — OFFICIAL POLICY STATEMENT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                1. Introduction & Acceptance of Terms
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
                <p className="p-4 rounded-xl bg-brand-black/60 border border-brand-border/60 text-white font-medium italic">
                  "RealCred Technology Private Limited (&quot;RealCred&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and ensuring the security of your personal and financial information. This Privacy Policy outlines our practices regarding the collection, use, disclosure, and protection of information when you visit our website, use our services, or interact with us.
                </p>
                <p className="p-4 rounded-xl bg-brand-black/60 border border-brand-border/60 text-white font-medium italic">
                  By accessing our website or utilizing our services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with any part of this policy, please do not access our website or use our services."
                </p>
                <p className="text-brand-grey text-xs">
                  This document constitutes an electronic record under the Information Technology Act, 2000 and the rules thereunder as applicable, and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="section-2" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                To process your loan applications, assess preliminary borrowing eligibility, and submit your requests to partnered lending institutions, RealCred collects specific customer data categories:
              </p>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Personal Identifiable Information (PII):</strong> Full Name, Date of Birth, Gender, Father’s/Spouse’s Name, Residential Address, City, State, and PIN Code.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Contact Credentials:</strong> Primary Mobile Number, Alternative Contact Number, and Personal/Work Email Address.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Financial & Income Details:</strong> Monthly Net Salary, Annual Turnover, Business Vintage, Existing Loan EMIs, Primary Bank Statements, and Salary Slips.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Statutory KYC Documentation:</strong> PAN Card, Aadhaar Card (masked per UIDAI norms), Passport, Voter ID, and Property Papers for secured facilities.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <strong className="text-white">Technical Metadata:</strong> IP address, device fingerprints, operating system type, browser user-agent, and portal timestamps for fraud-prevention audits.
                  </div>
                </li>
              </ul>
            </section>

            {/* SECTION 3 */}
            <section id="section-3" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                3. Purpose and Use of Collected Information
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                The collected data is strictly utilized to deliver authorized loan distribution services:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <h4 className="font-bold text-white mb-1.5">Credit Eligibility Matching</h4>
                  <p className="text-brand-grey leading-relaxed">
                    Analyzing applicant financial profiles against partner lending criteria (HDFC Bank, ICICI Bank, Axis Bank, SBI, etc.) to recommend optimal interest rates and tenures.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <h4 className="font-bold text-white mb-1.5">Lead Processing & Sanction</h4>
                  <p className="text-brand-grey leading-relaxed">
                    Facilitating file login, KYC verification, underwriter coordination, property appraisal, sanction issuance, and final disbursement tracking.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <h4 className="font-bold text-white mb-1.5">Customer Advisory Communication</h4>
                  <p className="text-brand-grey leading-relaxed">
                    Sending SMS/Email application milestone updates, verification reminders, callback responses, and loan status notifications.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <h4 className="font-bold text-white mb-1.5">Statutory & Anti-Fraud Compliance</h4>
                  <p className="text-brand-grey leading-relaxed">
                    Complying with Reserve Bank of India (RBI) digital lending guidelines, Prevention of Money Laundering Act (PMLA), and auditing obligations.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="section-4" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                4. Information Sharing & Lending Partner Disclosure
              </h2>
              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <p className="text-xs text-white">
                    <strong>Zero-Sale Guarantee:</strong> RealCred Technology Private Limited does not sell, rent, monetize, or trade your personal data or phone number to unauthorized third-party telemarketers or advertisers under any circumstances.
                  </p>
                </div>
                <p>
                  Your information is disclosed exclusively to:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-brand-grey">
                  <li><strong className="text-white">Partnered Banks & NBFCs:</strong> Authorized nationalized banks and NBFC partners chosen by the applicant or matched according to eligibility.</li>
                  <li><strong className="text-white">Assigned Relationship Managers:</strong> Verified RealCred loan processing executives who manage application documentation and bank liaison.</li>
                  <li><strong className="text-white">Legal & Regulatory Authorities:</strong> Governmental or judicial bodies only when mandated by valid subpoenas, court orders, or statutory Indian legal provisions.</li>
                </ol>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="section-5" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                5. Data Security & Storage Standards
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                We implement rigorous technical, operational, and physical security measures to safeguard all stored records:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <Lock className="w-5 h-5 text-brand-red mb-2" />
                  <h4 className="font-bold text-white mb-1">TLS 1.3 / SSL Encryption</h4>
                  <p className="text-brand-grey">End-to-end cryptographic transit security across all web portals and API payloads.</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <ShieldCheck className="w-5 h-5 text-brand-red mb-2" />
                  <h4 className="font-bold text-white mb-1">Role-Based Access (RBAC)</h4>
                  <p className="text-brand-grey">Multi-tiered authentication ensuring employee access is strictly restricted to assigned records.</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <MapPin className="w-5 h-5 text-brand-red mb-2" />
                  <h4 className="font-bold text-white mb-1">Indian Data Residency</h4>
                  <p className="text-brand-grey">All MongoDB databases and document repositories are maintained on secure data centers located within India.</p>
                </div>
              </div>
            </section>

            {/* SECTION 6 */}
            <section id="section-6" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                6. User Data Rights & Retention Policy
              </h2>
              <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
                <p>
                  You have the legal right to request access, correction, or deletion of your personal information stored with us, subject to statutory record-retention requirements under banking and tax laws.
                </p>
                <p className="text-xs text-brand-grey">
                  Financial records and loan documentation relating to disbursed loans are maintained for the statutory duration mandated by the Reserve Bank of India and Indian Income Tax regulations (typically up to 8 years following loan closure).
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="section-7" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Our web portals use essential session cookies to remember authentication tokens and streamline navigation across multi-step application forms. We do not use third-party invasive behavioral tracking or cross-site tracking scripts. You can configure your browser to block or alert you about these cookies, but some features of the CRM may not function properly without them.
              </p>
            </section>

            {/* SECTION 8 */}
            <section id="section-8" className="bg-brand-dark rounded-2xl border border-brand-border p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                8. Grievance Officer & Contact Information
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                In compliance with the Information Technology Act, 2000 and rules made thereunder, the details of the Grievance Officer for RealCred Technology Private Limited are provided below:
              </p>
              <div className="p-5 rounded-xl bg-brand-card border border-brand-border space-y-3 text-xs">
                <div>
                  <span className="text-brand-grey">Company Name:</span>
                  <p className="text-white font-bold text-sm">RealCred Technology Private Limited</p>
                </div>
                <div>
                  <span className="text-brand-grey">Registered Headquarters:</span>
                  <p className="text-white font-medium">D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-brand-grey">Grievance Desk Email:</span>
                    <p className="text-white font-medium">contact@realcred.in</p>
                  </div>
                  <div>
                    <span className="text-brand-grey">Helpline:</span>
                    <p className="text-white font-medium">+91 92892 23377 / +91 92892 23378</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-redHover transition-colors"
                >
                  Contact Our Grievance Desk
                </Link>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs font-semibold hover:bg-white/5 transition-colors"
                >
                  Back to RealCred Home
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
