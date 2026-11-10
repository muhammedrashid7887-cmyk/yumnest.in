import WholesaleManager from './WholesaleManager';

export const instant = false;

export const metadata = {
  title: 'Wholesale Enquiries | Yum Nest Admin',
  description: 'Manage wholesale orders, store bulk purchase enquiries, and direct WhatsApp quotations.',
};

export default function AdminWholesalePage() {
  return <WholesaleManager />;
}
