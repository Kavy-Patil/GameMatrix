import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Send, Loader2, ShieldCheck } from 'lucide-react';
import { Game } from '../../types/game';
import { ContactMethod, EnquiryFormData, EnquiryFormErrors, EnquirySubmissionResult } from '../../types/enquiry';
import { enquiryService } from '../../services/enquiryService';
import { PLATFORMS, getPlatformName } from '../../data/platforms';

interface EnquiryFormProps {
  game: Game;
  platform: string;
  onPlatformChange: (platform: string) => void;
  onSubmitSuccess: (result: EnquirySubmissionResult) => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  game,
  platform,
  onPlatformChange,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    customerName: '',
    contactMethod: 'whatsapp',
    contactValue: '',
    message: '',
    platform: platform || game.platform || 'steam',
  });

  const [errors, setErrors] = useState<EnquiryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available platforms for this game
  const availablePlatforms = game.platforms && game.platforms.length > 0 ? game.platforms : [game.platform];

  const handleContactMethodChange = (method: ContactMethod) => {
    setFormData((prev) => ({
      ...prev,
      contactMethod: method,
    }));
    // Clear contact value error if switching
    if (errors.contactValue) {
      setErrors((prev) => ({ ...prev, contactValue: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: EnquiryFormErrors = {};

    // 1. Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Please enter your full name.';
    } else if (formData.customerName.trim().length > 70) {
      newErrors.customerName = 'Name must be 70 characters or less.';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Please enter at least 2 characters.';
    }

    // 2. Contact Method validation
    if (!formData.contactMethod) {
      newErrors.contactMethod = 'Please choose your preferred contact method.';
    }

    // 3. Contact Value validation
    const contact = formData.contactValue.trim();
    if (!contact) {
      newErrors.contactValue = 'Please provide your contact details.';
    } else {
      if (formData.contactMethod === 'email') {
        // Standard email validation RFC 5322 compatible regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
          newErrors.contactValue = 'Please enter a valid email address (e.g. name@example.com).';
        }
      } else {
        // WhatsApp or Phone: Permit international numbers, +, spaces, hyphens, parentheses, minimum 7 digits
        const digitsOnly = contact.replace(/\D/g, '');
        if (digitsOnly.length < 7) {
          newErrors.contactValue = 'Please enter a valid phone number (minimum 7 digits).';
        } else if (digitsOnly.length > 16) {
          newErrors.contactValue = 'Phone number is too long (maximum 16 digits).';
        }
      }
    }

    // 4. Message length validation
    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message must be 500 characters or less.';
    }

    // 5. Platform validation
    if (!formData.platform) {
      newErrors.platform = 'Please select a platform.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await enquiryService.submitEnquiry({
        gameId: game.id,
        gameSlug: game.slug,
        gameTitle: game.title,
        platform: formData.platform,
        customerName: formData.customerName,
        contactMethod: formData.contactMethod,
        contactValue: formData.contactValue,
        message: formData.message,
      });

      if (result.success) {
        onSubmitSuccess(result);
      } else {
        setErrors({ general: result.error || 'Unable to submit enquiry. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Network communication error. Please try again shortly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {errors.general && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs"
        >
          {errors.general}
        </div>
      )}

      {/* Platform Selector (if game supports multiple platforms) */}
      {availablePlatforms.length > 1 && (
        <div>
          <label htmlFor="enquiry-platform" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Selected Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="enquiry-platform">
            {availablePlatforms.map((p) => {
              const isSelected = formData.platform === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, platform: p }));
                    onPlatformChange(p);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {getPlatformName(p)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="customer-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
          Full Name <span className="text-cyan-400">*</span>
        </label>
        <input
          id="customer-name"
          type="text"
          value={formData.customerName}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, customerName: e.target.value }));
            if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }));
          }}
          placeholder="e.g. Alex Morgan"
          maxLength={70}
          aria-invalid={!!errors.customerName}
          aria-describedby={errors.customerName ? 'customer-name-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
            errors.customerName
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/30'
          }`}
        />
        {errors.customerName && (
          <p id="customer-name-error" role="alert" className="mt-1 text-xs text-rose-400 font-medium">
            {errors.customerName}
          </p>
        )}
      </div>

      {/* Preferred Contact Method */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
          Preferred Contact Method <span className="text-cyan-400">*</span>
        </span>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Preferred Contact Method">
          <button
            type="button"
            role="radio"
            aria-checked={formData.contactMethod === 'whatsapp'}
            onClick={() => handleContactMethodChange('whatsapp')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              formData.contactMethod === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={formData.contactMethod === 'email'}
            onClick={() => handleContactMethodChange('email')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              formData.contactMethod === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={formData.contactMethod === 'phone'}
            onClick={() => handleContactMethodChange('phone')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              formData.contactMethod === 'phone'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
        </div>
      </div>

      {/* Contact Value */}
      <div>
        <label htmlFor="contact-value" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
          {formData.contactMethod === 'email'
            ? 'Email Address'
            : formData.contactMethod === 'whatsapp'
            ? 'WhatsApp Phone Number'
            : 'Phone Number'}{' '}
          <span className="text-cyan-400">*</span>
        </label>
        <input
          id="contact-value"
          type={formData.contactMethod === 'email' ? 'email' : 'tel'}
          value={formData.contactValue}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, contactValue: e.target.value }));
            if (errors.contactValue) setErrors((prev) => ({ ...prev, contactValue: undefined }));
          }}
          placeholder={
            formData.contactMethod === 'email'
              ? 'e.g. alex@example.com'
              : 'e.g. +1 555 123 4567 or local format'
          }
          aria-invalid={!!errors.contactValue}
          aria-describedby={errors.contactValue ? 'contact-value-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
            errors.contactValue
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/30'
          }`}
        />
        {errors.contactValue && (
          <p id="contact-value-error" role="alert" className="mt-1 text-xs text-rose-400 font-medium">
            {errors.contactValue}
          </p>
        )}
      </div>

      {/* Message (Optional) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="enquiry-message" className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Message <span className="text-slate-400 font-normal normal-case">(Optional)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {formData.message.length}/500
          </span>
        </div>
        <textarea
          id="enquiry-message"
          rows={3}
          value={formData.message}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, message: e.target.value }));
            if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
          }}
          maxLength={500}
          placeholder="Any specific questions, preferred timing, or special requests..."
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${
            errors.message
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/30'
          }`}
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-xs text-rose-400 font-medium">
            {errors.message}
          </p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          We only use the information you provide to respond to your enquiry. We never request passwords, recovery codes, or financial credentials.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Enquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>SEND ENQUIRY</span>
          </>
        )}
      </button>
    </form>
  );
};
