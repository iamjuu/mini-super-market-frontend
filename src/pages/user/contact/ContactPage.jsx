import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { usePlatform } from '../../../context/PlatformContext';

export const ContactPage = ({ onNavigate }) => {
  const { appearance } = usePlatform();
  const brandName = appearance?.platformName || 'Alfaysal Bakery';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: `Does ${brandName} sell directly to consumers?`,
      a: 'We are a manufacturing and wholesale company. Our products are supplied to supermarket and retail partners. This catalog helps buyers browse our range for B2B supply.'
    },
    {
      q: 'How can a supermarket partner request supply?',
      a: 'Contact our sales team by phone or email with your company details and product interest. We will share wholesale availability, SKUs, and distribution options across Kuwait.'
    },
    {
      q: 'Where do you distribute?',
      a: 'We provide nationwide distribution across Kuwait to supermarket chains and authorized retail partners.'
    },
    {
      q: 'Can I browse the full product catalog online?',
      a: 'Yes. Use the Product Catalog to explore categories and items we manufacture for supermarket shelves. For wholesale pricing and orders, please contact our B2B team.'
    }
  ];

  return (
    <div className="w-full bg-[#FAFAFA] font-sans selection:bg-[#FF7622]/20">
      
      {/* Header */}
      <div className="bg-[#FFF9F5] border-b border-orange-100/60 py-12 px-6 text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#FF7622]">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F2229]">
          Contact {brandName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-medium">
          Wholesale inquiries, supermarket partnerships, and catalog questions — our team is ready to help.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-12">
        
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7622] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-[#1F2229]">Headquarters</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Al Faysal Bakery &amp; Sweets Company W.L.L.<br />
              Kuwait
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7622] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-[#1F2229]">Sales Hotline</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              <a href="tel:+96524739900" className="hover:text-[#FF7622]">+965 24739900</a>
              <br />
              B2B &amp; wholesale partners
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7622] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-[#1F2229]">Email Inquiries</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              <a href="mailto:info@alfaysalgroup.com" className="hover:text-[#FF7622]">
                info@alfaysalgroup.com
              </a>
              <br />
              Partnership &amp; catalog requests
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7622] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-[#1F2229]">Business Hours</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sunday – Thursday<br />
              8:00 AM – 5:00 PM
            </p>
          </div>
        </div>

        {/* Form and FAQ 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-left">
            <div>
              <h3 className="text-xl font-black text-[#1F2229]">Send a Wholesale Inquiry</h3>
              <p className="text-xs text-slate-500 mt-0.5">For supermarket buyers and retail partners.</p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-800">Message Received!</h4>
                <p className="text-xs text-emerald-600">
                  Thank you. Our B2B team will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600">YOUR NAME</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Ahmed Al-Rashid"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF7622] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. buyer@supermarket.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF7622] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600">PHONE NUMBER</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+965 ..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF7622] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600">SUBJECT</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Wholesale / Catalog / Partnership"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF7622] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600">YOUR MESSAGE</label>
                  <textarea
                    required
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your supermarket or retail company..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF7622] focus:bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#FF7622] hover:bg-[#E56314] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF7622]/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-black text-[#1F2229]">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#1F2229]">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#FF7622]' : ''}`} />
                  </div>
                  {openFaq === idx && (
                    <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2 pt-2 border-t border-slate-100">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
