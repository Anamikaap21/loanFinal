import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Building2 
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function WebsiteManagement() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    tagline: 'Your Loan. One Guided Route.',
    heroTitle: 'REALCRED TECHNOLOGY PRIVATE LIMITED',
    heroSubheading: 'A Single Point of Contact for Your Loan Requirements.',
    phone1: '+91 92892 23377',
    phone2: '+91 92892 23378',
    email1: 'contact@realcred.in',
    email2: 'info@realcred.in',
    fullAddress: 'D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India',
    visionText: '',
    missionText: '',
    commitmentText: '',
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await adminService.getWebsiteContent();
      if (res.status === 'success' && res.data) {
        setContent(res.data);
        setFormData({
          tagline: res.data.tagline || 'Your Loan. One Guided Route.',
          heroTitle: res.data.hero?.heading || 'REALCRED TECHNOLOGY PRIVATE LIMITED',
          heroSubheading: res.data.hero?.subheading || 'A Single Point of Contact for Your Loan Requirements.',
          phone1: res.data.contact_info?.primaryPhone || '+91 92892 23377',
          phone2: res.data.contact_info?.secondaryPhone || '+91 92892 23378',
          email1: res.data.contact_info?.primaryEmail || 'contact@realcred.in',
          email2: res.data.contact_info?.supportEmail || 'info@realcred.in',
          fullAddress: res.data.contact_info?.officeAddress || 'D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India',
          visionText: res.data.vision_mission?.vision || '',
          missionText: res.data.vision_mission?.mission || '',
          commitmentText: res.data.commitment?.statement || '',
        });
      }
    } catch (err) {
      console.error('Failed to load CMS content:', err);
      setError('Unable to fetch CMS content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        tagline: formData.tagline.trim(),
        hero: {
          ...content?.hero,
          heading: formData.heroTitle.trim(),
          subheading: formData.heroSubheading.trim(),
        },
        contact_info: {
          ...content?.contact_info,
          primaryPhone: formData.phone1.trim(),
          secondaryPhone: formData.phone2.trim(),
          primaryEmail: formData.email1.trim().toLowerCase(),
          supportEmail: formData.email2.trim().toLowerCase(),
          officeAddress: formData.fullAddress.trim(),
        },
        vision_mission: {
          ...content?.vision_mission,
          vision: formData.visionText.trim() || content?.vision_mission?.vision,
          mission: formData.missionText.trim() || content?.vision_mission?.mission,
        },
        commitment: {
          ...content?.commitment,
          statement: formData.commitmentText.trim() || content?.commitment?.statement,
        },
      };

      await adminService.updateWebsiteContent(payload);
      setSuccess('Website CMS content updated and synchronized across all portals successfully!');
    } catch (err) {
      console.error('Failed to save website content:', err);
      setError('Error updating CMS content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-grey font-medium">Loading CMS configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>RealCred Dynamic CMS Controller</span>
        </div>
        <h2 className="text-2xl font-black text-white">Website Management (CMS)</h2>
        <p className="text-xs text-brand-grey">
          Update public homepage headlines, company tagline, official contact numbers, corporate address, and corporate vision statements in real-time.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Hero Identity */}
        <div className="bg-brand-dark rounded-3xl border border-brand-border/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-red" />
            Brand Tagline & Hero Banners
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Official Company Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Homepage Hero Heading
              </label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Homepage Subheading
              </label>
              <input
                type="text"
                name="heroSubheading"
                value={formData.heroSubheading}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
          </div>
        </div>

        {/* Official Contact Coordinates */}
        <div className="bg-brand-dark rounded-3xl border border-brand-border/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-red" />
            Corporate Communications & Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Primary Helpline
              </label>
              <input
                type="text"
                name="phone1"
                value={formData.phone1}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Secondary Helpline
              </label>
              <input
                type="text"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                name="email1"
                value={formData.email1}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Support Desk Email
              </label>
              <input
                type="email"
                name="email2"
                value={formData.email2}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Headquarters Address (Rendered in Navbar, Footer, and Contact Page)
              </label>
              <textarea
                rows={2}
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving CMS Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Updates to Website</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
