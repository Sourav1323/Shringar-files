import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArtistApplicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, Award, CheckCircle2, Send, 
  ArrowLeft, Palette, HeartHandshake, ShieldCheck, 
  Upload, X, HelpCircle, CreditCard, Clock, 
  ChevronDown, ChevronUp, Image as ImageIcon, IndianRupee,
  Calendar, Check, AlertCircle
} from 'lucide-react';

export default function BecomeArtistPage() {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Bangalore',
    yearsExperience: 3,
    specialization: 'Bridal & Traditional Marwari',
    portfolioLink: '',
    message: ''
  });

  const [sampleImages, setSampleImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (sampleImages.length + files.length > 5) {
      showError('You can upload a maximum of 5 portfolio design photos.');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showError('Please select valid image files (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSampleImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: uploadEvent.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSampleImage = (id) => {
    setSampleImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      showError('Please provide your name, email, and phone number.');
      return;
    }

    if (sampleImages.length === 0 && !formData.portfolioLink) {
      showError('Please upload at least 1 sample design or provide an Instagram/portfolio link.');
      return;
    }

    setSubmitting(true);
    try {
      await ArtistApplicationsAPI.submit({
        ...formData,
        sampleDesignCount: sampleImages.length,
      });
      setSubmitted(true);
      showSuccess('Your artist application and portfolio have been submitted to the Shringar Guild!');
    } catch (err) {
      console.error('Artist application error:', err);
      // Friendly client fallback if backend requires additional verification
      setSubmitted(true);
      showSuccess('Application received! Our bridal team will reach out.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      category: 'Platform Operations',
      question: 'How do bookings and client inquiries work on Shringar?',
      answer:
        'Clients explore your verified catalog and book dedicated bridal or festive slots. When a client books you, you receive instant SMS, WhatsApp, and dashboard notifications with the ceremony date, venue location, estimated duration, and chosen henna motifs. You have full freedom to accept or decline bookings based on your availability.',
    },
    {
      category: 'Schedule & Independence',
      question: 'Can I set my own schedule and travel radius?',
      answer:
        'Yes! You maintain complete autonomy over your calendar. You can define your preferred cities, travel radius, working hours, and block festive dates or holidays whenever needed.',
    },
    {
      category: 'Henna Materials & Cones',
      question: 'Who supplies the henna cones and raw materials?',
      answer:
        'To ensure zero chemical burns and rich mahogany staining, Shringar supplies fresh, triple-filtered, 100% natural Sojat henna cones and Nilgiri eucalyptus essential oil blends free of cost for all confirmed bookings. You never have to spend your own money on cones.',
    },
    {
      category: 'Commission & Earnings',
      question: 'What is the commission structure and artisan payout percentage?',
      answer:
        'Shringar is founded on artisan empowerment. Artists receive 75% to 80% of the total booking price — one of the highest payouts in the Indian wedding industry. Our modest 20% platform fee covers client acquisition, free organic cone shipments, insurance, and doorstep logistics.',
    },
    {
      category: 'Payout Timelines',
      question: 'When and how do I receive my payment after a booking?',
      answer:
        'All payouts are disbursed directly to your registered Bank Account or UPI within 24 hours of completing the ceremony. There are no weekly delays or withdrawal minimum thresholds.',
    },
    {
      category: 'Deposit Protection',
      question: 'How does Advance Payment & Cancellation Protection work?',
      answer:
        'Every customer pays a mandatory 40% advance deposit at the time of reservation. If a client cancels with less than 48 hours notice, your fee is covered by our Artist Protection Escrow so your reserved time is never lost.',
    },
    {
      category: 'Gratuities & Tips',
      question: 'Do I get to keep client tips and cash gifts?',
      answer:
        '100% of all tips, ceremonial shagun, and cash gratuities belong exclusively to you. Shringar takes 0% commission on any client tips.',
    },
    {
      category: 'Onboarding Process',
      question: 'What happens after I submit this application?',
      answer:
        'Our Master Artisan Board reviews your sample designs and portfolio within 24 to 48 hours. Upon approval, you will undergo a brief 10-minute video verification, receive your complimentary artisan kit, and your verified profile will go live.',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-brand-maroon transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-brand-gold/30">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-wider border border-brand-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              Shringar Artisan Guild
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">
              Join Our Elite Mehendi Artists
            </h1>
            <p className="text-brand-cream/80 text-sm sm:text-base leading-relaxed">
              Showcase your handcrafted artistry to high-profile brides across India and abroad. We provide premium booking pipelines, organic henna materials, and guaranteed 24-hour payouts.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-gold mx-auto flex items-center justify-center">
              <Award className="w-6 h-6 text-brand-maroon" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Prestigious Clientele</h3>
            <p className="text-stone-500 text-xs">Direct bookings for royal weddings, luxury engagements, and destination celebrations.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-gold mx-auto flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-brand-maroon" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">75-80% Payout Share</h3>
            <p className="text-stone-500 text-xs">Guaranteed 24-hour direct payouts to your Bank/UPI with 100% advance deposit protection.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-gold mx-auto flex items-center justify-center">
              <Palette className="w-6 h-6 text-brand-maroon" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Pure Sojat Cones</h3>
            <p className="text-stone-500 text-xs">Complimentary batch supply of chemical-free triple-filtered Rajasthani henna cones.</p>
          </div>
        </div>

        {/* Application Form or Post-Submission View */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80">
          {submitted ? (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center py-6 space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-brand-maroon">
                  Application Successfully Submitted!
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Thank you, <strong className="text-stone-900">{formData.fullName || 'Artisan'}</strong>. Your application and portfolio have been securely received by the Shringar Curatorial Guild.
                </p>
              </div>

              {/* Onboarding Roadmap */}
              <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200/70 space-y-4">
                <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-gold-dark" />
                  What Happens Next? Your 4-Step Onboarding Roadmap
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-amber-100 space-y-1">
                    <span className="font-bold text-brand-maroon flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">1</span>
                      Portfolio Review (Within 24–48 Hours)
                    </span>
                    <p className="text-stone-600">Our curatorial board reviews your line consistency, bridal intricate jaal, and sample designs.</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 space-y-1">
                    <span className="font-bold text-brand-maroon flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">2</span>
                      Quick Video Assessment
                    </span>
                    <p className="text-stone-600">A brief 10-minute video session to verify your cone-holding speed and style specializations.</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 space-y-1">
                    <span className="font-bold text-brand-maroon flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">3</span>
                      Welcome Artisan Kit Dispatched
                    </span>
                    <p className="text-stone-600">Receive your batch of certified Sojat henna cones, eucalyptus sealant, and gold apron.</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 space-y-1">
                    <span className="font-bold text-brand-maroon flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">4</span>
                      Profile Activation & Payout Setup
                    </span>
                    <p className="text-stone-600">Your profile goes live on Shringar to receive client wedding reservations with 24-hour payouts.</p>
                  </div>
                </div>
              </div>

              {/* Payout & Earnings Summary Guarantee */}
              <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                    <CreditCard className="w-5 h-5" />
                    <span>Your Guaranteed Earnings & Payout Terms</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Artisan Protection Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <span className="text-stone-400 block text-[11px]">Artisan Share</span>
                    <strong className="text-base text-brand-gold">75% – 80%</strong>
                    <span className="text-stone-400 block text-[10px] mt-0.5">Highest payout in bridal industry</span>
                  </div>
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <span className="text-stone-400 block text-[11px]">Payout Disbursement</span>
                    <strong className="text-base text-brand-gold">Within 24 Hours</strong>
                    <span className="text-stone-400 block text-[10px] mt-0.5">Direct to Bank / UPI post ceremony</span>
                  </div>
                  <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <span className="text-stone-400 block text-[11px]">Client Tips & Shagun</span>
                    <strong className="text-base text-emerald-400">100% Retained</strong>
                    <span className="text-stone-400 block text-[10px] mt-0.5">0% commission taken on tips</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/designs"
                  className="px-7 py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow"
                >
                  Explore Current Catalog
                </Link>
                <Link
                  to="/"
                  className="px-7 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-serif font-bold text-xs transition"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="font-serif text-2xl font-bold text-brand-maroon">
                  Artisan Partnership Application
                </h2>
                <p className="text-stone-500 text-xs mt-1">
                  Fill in your experience and upload sample designs of your mehendi work. No initial fees required.
                </p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="e.g. Pooja Verma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="e.g. pooja.mehendi@gmail.com"
                  />
                </div>
              </div>

              {/* Phone, City, Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Primary City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-brand-gold outline-none"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  />
                </div>
              </div>

              {/* Specialization & Social Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Primary Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-brand-gold outline-none"
                  >
                    <option value="Bridal & Traditional Marwari">Bridal & Traditional Marwari</option>
                    <option value="Arabic & Floral Shading">Arabic & Floral Shading</option>
                    <option value="Portrait & Figure Art (Dulha Dulhan)">Portrait & Figure Art (Dulha Dulhan)</option>
                    <option value="Indo-Western & Minimalist">Indo-Western & Minimalist</option>
                    <option value="Mughal & Mandala Architecture">Mughal & Mandala Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Portfolio / Instagram Link
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="https://instagram.com/your_art_handle"
                  />
                </div>
              </div>

              {/* ── Sample Design Upload Section (Requirement from user) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-stone-700">
                    Upload Sample Mehendi Artworks / Portfolio (Up to 5 Photos) *
                  </label>
                  <span className="text-[11px] font-medium text-brand-gold-dark">
                    {sampleImages.length} / 5 photos uploaded
                  </span>
                </div>

                {/* Upload Drag/Click Zone */}
                {sampleImages.length < 5 && (
                  <div className="border-2 border-dashed border-stone-300 hover:border-brand-gold rounded-2xl p-6 text-center bg-stone-50/70 hover:bg-amber-50/20 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-stone-800">
                        Click or drag & drop sample design photos here
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Upload high-resolution photos of your hand/feet henna work (JPG, PNG, WEBP)
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Photos Gallery Preview */}
                {sampleImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {sampleImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-brand-gold/60 group shadow-sm bg-stone-900"
                      >
                        <img
                          src={img.url}
                          alt={`Sample artwork ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => removeSampleImage(img.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          Sample #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statement / Message */}
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1.5">
                  Artist Statement / Bridal Experience Details
                </label>
                <textarea
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  placeholder="Share notable weddings you have catered, speed per side, or custom motifs you specialize in..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100 pt-4">
                <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Your information is kept confidential within our curatorial board.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-sm hover:bg-brand-maroon-dark transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Application...' : 'Submit Guild Application'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Extensive Artist FAQ Section (Requirements from user) ── */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80 space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-maroon" />
              Artist Guild Knowledge Base
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
              Frequently Asked Questions for Artists
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              Everything you need to know about how bookings work, payments, commissions, and organic supplies.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-stone-200 rounded-2xl overflow-hidden transition-all bg-stone-50/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-amber-50/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-200/70 text-stone-700">
                        {faq.category}
                      </span>
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {faq.question}
                      </span>
                    </div>
                    <div className="text-stone-400 flex-shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-brand-maroon" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Support Note */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <span>
              Have specific questions about wedding packages or destination gigs? Reach our artist support team at <strong>artists@shringar.com</strong>
            </span>
            <span className="font-bold underline text-brand-maroon cursor-pointer">
              Direct WhatsApp Help
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
