export type ContactMethod = 'whatsapp' | 'email' | 'phone';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';

export interface Enquiry {
  id: string;
  referenceNumber: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  platform: string;
  customerName: string;
  contactMethod: ContactMethod;
  contactValue: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
  adminNotes?: string;
}

export interface EnquiryFormData {
  customerName: string;
  contactMethod: ContactMethod;
  contactValue: string;
  message: string;
  platform: string;
}

export interface EnquiryFormErrors {
  customerName?: string;
  contactMethod?: string;
  contactValue?: string;
  message?: string;
  platform?: string;
  general?: string;
}

export interface EnquirySubmissionInput {
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  platform: string;
  customerName: string;
  contactMethod: ContactMethod;
  contactValue: string;
  message?: string;
}

export interface EnquirySubmissionResult {
  success: boolean;
  referenceNumber?: string;
  enquiry?: Enquiry;
  error?: string;
}
