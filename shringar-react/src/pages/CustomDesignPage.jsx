import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomDesignsService } from '../services/customDesigns';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, Upload, CheckCircle2, Clock, Calendar, 
  CreditCard, ArrowRight, ShieldCheck, DollarSign, Image, Heart, AlertCircle, X
} from 'lucide-react';

export default function CustomDesignPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'my-requests'
  const [requests, setRequests] = useState([]);

  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'drive' | 'url'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bridal',
    coverage: 'Full Hand (Elbow)',
    description: '',
    referenceImageUrl: '/images/rajasthani-bridal.jpg',
    driveLink: '',
    eventDate: '',
    preferredTime: 'Morning (10:00 AM)',
    city: 'Delhi NCR',
    venueAddress: '',
    userName: user?.fullName || '',
    userEmail: user?.email || '',
    userPhone: '',
    estimatedBudget: ''
  });

  // Advance Payment Modal State
  const [payingRequest, setPayingRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('patron@okhdfcbank');
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadRequests = () => {
    const list = CustomDesignsService.getAll();
    if (user?.id || user?.email) {
      const userList = list.filter(
        (r) =>
          (user.id && String(r.userId) === String(user.id)) ||
          (user.email && r.userEmail?.toLowerCase() === user.email.toLowerCase())
      );
      setRequests(userList);
    } else {
      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id, user?.email]);

  useEffect(() => {
    // Listen for custom designs updates across tabs/components
    const handleUpdate = () => loadRequests();
    window.addEventListener('shringar_custom_designs_updated', handleUpdate);
    return () => window.removeEventListener('shringar_custom_designs_updated', handleUpdate);
  }, [user?.id, user?.email]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.eventDate || !formData.userEmail) {
      showError('Please provide motif title, ceremony date, and your contact email.');
      return;
    }

    try {
      const created = CustomDesignsService.create({
        ...formData,
        userId: user?.id || null,
        userName: formData.userName || user?.fullName || 'Esteemed Patron',
        userEmail: formData.userEmail || user?.email || 'patron@example.com',
      });
      showSuccess(`Custom motif request #${created.id} submitted for master artist review!`);
      setActiveTab('my-requests');
      loadRequests();
    } catch (err) {
      console.error('Failed to submit custom design:', err);
      showError('Failed to record custom request.');
    }
  };

  const handlePayAdvance = async (e) => {
    e.preventDefault();
    if (!payingRequest) return;

    setProcessingPayment(true);
    try {
      await new Promise((res) => setTimeout(res, 1200)); // Smooth payment processing UX
      CustomDesignsService.payAdvanceAndConfirm(payingRequest.id, {
        method: paymentMethod,
        paymentId: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
      });

      showSuccess(`Advance of ₹${payingRequest.advanceRequired} paid successfully! Your custom ceremony appointment is confirmed.`);
      setPayingRequest(null);
      loadRequests();
    } catch (err) {
      console.error('Advance payment failed:', err);
      showError('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-brand-gold/30">
          <div className="absolute right-0 top-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-wider border border-brand-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Bridal Haute Couture
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">
              Bespoke Custom Mehendi Commission
            </h1>
            <p className="text-brand-cream/80 text-sm sm:text-base leading-relaxed">
              Have a specific couple portrait, heirloom motif, or Pinterest vision? Submit your design reference. Once our master artist and curator approve it with a custom quote, you can pay the advance token to guarantee your appointment slot.
            </p>
          </div>
        </div>

        {/* 4-Step Process Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-maroon/10 text-brand-maroon font-serif font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-brand-maroon">Upload Reference</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Share image link & customization requirements.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-maroon/10 text-brand-maroon font-serif font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-brand-maroon">Artist & Admin Review</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Lead artisan reviews feasibility and issues a quote.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-maroon font-serif font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-brand-maroon">Pay Advance Token</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Upon approval, pay the advance to confirm the slot.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-serif font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-brand-maroon">Ceremony Arrival</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Artist arrives with custom stencils & mehendi cones as per your preference.</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 gap-8">
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative ${
              activeTab === 'request'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Submit New Custom Design
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative ${
              activeTab === 'my-requests'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            My Custom Requests & Approvals ({requests.length})
          </button>
        </div>

        {/* Tab 1: Submit Form */}
        {activeTab === 'request' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="font-serif text-2xl font-bold text-brand-maroon">
                  Bespoke Design Commission Form
                </h2>
                <p className="text-stone-500 text-xs mt-1">
                  Provide reference imagery and event details so our senior artists can prepare your personalized quote.
                </p>
              </div>

              {/* Reference Image Input & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                      Motif Title / Concept Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Royal Marwari Jaal with Miniature Bride Portrait"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    />
                  </div>

                  {/* Reference Image / File / Google Drive Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase text-stone-700">
                        Reference Motif / Inspiration *
                      </label>
                      <div className="flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setUploadMode('file')}
                          className={`px-2.5 py-1 rounded-md transition ${uploadMode === 'file' ? 'bg-white shadow text-[#4A2511]' : 'text-stone-600'}`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('drive')}
                          className={`px-2.5 py-1 rounded-md transition ${uploadMode === 'drive' ? 'bg-white shadow text-[#4A2511]' : 'text-stone-600'}`}
                        >
                          Google Drive
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('url')}
                          className={`px-2.5 py-1 rounded-md transition ${uploadMode === 'url' ? 'bg-white shadow text-[#4A2511]' : 'text-stone-600'}`}
                        >
                          URL / Presets
                        </button>
                      </div>
                    </div>

                    {uploadMode === 'file' && (
                      <div className="border-2 border-dashed border-stone-300 hover:border-brand-gold rounded-xl p-4 text-center bg-stone-50/70 hover:bg-amber-50/20 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setFormData({ ...formData, referenceImageUrl: ev.target.result });
                                showSuccess?.('Reference photo attached!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center gap-1.5 py-2">
                          <Upload className="w-5 h-5 text-brand-maroon" />
                          <span className="text-xs font-bold text-stone-800">
                            Click to upload your sketch or photo (No photo size limit)
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Supports high-res PNG, JPG, WEBP, Pinterest pins
                          </span>
                        </div>
                      </div>
                    )}

                    {uploadMode === 'drive' && (
                      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 space-y-1.5">
                        <span className="text-xs font-bold text-[#4A2511] block">
                          Paste Google Drive / Cloud Link
                        </span>
                        <input
                          type="url"
                          value={formData.driveLink || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ 
                              ...formData, 
                              driveLink: val,
                              // If valid URL or drive link, keep referenceImageUrl populated for review
                              referenceImageUrl: formData.referenceImageUrl || '/images/rajasthani-bridal.jpg'
                            });
                          }}
                          placeholder="https://drive.google.com/drive/folders/... or shared file link"
                          className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none bg-white"
                        />
                        <p className="text-[11px] text-stone-500 italic">
                          Ensure link is set to "Anyone with the link can view". Our master artist will review the full folder!
                        </p>
                      </div>
                    )}

                    {uploadMode === 'url' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={formData.referenceImageUrl}
                          onChange={(e) => setFormData({ ...formData, referenceImageUrl: e.target.value })}
                          placeholder="https://example.com/mehendi-pin.jpg or /images/..."
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[11px] text-stone-400 self-center">Presets:</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, referenceImageUrl: '/images/rajasthani-bridal.jpg' })}
                            className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 text-stone-700"
                          >
                            Rajasthani Bridal
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, referenceImageUrl: '/images/peacock-feet.png' })}
                            className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 text-stone-700"
                          >
                            Peacock Feet
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, referenceImageUrl: '/images/floral-minimal.jpg' })}
                            className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 text-stone-700"
                          >
                            Floral Minimal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                        Style / Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-brand-gold outline-none"
                      >
                        <option value="Bridal">Bridal & Portrait</option>
                        <option value="Arabic">Arabic & Floral</option>
                        <option value="Minimal">Minimalist Chic</option>
                        <option value="Fusion">Indo-Western Fusion</option>
                        <option value="Mughal">Mughal Architecture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                        Hand / Foot Coverage
                      </label>
                      <select
                        value={formData.coverage}
                        onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-brand-gold outline-none"
                      >
                        <option value="Palm & Wrist">Palm & Wrist (Both sides)</option>
                        <option value="Full Hand (Elbow)">Full Hand up to Elbow</option>
                        <option value="Both Feet & Ankle">Both Feet & Ankle</option>
                        <option value="Full Bridal (Both Hands + Feet)">Full Bridal (Both Hands + Feet)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Reference Preview Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-stone-500 block">Reference Preview</span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 border border-stone-300">
                    <img
                      src={formData.referenceImageUrl}
                      alt="Custom Reference"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/rajasthani-bridal.jpg';
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 italic">This image will be reviewed by our lead artist</p>
                </div>
              </div>

              {/* Customization Details */}
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                  Customization Instructions & Special Elements
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Include groom initials 'R & M', Radha-Krishna silhouette, elephant procession, or specific mantra on wrist..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                />
              </div>

              {/* Ceremony Date, Time, City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Ceremony Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-brand-gold outline-none"
                  >
                    <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 9:00 PM)">Evening (5:00 PM - 9:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Ceremony City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Patron Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                  Venue / Hotel Address
                </label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  placeholder="e.g. Banquet Hall, Taj West End, Race Course Rd, Bangalore"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-sm hover:bg-brand-maroon-dark transition shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Submit for Artist Review & Quote
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: My Custom Requests List */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
                <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No Custom Requests Yet</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  Submit a custom design reference to receive bespoke quotes from our Master Henna Artisans.
                </p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="mt-4 px-6 py-2 bg-brand-maroon text-brand-gold rounded-full font-serif text-xs font-bold"
                >
                  Create Custom Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
                  >
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                      <img
                        src={req.referenceImageUrl || '/images/rajasthani-bridal.jpg'}
                        alt={req.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/rajasthani-bridal.jpg';
                        }}
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold uppercase">
                        {req.category}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-maroon">#{req.id}</span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-600 font-semibold">{req.coverage}</span>
                        </div>

                        {/* Status Chip */}
                        {req.status === 'PENDING_APPROVAL' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            Under Review by Master Artist
                          </span>
                        )}
                        {req.status === 'APPROVED_AWAITING_ADVANCE' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-gold/30 text-brand-maroon border border-brand-gold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                            Approved! Advance Required
                          </span>
                        )}
                        {req.status === 'BOOKED_CONFIRMED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Appointment Confirmed (Advance Paid)
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                            Declined
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-brand-maroon">{req.title}</h3>
                      <p className="text-stone-600 text-xs leading-relaxed">{req.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600 pt-2 border-t border-stone-100">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Ceremony Date</span>
                          <span className="font-medium text-stone-800">{req.eventDate} ({req.preferredTime})</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Venue & City</span>
                          <span className="font-medium text-stone-800">{req.city}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Client</span>
                          <span className="font-medium text-stone-800">{req.userName}</span>
                        </div>
                      </div>

                      {/* Quoted Pricing Box when Approved */}
                      {req.status === 'APPROVED_AWAITING_ADVANCE' && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mt-3 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-brand-gold" />
                                Artist Quote Approved: {req.artistAssigned || 'Master Henna Artisan'}
                              </p>
                              <p className="text-stone-600 text-xs mt-1 italic">
                                "{req.adminNotes || 'Custom motif approved with high-pigment Rajasthani henna.'}"
                              </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Quoted</span>
                                <span className="text-base font-bold text-stone-800">₹{req.quotedPrice}</span>
                              </div>
                              <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-amber-300">
                                <span className="text-[10px] uppercase font-bold text-brand-maroon block">Advance Token</span>
                                <span className="text-lg font-bold text-brand-maroon">₹{req.advanceRequired}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setPayingRequest(req)}
                              className="px-6 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow-md flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay Advance (₹{req.advanceRequired}) & Lock Appointment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Confirmed Details */}
                      {req.status === 'BOOKED_CONFIRMED' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mt-3 flex items-center justify-between">
                          <div className="text-xs text-emerald-900">
                            <p className="font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Ceremony Slot Confirmed with {req.artistAssigned}
                            </p>
                            <p className="mt-0.5 text-stone-600">
                              Advance paid: ₹{req.advanceRequired}. Remaining balance of ₹{(req.quotedPrice || 0) - (req.advanceRequired || 0)} payable upon ceremony completion.
                            </p>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-800 px-3 py-1 rounded bg-emerald-100">
                            {req.paymentId || 'PAID'}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Advance Payment Modal */}
      {payingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-stone-200 space-y-6 relative animate-scale-in">
            <button
              onClick={() => setPayingRequest(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-maroon px-3 py-1 rounded-full">
                Advance Token Payment
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-maroon">
                Confirm Ceremony Appointment
              </h3>
              <p className="text-stone-500 text-xs">
                To reserve {payingRequest.artistAssigned || 'the master artist'} for {payingRequest.eventDate}, pay the 25% advance token now.
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Custom Motif:</span>
                <span className="font-semibold text-stone-900 truncate max-w-[200px]">{payingRequest.title}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total Quoted Ceremony Fee:</span>
                <span className="font-semibold text-stone-900">₹{payingRequest.quotedPrice}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-brand-maroon">
                <span>Advance Payable Now:</span>
                <span className="text-base text-brand-maroon">₹{payingRequest.advanceRequired}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Balance at Ceremony Completion:</span>
                <span>₹{(payingRequest.quotedPrice || 0) - (payingRequest.advanceRequired || 0)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handlePayAdvance} className="space-y-4">
              <label className="block text-xs font-semibold uppercase text-stone-700">
                Select Payment Mode
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-maroon bg-brand-maroon/5 text-brand-maroon ring-2 ring-brand-maroon/20'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-maroon bg-brand-maroon/5 text-brand-maroon ring-2 ring-brand-maroon/20'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-brand-maroon bg-brand-maroon/5 text-brand-maroon ring-2 ring-brand-maroon/20'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Enter VPA / UPI ID (GPay / PhonePe / Paytm)
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="yourname@okhdfcbank"
                  />
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Card Number (4532 •••• •••• ••••)"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs"
                    defaultValue="4532 9988 1122 3344"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="px-4 py-2 rounded-xl border border-stone-300 text-xs"
                      defaultValue="12/28"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      className="px-4 py-2 rounded-xl border border-stone-300 text-xs"
                      defaultValue="888"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-sm hover:bg-brand-maroon-dark transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {processingPayment
                    ? 'Confirming Secure Advance...'
                    : `Authorize Advance ₹${payingRequest.advanceRequired} & Book`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
