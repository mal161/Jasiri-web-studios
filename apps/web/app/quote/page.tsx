import type { Metadata } from 'next';
import { QuoteBuilder } from '@/features/quote/QuoteBuilder';

export const metadata: Metadata = { title: 'Request a Quote', description: 'Configure your project and get an instant estimate. Submitting creates a CRM lead.' };

export default function QuotePage() {
  return (
    <div className="container-page py-16">
      <QuoteBuilder />
    </div>
  );
}
