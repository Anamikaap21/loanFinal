import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import loanService from '../../services/loanService.js';

export default function Contact() {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    loanType: 'General Inquiry',
    preferredContactTime: 'Anytime',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loanService.requestCallback(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      setError('Unable to send inquiry. Please call us directly on 7048976349.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16 min-w-0 max-w-full">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-border/60 text-xs text-brand-grey mb-6">
          <Building2 className="w-4 h-4 text-brand-red" />
          <span>REALCRED TECHNOLOGY PRIVATE LIMITED</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Contact <span className="gradient-text-red">RealCred</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-brand-grey">
          Reach our dedicated loan relationship desk in Noida for individual loan applications and channel partnerships.
        </p>
      </div>

      {/* Office Details & Interactive Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Office Coordinates & Contact Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Corporate Office Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-brand-cardBorder space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Corporate Headquarters
            </h3>

            <div className="space-y-4 text-xs text-brand-grey">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-red/10 text-brand-red shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Corporate Address</h4>
                  <p className="leading-relaxed">
                    D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India.
                  </p>
                  <p className="text-[11px] font-mono text-brand-grey mt-1">
                    Coordinates: 28.583136, 77.318749
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Direct Phone Support</h4>
                  <div className="space-y-0.5 font-mono text-white">
                    <p><a href="tel:7048976349" className="hover:text-brand-redAccent">7048976349</a></p>
                    <p><a href="tel:8527710939" className="hover:text-brand-redAccent">8527710939</a></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Email Support</h4>
                  <div className="space-y-0.5 text-white">
                    <p><a href="mailto:info@realcred.in" className="hover:text-brand-redAccent">info@realcred.in</a></p>
                    <p><a href="mailto:customercare@realcred.in" className="hover:text-brand-redAccent">customercare@realcred.in</a></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Working Hours</h4>
                  <p>Monday - Saturday: 9:30 AM to 6:30 PM</p>
                  <p className="text-[11px] text-brand-grey">Closed on Sundays and National Holidays</p>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=28.583136,77.318749"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-brand-red/20 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Map & Contact Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Interactive Google Map Embed */}
          <div className="glass-card p-3 rounded-3xl border border-brand-cardBorder overflow-hidden shadow-2xl">
            <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-brand-black">
              <iframe
                title="RealCred Noida Corporate Office Map"
                src="https://maps.google.com/maps?q=28.583136,77.318749&hl=en&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(110%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-3 text-[11px] text-brand-grey flex justify-between items-center">
              <span>Workshala, Vyapar Marg, Block D, Noida Sector 3</span>
              <a
                href="https://maps.google.com/?q=28.583136,77.318749"
                target="_blank"
                rel="noreferrer"
                className="text-brand-redAccent font-semibold hover:underline flex items-center gap-1"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Contact / Inquiry Form */}
          <div className="glass-card p-8 rounded-3xl border border-brand-cardBorder">
            <h3 className="text-xl font-bold text-white mb-2">Send an Advisory Enquiry</h3>
            <p className="text-xs text-brand-grey mb-6">
              Leave your contact details and our credit specialist will get back to you within 2 working hours.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">Inquiry Registered Successfully!</div>
                  Our loan coordinator will call you shortly. For immediate assistance, dial 7048976349.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-1.5">
                      Loan Type of Interest
                    </label>
                    <select
                      name="loanType"
                      value={formData.loanType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
                    >
                      <option value="Home Loan">Home Loan</option>
                      <option value="Loan Against Property">Loan Against Property</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="OD – Overdraft Facility">OD – Overdraft Facility</option>
                      <option value="Channel Partner Inquiry">Channel Partner Inquiry</option>
                      <option value="Other Financial Service">Other Financial Service</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-1.5">
                    Your Message / Requirements
                  </label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide loan amount requirement or specific queries..."
                    className="w-full px-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>

                {error && (
                  <p className="text-xs text-brand-red font-semibold">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-red/25 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <span>Send Advisory Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
