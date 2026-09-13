export interface ContactConfig {
  whatsapp: string;
  email: string;
  phone: string;
  businessHours: string;
  responseWindow: string;
}

/**
 * Configurable customer contact endpoints.
 * Placeholder values are provided for development and can be swapped with production details.
 */
export const contactConfig: ContactConfig = {
  whatsapp: '+1 (555) 019-4263',
  email: 'enquiries@gamevault.example',
  phone: '+1 (555) 019-4263',
  businessHours: 'Monday - Saturday: 09:00 - 21:00 UTC',
  responseWindow: 'Typically within 2 hours',
};
