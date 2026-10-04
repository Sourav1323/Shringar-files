import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Mail, Phone, MapPin, Shield, Calendar, 
  ShoppingBag, LogOut, Heart, Clock, CheckCircle2 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    localStorage.getItem('shringar_saved_address') || 'Flat 402, Royal Palms, MG Road, Bangalore'
  );
  const [city, setCity] = useState(
    localStorage.getItem('shringar_saved_city') || 'Bangalore'
  );
  const [savedNotes, setSavedNotes] = useState(
    localStorage.getItem('shringar_saved_notes') || 'Prefer natural dark organic henna cone.'
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-brand-cream/40 px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-xl border border-brand-maroon/10">
          <User className="w-16 h-16 mx-auto text-brand-maroon mb-4 opacity-70" />
          <h2 className="font-serif text-2xl text-brand-maroon font-bold mb-2">Guest Account</h2>
          <p className="text-stone-600 text-sm mb-6">
            Sign in to access your royal bookings, loyalty points, and personalized mehendi recommendations.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold tracking-wider hover:bg-brand-maroon-dark shadow-md transition-all"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveAddress = (e) => {
    e.preventDefault();
    localStorage.setItem('shringar_saved_address', address);
    localStorage.setItem('shringar_saved_city', city);
    localStorage.setItem('shringar_saved_notes', savedNotes);
    setIsEditing(false);
    showSuccess('Profile and preferences updated successfully!');
  };

  const handleLogout = () => {
    logout();
    showSuccess('You have been safely signed out. See you soon!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-brand-gold-light rounded-3xl shadow-xl p-8 border border-brand-gold/30">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 rounded-full bg-brand-gold/20 border-2 border-brand-gold flex items-center justify-center text-3xl font-serif font-bold text-brand-gold shadow-lg">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/20 rounded-full text-xs font-semibold uppercase tracking-wider text-brand-gold mb-2 border border-brand-gold/30">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? 'Royal Administrator' : 'Royal Patron'}
                </div>
                <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
                  {user?.fullName || 'Esteemed Patron'}
                </h1>
                <p className="text-brand-gold-light/80 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  className="px-5 py-2.5 bg-brand-gold text-brand-maroon-dark font-serif font-bold text-sm rounded-full hover:bg-yellow-400 transition-colors shadow-md flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-serif text-sm rounded-full border border-white/20 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            to="/orders"
            className="p-5 bg-white rounded-2xl shadow-sm border border-stone-200/80 hover:border-brand-gold hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-maroon/10 text-brand-maroon flex items-center justify-center group-hover:bg-brand-maroon group-hover:text-brand-gold transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">My Appointments</p>
              <h3 className="font-serif text-lg font-bold text-brand-maroon">View Bookings</h3>
            </div>
          </Link>

          <Link
            to="/custom-design"
            className="p-5 bg-white rounded-2xl shadow-sm border border-amber-300 hover:border-brand-gold hover:shadow-md transition-all flex items-center gap-4 group bg-amber-50/20"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-brand-maroon flex items-center justify-center group-hover:bg-brand-maroon group-hover:text-brand-gold transition-colors">
              <Sparkles className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-amber-800">Custom Commissions</p>
              <h3 className="font-serif text-lg font-bold text-brand-maroon">Custom & Advance</h3>
            </div>
          </Link>

          <Link
            to="/cart"
            className="p-5 bg-white rounded-2xl shadow-sm border border-stone-200/80 hover:border-brand-gold hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-maroon/10 text-brand-maroon flex items-center justify-center group-hover:bg-brand-maroon group-hover:text-brand-gold transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">Selected Artworks</p>
              <h3 className="font-serif text-lg font-bold text-brand-maroon">Cart Items</h3>
            </div>
          </Link>

          <Link
            to="/become-artist"
            className="p-5 bg-white rounded-2xl shadow-sm border border-stone-200/80 hover:border-brand-gold hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-maroon/10 text-brand-maroon flex items-center justify-center group-hover:bg-brand-maroon group-hover:text-brand-gold transition-colors">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">Artisan Guild</p>
              <h3 className="font-serif text-lg font-bold text-brand-maroon">Become an Artist</h3>
            </div>
          </Link>
        </div>

        {/* Saved Preferences & Venue */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-8">
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand-maroon">Venue & Delivery Preferences</h2>
              <p className="text-stone-500 text-sm mt-1">Default address for home artist appointments</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Preferences'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveAddress} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Full Street Address / Venue
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Bridal & Henna Preferences (Notes)
                </label>
                <textarea
                  rows="3"
                  value={savedNotes}
                  onChange={(e) => setSavedNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Organic oil sensitivity, Eucalyptus preference, etc."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold hover:bg-brand-maroon-dark shadow transition-all"
                >
                  Save Address & Notes
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 text-brand-maroon font-serif font-bold mb-2">
                  <MapPin className="w-5 h-5 text-brand-maroon" />
                  Primary Venue
                </div>
                <p className="text-stone-700 text-sm leading-relaxed">{address}</p>
                <p className="text-stone-500 text-xs mt-1 font-semibold">{city}</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 text-brand-maroon font-serif font-bold mb-2">
                  <Heart className="w-5 h-5 text-brand-maroon" />
                  Artist Special Requests
                </div>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {savedNotes || 'No special requests specified.'}
                </p>
                <p className="text-stone-400 text-xs mt-2 italic">Applied to future appointments</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
