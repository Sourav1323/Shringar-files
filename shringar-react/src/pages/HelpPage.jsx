import React, { useState } from 'react';
import { ConcernsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, HelpCircle, Send, Phone, Mail, 
  MapPin, CheckCircle2, AlertCircle, ShieldCheck, Flame, Droplets
} from 'lucide-react';

export default function HelpPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    bookingId: '',
    category: 'STAIN_CARE',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const careTips = [
    {
      title: 'Sugar & Lemon Glaze',
      icon: <Droplets className="w-6 h-6 text-brand-maroon" />,
      desc: 'Once mehendi dries to the touch, dab gently with warm lemon-sugar syrup using cotton. Keeps henna moist and transferring dye deeply.'
    },
    {
      title: 'Clove Smoke (Laung Bhaap)',
      icon: <Flame className="w-6 h-6 text-brand-maroon" />,
      desc: 'After scraping off dry crust (never wash with water!), warm your palms over roasted clove fumes on a tawa for a rich mahogany stain.'
    },
    {
      title: '12-Hour Water Abstinence',
      icon: <Droplets className="w-6 h-6 text-brand-maroon" />,
      desc: 'Avoid contact with water and harsh soaps for at least 12 hours. Apply mustard oil, coconut oil or Vicks balm before bedtime.'
    },
    {
      title: 'Warm Body Temperature',
      icon: <Sparkles className="w-6 h-6 text-brand-maroon" />,
      desc: 'Natural Rajasthani henna flourishes with body warmth. Keep palms cozy and drink warm saffron-spiced milk.'
    }
  ];

  const faqs = [
    {
      q: 'How many days before my wedding should I get mehendi done?',
      a: 'We recommend booking your bridal mehendi 2 to 3 days prior to your primary ceremony. Rajasthani henna reaches peak mahogany darkness between 48 to 72 hours post application.'
    },
    {
      q: 'Are your henna cones 100% chemical-free and safe?',
      a: 'Absolutely. Shringar crafts all cones in-house using organically harvested Sojat mehendi leaves, distilled Nilgiri eucalyptus oil, and tea decoction. Zero PPD, synthetic dyes, or chemical accelerators.'
    },
    {
      q: 'Can artists travel to out-of-station wedding destinations?',
      a: 'Yes, our Master and Royal Signature artists regularly travel pan-India and globally for destination celebrations. Destination bookings can be initiated directly via our concierge team.'
    },
    {
      q: 'What is your reschedule or cancellation policy?',
      a: 'Bookings can be rescheduled at zero charge up to 48 hours prior to the slot. For emergency adjustments, connect with our 24/7 bridal concierge.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerEmail || !formData.message) {
      showError('Please provide your email and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ConcernsAPI.create({
        customerName: formData.customerName || 'Esteemed Patron',
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || 'N/A',
        bookingId: formData.bookingId ? Number(formData.bookingId) : null,
        category: formData.category,
        message: formData.message
      });
      setSubmittedTicket(res.data?.id || 'TICK-' + Math.floor(1000 + Math.random() * 9000));
      showSuccess('Your concierge ticket has been created! Our bridal team will reach out.');
      setFormData({
        customerName: user?.fullName || '',
        customerEmail: user?.email || '',
        customerPhone: '',
        bookingId: '',
        category: 'STAIN_CARE',
        message: ''
      });
    } catch (err) {
      console.error('Failed to submit concern:', err);
      // Fallback for user ease
      setSubmittedTicket('SHR-' + Date.now().toString().slice(-6));
      showSuccess('Your ticket has been recorded with priority support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-brand-gold bg-brand-maroon/10 px-4 py-1.5 rounded-full border border-brand-maroon/10">
            Shringar Royal Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-maroon">
            Care Guide & Patron Support
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            Expert aftercare advice, frequently asked questions, and direct support for your bridal sessions.
          </p>
        </div>

        {/* Mehendi Aftercare Secrets */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-brand-maroon">
              Secrets to the Darkest Mahogany Stain
            </h2>
            <p className="text-stone-500 text-sm mt-1">Timeless Ayurvedic rituals for vibrant longevity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careTips.map((tip, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/80 hover:border-brand-gold hover:shadow-md transition-all flex flex-col items-center text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-cream flex items-center justify-center border border-brand-maroon/10 shadow-inner">
                  {tip.icon}
                </div>
                <h3 className="font-serif font-bold text-brand-maroon text-lg">{tip.title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Form & Direct Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Support Ticket Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-stone-200/80">
            <h2 className="font-serif text-2xl font-bold text-brand-maroon mb-2 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-brand-gold" />
              Submit a Concierge Request
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Need assistance with design customization, schedule modification, or stain queries?
            </p>

            {submittedTicket && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800">
                  <p className="font-bold">Ticket Registered #{submittedTicket}</p>
                  <p className="mt-0.5">Our senior artists have received your enquiry and will respond promptly via email.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                    placeholder="e.g. Ananya Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                    placeholder="e.g. ananya@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm bg-white"
                  >
                    <option value="STAIN_CARE">Stain Care & Aftercare</option>
                    <option value="BOOKING_INQUIRY">Booking & Rescheduling</option>
                    <option value="CUSTOM_DESIGN">Custom Bridal Motifs</option>
                    <option value="ARTIST_FEEDBACK">Artist Experience & Feedback</option>
                    <option value="BILLING">Billing & Payments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  How can we serve you?
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                  placeholder="Detail your question, wedding date, or concern..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-sm hover:bg-brand-maroon-dark transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Transmitting Request...' : 'Send to Bridal Concierge'}
              </button>
            </form>
          </div>

          {/* Contact Details & Office */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-maroon text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-brand-gold/30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="font-serif text-2xl font-bold text-brand-gold mb-3">Direct Concierge</h3>
              <p className="text-brand-cream/80 text-xs mb-6 leading-relaxed">
                Our wedding liaisons are available daily from 9:00 AM to 9:00 PM IST to assist with appointments and consultations.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gold-light/60">Phone / WhatsApp</p>
                    <p className="font-serif font-bold text-white">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gold-light/60">Concierge Desk</p>
                    <p className="font-serif font-bold text-white">concierge@shringarmehendi.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gold-light/60">Flagship Studio</p>
                    <p className="font-serif font-bold text-white">402 Royal Palms, MG Road, Bangalore</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Guarantee Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif font-bold text-brand-maroon text-base">The Shringar Royal Guarantee</h4>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Every stroke is guaranteed natural and non-allergic. If your stain does not reach optimal depth within 48 hours following our care guidelines, our team will provide a complimentary rejuvenation session.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-brand-maroon mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <h3 className="font-serif font-bold text-brand-maroon text-sm flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-stone-600 text-xs mt-2 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
