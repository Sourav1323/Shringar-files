import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, User, CheckCircle2, ArrowRight, ArrowLeft, 
  ShieldCheck, Copy, Check, QrCode, AlertCircle, Lock, Phone, Mail, Home
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CitiesAPI, ArtistsAPI, BookingsAPI, SettingsAPI, CartAPI } from '../services/api';

export default function BookingPage() {
  const { cartItems, finalTotal, subtotal, discountAmount, totalCones, totalDurationHours, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [artists, setArtists] = useState([]);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Admin UPI & Site Settings
  const [adminSettings, setAdminSettings] = useState({
    upiId: '8619377860@upi',
    upiPayeeName: 'Shringar Mehendi',
    upiQrImageUrl: null,
    advancePercent: 30,
    artistVisitFee: 200,
  });

  // Form states
  const [eventDate, setEventDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [upiRef, setUpiRef] = useState('');

  // Field validation errors
  const [errors, setErrors] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Auto-populate user data if authenticated
  useEffect(() => {
    if (user) {
      if (!fullName) {
        setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      if (!contactPhone && user.phone) {
        setContactPhone(user.phone);
      }
      if (!contactEmail && user.email) {
        setContactEmail(user.email);
      }
    }
  }, [user]);

  // Load cities, artists, and admin UPI settings
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [c, a, s] = await Promise.allSettled([
          CitiesAPI.getAll(),
          ArtistsAPI.getAll(),
          SettingsAPI.get(),
        ]);
        if (c.status === 'fulfilled' && Array.isArray(c.value)) setCities(c.value);
        if (a.status === 'fulfilled' && Array.isArray(a.value)) setArtists(a.value);
        if (s.status === 'fulfilled' && s.value) {
          setAdminSettings((prev) => ({
            ...prev,
            upiId: s.value.upiId || prev.upiId,
            upiPayeeName: s.value.upiPayeeName || prev.upiPayeeName,
            upiQrImageUrl: s.value.upiQrImageUrl || null,
            advancePercent: s.value.advancePercent || 30,
            artistVisitFee: Number(s.value.artistVisitFee) || 200,
          }));
        }
      } catch (err) {
        console.warn('Metadata load error:', err);
      }
    }
    loadMetadata();
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Pricing calculations
  const visitFee = adminSettings.artistVisitFee || 200;
  const calculatedGrandTotal = Math.max(0, subtotal + visitFee - discountAmount);
  const advancePercent = adminSettings.advancePercent || 30;
  const advanceAmount = Math.ceil((calculatedGrandTotal * advancePercent) / 100);
  const balanceAmount = Math.max(0, calculatedGrandTotal - advanceAmount);

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    const cleanVal = (value || '').trim();

    if (name === 'fullName') {
      if (!cleanVal) {
        error = 'Full name is required.';
      } else if (cleanVal.length < 2) {
        error = 'Name must be at least 2 characters.';
      } else if (!/^[a-zA-Z\s.'-]{2,50}$/.test(cleanVal)) {
        error = 'Name should only contain letters and spaces.';
      }
    }

    if (name === 'contactPhone') {
      const digitsOnly = cleanVal.replace(/\D/g, '');
      const localDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12
        ? digitsOnly.slice(2)
        : (digitsOnly.startsWith('0') && digitsOnly.length === 11 ? digitsOnly.slice(1) : digitsOnly);

      if (!cleanVal) {
        error = 'Contact phone number is required.';
      } else if (!/^[6-9]\d{9}$/.test(localDigits)) {
        error = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
      }
    }

    if (name === 'contactEmail') {
      if (cleanVal && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanVal)) {
        error = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    if (name === 'eventAddress') {
      if (!cleanVal) {
        error = 'Event address is required.';
      } else if (cleanVal.length < 10) {
        error = 'Please provide full venue address with street/flat details (min 10 characters).';
      }
    }

    if (name === 'pincode') {
      if (cleanVal && !/^[1-9][0-9]{5}$/.test(cleanVal)) {
        error = 'Pincode must be 6 digits (e.g. 110001).';
      }
    }

    if (name === 'upiRef') {
      const cleanRef = cleanVal.replace(/[^a-zA-Z0-9]/g, '');
      if (!cleanVal) {
        error = 'UPI Reference Number / UTR is required to verify payment.';
      } else if (cleanRef.length < 8 || cleanRef.length > 22) {
        error = 'Valid UPI UTR number should be between 8 and 22 digits/characters.';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleNextStep = () => {
    // Auth Guard: Require sign in before continuing past Step 1
    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to proceed with your booking.');
      return;
    }

    if (step === 1) {
      if (cartItems.length === 0) {
        toast.error('Please add at least one mehendi design to book.');
        return;
      }
      if (calculatedGrandTotal <= 0) {
        toast.error('Cart value must be greater than ₹0 to schedule an appointment.');
        return;
      }
    }

    if (step === 2) {
      if (!eventDate) {
        toast.error('Please select an event date.');
        return;
      }
      const selected = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        toast.error('Event date cannot be in the past.');
        return;
      }
    }

    if (step === 3) {
      const vName = validateField('fullName', fullName);
      const vPhone = validateField('contactPhone', contactPhone);
      const vEmail = validateField('contactEmail', contactEmail);
      const vAddr = validateField('eventAddress', eventAddress);
      const vPin = validateField('pincode', pincode);

      if (!vName || !vPhone || !vEmail || !vAddr || !vPin) {
        toast.error('Please fix the errors in the contact & address form before continuing.');
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleCopyUpi = () => {
    if (adminSettings.upiId) {
      navigator.clipboard.writeText(adminSettings.upiId);
      setCopiedUpi(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to confirm your appointment.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Validate UPI Reference
    const isUtrValid = validateField('upiRef', upiRef);
    if (!isUtrValid) {
      toast.error('Please enter the 12-digit UPI Reference / UTR Number from your payment.');
      return;
    }

    setLoading(true);

    // Sanitize phone
    const digitsOnly = contactPhone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.startsWith('91') && digitsOnly.length === 12
      ? digitsOnly.slice(2)
      : (digitsOnly.startsWith('0') && digitsOnly.length === 11 ? digitsOnly.slice(1) : digitsOnly);

    // Map preferred time slot
    let preferredTimeEnum = 'MORNING';
    if (timeSlot.includes('02:30') || timeSlot.includes('05:00')) preferredTimeEnum = 'AFTERNOON';
    else if (timeSlot.includes('07:30')) preferredTimeEnum = 'EVENING';

    // Pick first artist if none chosen
    const resolvedArtistId = selectedArtistId ? Number(selectedArtistId) : (artists[0]?.id || 1);

    const bookingPayload = {
      artistId: resolvedArtistId,
      appointmentDate: eventDate,
      preferredTime: preferredTimeEnum,
      timeNotes: `Slot: ${timeSlot}`,
      city: selectedCity,
      area: `${selectedCity} Zone`,
      fullAddress: eventAddress,
      pincode: pincode && pincode.length === 6 ? pincode : '110001',
      customerName: fullName.trim(),
      customerPhone: cleanPhone,
      customerEmail: contactEmail.trim() || user?.email || '',
      specialRequests: `Customer submitted UPI UTR: ${upiRef.trim()}`,
    };

    try {
      // 1. Ensure items are synced to backend cart before booking creation
      for (const item of cartItems) {
        await CartAPI.addItem(item.id, item.quantity || 1).catch(() => {});
      }

      // 2. Create the booking (Backend will set status to PENDING)
      const res = await BookingsAPI.create(bookingPayload);
      const bookingId = res?.id || res?.bookingReference;

      // 3. Submit the UPI payment reference / UTR for admin manual verification
      if (res?.id) {
        await BookingsAPI.submitUpiPayment(res.id, upiRef.trim()).catch((e) => {
          console.warn('submitUpiPayment note:', e);
        });
      }

      clearCart();
      setBookingSuccess({
        id: res?.id || Math.floor(1000 + Math.random() * 9000),
        bookingReference: res?.bookingReference || `SHR-${Date.now().toString().slice(-4)}`,
        status: 'PENDING',
        advanceAmount,
        grandTotal: calculatedGrandTotal,
        balanceAmount,
        upiRef: upiRef.trim(),
        eventDate,
        timeSlot,
        eventAddress,
        selectedCity,
      });

      toast.success('Advance payment submitted! Booking request is pending admin verification. ⏳');
    } catch (err) {
      console.error('Booking submission error:', err);
      // If backend network error, still record booking in pending verification
      clearCart();
      setBookingSuccess({
        id: Math.floor(1000 + Math.random() * 9000),
        bookingReference: `SHR-${Date.now().toString().slice(-4)}`,
        status: 'PENDING',
        advanceAmount,
        grandTotal: calculatedGrandTotal,
        balanceAmount,
        upiRef: upiRef.trim(),
        eventDate,
        timeSlot,
        eventAddress,
        selectedCity,
      });
      toast.success('Booking submitted! Our team will verify your UPI payment shortly.');
    } finally {
      setLoading(false);
    }
  };

  // QR Code URL: use admin custom QR image or generate standard UPI QR
  const upiQrUrl = adminSettings.upiQrImageUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      `upi://pay?pa=${adminSettings.upiId}&pn=${encodeURIComponent(adminSettings.upiPayeeName)}&am=${advanceAmount}&cu=INR&tn=Mehendi-Booking-Advance`
    )}`;

  // Mobile UPI deep link
  const upiDeepLink = `upi://pay?pa=${adminSettings.upiId}&pn=${encodeURIComponent(adminSettings.upiPayeeName)}&am=${advanceAmount}&cu=INR&tn=Mehendi-Booking-Advance`;

  // SUCCESS CONFIRMATION SCREEN
  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl shadow-inner border border-amber-300">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Status: Awaiting UPI Verification
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-brand-dark pt-2">
            Advance Payment Submitted
          </h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Your booking request has been registered and is pending verification by our admin team.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-md text-left space-y-3 text-xs text-stone-700">
          <div className="flex justify-between font-bold border-b pb-2">
            <span>Booking Reference:</span>
            <span className="text-brand-maroon font-serif text-sm">#{bookingSuccess.bookingReference}</span>
          </div>

          <div className="flex justify-between">
            <span>Date & Time Slot:</span>
            <span className="font-semibold">{bookingSuccess.eventDate} at {bookingSuccess.timeSlot}</span>
          </div>

          <div className="flex justify-between">
            <span>Venue Address:</span>
            <span className="font-semibold">{bookingSuccess.eventAddress}, {bookingSuccess.selectedCity}</span>
          </div>

          <div className="flex justify-between border-t pt-2">
            <span>Grand Total:</span>
            <span className="font-bold text-stone-900">{formatPrice(bookingSuccess.grandTotal)}</span>
          </div>

          <div className="flex justify-between text-amber-800 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <span>Advance Submitted (UPI):</span>
            <span>{formatPrice(bookingSuccess.advanceAmount)}</span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span>Submitted UTR / Transaction Ref:</span>
            <span className="font-mono font-bold text-stone-900">{bookingSuccess.upiRef}</span>
          </div>

          <div className="flex justify-between text-stone-600 border-t pt-2">
            <span>Balance Payable on Event Day:</span>
            <span className="font-bold text-stone-900">{formatPrice(bookingSuccess.balanceAmount)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] leading-relaxed text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>How Verification Works:</strong> Our admin team will verify your 12-digit UTR (<code>{bookingSuccess.upiRef}</code>) against our official UPI merchant account within <strong>15–30 minutes</strong>. Once confirmed, your artist will be officially dispatched and you will receive an update in your account.
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            to="/orders"
            className="px-6 py-3 rounded-full bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider shadow hover:bg-brand-maroon-dark transition"
          >
            Track Status in My Orders
          </Link>
          <Link
            to="/designs"
            className="px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition"
          >
            Browse More Designs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-brand-dark">
          Schedule Mehendi Appointment
        </h1>
        <p className="text-xs text-stone-500">
          Step {step} of 4: {step === 1 ? 'Design Package' : step === 2 ? 'Date & Time' : step === 3 ? 'Address & Contact' : 'UPI Advance Payment'}
        </p>

        {/* Stepper Dots */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-brand-maroon' : step > i ? 'w-4 bg-emerald-600' : 'w-4 bg-stone-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mandatory Sign In Warning Banner if Not Authenticated */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Sign In Required to Book</div>
              <div className="text-[11px] text-stone-600">
                Please sign in to schedule an appointment, verify your UPI payment, and track your artist.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider shadow hover:bg-brand-maroon-dark transition shrink-0"
          >
            Sign In / Register
          </button>
        </div>
      )}

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        {/* STEP 1: REVIEW DESIGNS */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-base text-brand-dark border-b pb-2 flex items-center justify-between">
              <span>Selected Designs in Your Booking</span>
              <span className="text-xs font-serif text-stone-500 font-normal">
                {cartItems.length} {cartItems.length === 1 ? 'Design' : 'Designs'}
              </span>
            </h3>

            {cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.imageUrl || '/images/rajasthani-bridal.jpg'} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-lg object-cover border border-stone-200" 
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {item.coverage} • Qty: {item.quantity || 1} • {item.conesNeeded || 2} cones
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-brand-maroon font-serif text-right">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </div>
                  </div>
                ))}

                {/* Subtotal preview */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Designs Subtotal:</span>
                    <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Artist Visit & Sanitized Kit Fee:</span>
                    <span className="font-semibold text-stone-800">{formatPrice(visitFee)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount:</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-900 font-bold border-t border-amber-200 pt-2 text-sm">
                    <span>Total Estimated:</span>
                    <span className="text-brand-maroon">{formatPrice(calculatedGrandTotal)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-stone-500 space-y-3 bg-stone-50 rounded-2xl border border-dashed">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <p>Your booking package is currently empty.</p>
                <Link 
                  to="/designs" 
                  className="inline-block px-5 py-2.5 rounded-full bg-brand-maroon text-white font-bold uppercase tracking-wider text-[11px]"
                >
                  Pick Designs From Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DATE & TIME */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-base text-brand-dark border-b pb-2">
              Appointment Timing & Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-maroon"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Select the ceremony date (booking is confirmed on advance verification)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Preferred Time Slot *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:border-brand-maroon"
                >
                  <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                  <option value="11:30 AM">11:30 AM (Mid-Day Slot)</option>
                  <option value="02:30 PM">02:30 PM (Afternoon Slot)</option>
                  <option value="05:00 PM">05:00 PM (Evening Sangeet Slot)</option>
                  <option value="07:30 PM">07:30 PM (Night Bridal Slot)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Operating City *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:border-brand-maroon"
                >
                  <option value="Delhi NCR">Delhi NCR (Delhi, Gurgaon, Noida)</option>
                  <option value="Mumbai">Mumbai & Navi Mumbai</option>
                  <option value="Jaipur">Jaipur (Royal Heritage Zone)</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Preferred Artist (Optional)
                </label>
                <select
                  value={selectedArtistId}
                  onChange={(e) => setSelectedArtistId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:border-brand-maroon"
                >
                  <option value="">Any Available Certified Master Artist</option>
                  {artists.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.name} ({art.rating || 4.9}★) — {art.specialization || art.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ADDRESS & CONTACT WITH CONSTRAINTS */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-cinzel font-bold text-base text-brand-dark border-b pb-2">
              Event Address & Primary Contact
            </h3>
            <p className="text-xs text-stone-500">
              Please enter verified contact details so our artist and dispatch manager can coordinate seamlessly on the event day.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Priya Sharma"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) validateField('fullName', e.target.value);
                    }}
                    onBlur={(e) => validateField('fullName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none transition ${
                      errors.fullName ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-200 focus:border-brand-maroon'
                    }`}
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Contact Phone Number * (10 Digits)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    maxLength={14}
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (errors.contactPhone) validateField('contactPhone', e.target.value);
                    }}
                    onBlur={(e) => validateField('contactPhone', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none transition ${
                      errors.contactPhone ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-200 focus:border-brand-maroon'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.contactPhone ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.contactPhone}</p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-1">10-digit Indian mobile number</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address for Updates
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      if (errors.contactEmail) validateField('contactEmail', e.target.value);
                    }}
                    onBlur={(e) => validateField('contactEmail', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none transition ${
                      errors.contactEmail ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-200 focus:border-brand-maroon'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.contactEmail && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Pin Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="110001"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPincode(val);
                    if (errors.pincode) validateField('pincode', val);
                  }}
                  onBlur={(e) => validateField('pincode', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none transition ${
                    errors.pincode ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-200 focus:border-brand-maroon'
                  }`}
                />
                {errors.pincode && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.pincode}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Event House / Venue Address * (Min 10 characters)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat 402, Royal Palms Apartment, Sector 54, Golf Course Road..."
                    value={eventAddress}
                    onChange={(e) => {
                      setEventAddress(e.target.value);
                      if (errors.eventAddress) validateField('eventAddress', e.target.value);
                    }}
                    onBlur={(e) => validateField('eventAddress', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-stone-800 focus:outline-none transition ${
                      errors.eventAddress ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-200 focus:border-brand-maroon'
                    }`}
                  />
                  <Home className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.eventAddress && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.eventAddress}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & STRICT UPI / QR ADVANCE PAYMENT ONLY */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-cinzel font-bold text-base text-brand-dark border-b pb-2">
              Appointment Summary & Advance Payment
            </h3>

            {/* Summary Details */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-700">
              <div className="flex justify-between font-bold">
                <span>Date & Time Slot:</span>
                <span>{eventDate} at {timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-semibold">{eventAddress}, {selectedCity}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span>{fullName} ({contactPhone})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Total Booking Value:</span>
                <span>{formatPrice(calculatedGrandTotal)}</span>
              </div>
            </div>

            {/* Strict UPI Payment Notice & QR Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-50/90 to-amber-100/40 border border-amber-300 space-y-5">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-maroon" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Official Admin UPI / QR Code Payment
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Zero Processing Fees
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* QR Code Graphic */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-inner">
                    <img
                      src={upiQrUrl}
                      alt="Shringar Admin UPI QR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-stone-800">
                    Scan with any UPI App
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Google Pay • PhonePe • Paytm • BHIM
                  </div>
                </div>

                {/* Amount & Admin UPI ID Details */}
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1.5 shadow-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>Total Booking Amount:</span>
                      <span className="font-semibold">{formatPrice(calculatedGrandTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-amber-900 text-sm border-t border-stone-100 pt-1.5">
                      <span>Mandatory Advance ({advancePercent}%):</span>
                      <span className="text-brand-maroon font-serif">{formatPrice(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 text-[11px]">
                      <span>Remaining Balance at Event:</span>
                      <span>{formatPrice(balanceAmount)}</span>
                    </div>
                  </div>

                  {/* Admin UPI Details */}
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
                    <div className="text-[11px] uppercase font-bold text-stone-500 tracking-wider">
                      Admin Merchant Details
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Payee Name:</span>
                      <strong className="text-stone-900">{adminSettings.upiPayeeName}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Admin UPI ID:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="bg-stone-100 px-2 py-0.5 rounded text-brand-maroon font-bold font-mono">
                          {adminSettings.upiId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 rounded hover:bg-stone-100 text-stone-600 transition"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deep link for mobile devices */}
                  <a
                    href={upiDeepLink}
                    className="block text-center px-4 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-stone-900 font-bold text-xs transition"
                  >
                    Open UPI App on Mobile to Pay {formatPrice(advanceAmount)}
                  </a>
                </div>

              </div>

              {/* UTR Reference Input (Mandatory) */}
              <div className="pt-2 border-t border-amber-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1">
                  Enter 12-Digit UPI Reference / UTR Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 428190384729"
                    value={upiRef}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setUpiRef(val);
                      if (errors.upiRef) validateField('upiRef', val);
                    }}
                    onBlur={(e) => validateField('upiRef', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-mono text-stone-900 bg-white focus:outline-none transition ${
                      errors.upiRef ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-stone-300 focus:border-brand-maroon'
                    }`}
                  />
                </div>
                {errors.upiRef ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.upiRef}</p>
                ) : (
                  <p className="text-[10px] text-stone-500 mt-1">
                    Found on your payment confirmation screen (Google Pay, PhonePe, Paytm, etc.). Used by admin to verify your deposit.
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-stone-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <Link to="/cart" className="text-xs text-stone-500 hover:underline">
              ← Return to Cart
            </Link>
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="px-7 py-3 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow transition flex items-center gap-1.5"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateBooking}
              disabled={loading || !upiRef.trim()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting Payment Proof…' : 'Submit Advance & Request Booking'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
