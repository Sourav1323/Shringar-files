import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-maroon-dark text-brand-cream border-t-2 border-brand-gold-dark/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/shringar-logo.png"
                alt="Shringar Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold shadow-md"
              />
              <span className="font-serif-luxury text-2xl font-bold gold-gradient-text tracking-widest">
                SHRINGAR
              </span>
            </div>
            <p className="text-xs text-brand-cream/80 leading-relaxed">
              India's premier bridal & celebratory mehendi couture. Blending royal Rajasthani heritage, delicate Arabic floral motifs, and advanced 3D virtual AI hand customization.
            </p>
            <div className="text-xs text-brand-gold/90 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>100% Organic Henna Cones Guaranteed</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-cinzel font-bold text-brand-gold tracking-wider uppercase">
              Explore Collections
            </h4>
            <ul className="space-y-2 text-xs text-brand-cream/85">
              <li>
                <Link to="/designs" className="hover:text-brand-gold transition">
                  Browse All Designs
                </Link>
              </li>
              <li>
                <Link to="/designs?category=Bridal" className="hover:text-brand-gold transition">
                  Royal Rajasthani Bridal
                </Link>
              </li>
              <li>
                <Link to="/designs?category=Arabic" className="hover:text-brand-gold transition">
                  Arabic Floral & Vines
                </Link>
              </li>
              <li>
                <Link to="/designs?category=Minimal" className="hover:text-brand-gold transition">
                  Contemporary Minimalist
                </Link>
              </li>
              <li>
                <Link to="/custom-design" className="hover:text-brand-gold transition text-brand-gold font-medium">
                  ✦ Commission Custom Design
                </Link>
              </li>
                {/* AI Try-On link temporarily commented out
                <Link to="/ai-tryon" className="hover:text-brand-gold transition flex items-center gap-1">
                  <span>3D AI Hand Try-On Studio</span>
                </Link>
                */}
              <li>
                <Link to="/become-artist" className="hover:text-brand-gold transition text-brand-gold-light/90">
                  Join as Henna Artist
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-cinzel font-bold text-brand-gold tracking-wider uppercase">
              Help & Care
            </h4>
            <ul className="space-y-2 text-xs text-brand-cream/85">
              <li>
                <Link to="/help" className="hover:text-brand-gold transition">
                  Henna Stain Darkening Guide
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-gold transition">
                  How Appointments Work
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brand-gold transition">
                  Customer Concerns & Inquiries
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brand-gold transition">
                  Cancellation & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs text-brand-cream/85">
            <h4 className="text-sm font-cinzel font-bold text-brand-gold tracking-wider uppercase">
              Get in Touch
            </h4>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>shringar.admin@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>9:00 AM – 9:00 PM IST (Daily)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>Operating in Delhi NCR, Mumbai, Jaipur & Bangalore</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-cream/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-cream/60 gap-3">
          <p>© {new Date().getFullYear()} Shringar Luxury Mehendi Couture. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/help" className="hover:text-brand-gold transition">Terms of Service</Link>
            <span>•</span>
            <Link to="/help" className="hover:text-brand-gold transition">Privacy Policy</Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-brand-gold/80">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> for Indian Weddings
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
