import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, Shield, Search } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SEO } from '../components/common/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Booking & Enquiry',
    question: 'How do I enquire about a game?',
    answer:
      'To enquire about a game, browse our catalog or open any game details page and click the "BOOK / ENQUIRE" button. Fill in your name, preferred contact method (WhatsApp, Email, or Phone), contact information, and optional message, then click "SEND ENQUIRY".',
  },
  {
    category: 'Booking & Enquiry',
    question: 'How does booking work?',
    answer:
      'Booking on GameVault is a manual reservation request. When you submit an enquiry, our team receives your request and checks product details. We then contact you directly to confirm availability and discuss the next steps. No automated checkout or payment takes place on the website.',
  },
  {
    category: 'Contact & Verification',
    question: 'How will you contact me?',
    answer:
      'We will contact you directly using your selected preferred contact method—WhatsApp, Email, or Phone—within our standard business hours. Please ensure your contact information is entered accurately so our team can reach you.',
  },
  {
    category: 'Payment Process',
    question: 'How is payment handled?',
    answer:
      'Payment is handled manually outside the website. We do not collect credit cards, UPI PINs, banking info, or automated payments online. Payment options and instructions are arranged directly between you and our support desk once your enquiry is confirmed.',
  },
  {
    category: 'Key Delivery',
    question: 'How is delivery handled?',
    answer:
      'Product delivery is handled manually after confirmation and manual payment arrangement. We provide digital license keys and direct redemption instructions directly through your verified contact channel.',
  },
  {
    category: 'Booking & Enquiry',
    question: 'What happens after I submit an enquiry?',
    answer:
      'After submitting an enquiry, you will receive a unique reference code (e.g. GV-XXXXXX) for your records. Our support desk reviews your request and will contact you directly to verify title edition, launcher compatibility, and guide you through the manual confirmation process.',
  },
  {
    category: 'Compatibility',
    question: 'Are games officially affiliated with Steam, Epic, or EA?',
    answer:
      'No. GameVault is an independent digital game catalog and manual enquiry platform. Platform names such as Steam, Epic Games, Rockstar, EA, GOG, and Ubisoft are compatibility identifiers only. GameVault is not officially affiliated with or endorsed by these platform holders.',
  },
  {
    category: 'System Requirements',
    question: 'How do I check if my PC can run a game?',
    answer:
      'Every game details page contains a comprehensive System Specifications panel listing both Minimum and Recommended hardware specifications (CPU, RAM, GPU, OS, and storage requirements).',
  },
];

export const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({ name: '', email: '', subject: '', message: '' });

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketData.name && ticketData.email && ticketData.message) {
      setFormSubmitted(true);
      setTicketData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Help & Support Desk"
        description="Get assistance regarding manual booking, key delivery, launcher compatibility, and order verification on GameVault."
        canonicalUrl="/support"
      />
      {/* Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Help & Knowledge Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
          GameVault Support
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Need assistance with game enquiries, launcher redemption, or manual booking? Browse frequently asked questions or submit an inquiry.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FAQ Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white font-display mb-4">
            Frequently Asked Questions
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
              No matching help articles found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/50 border border-slate-800/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Form / Ticket Submission */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Submit an Inquiry
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Have questions about our catalog, title availability, or manual booking? Leave a message below.
            </p>

            {formSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Inquiry Received!</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Thank you for reaching out. Our support dispatch has received your inquiry and will follow up shortly.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-emerald-400 underline mt-2 text-left"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={ticketData.name}
                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Gamer tag or full name"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={ticketData.email}
                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="player@example.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Catalog request or feedback"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketData.message}
                    onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="Describe your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                  className="w-full"
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>

          {/* System Health */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <h4 className="font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
              System Telemetry
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between items-center">
                <span>Frontend UI Engine</span>
                <span className="text-emerald-400 font-mono">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Catalog Search Index</span>
                <span className="text-emerald-400 font-mono">100% Synced</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Client LocalStorage</span>
                <span className="text-cyan-400 font-mono">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
