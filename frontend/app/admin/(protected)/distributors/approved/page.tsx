import ApprovedDistributorManager from './ApprovedDistributorManager';

export const instant = false;

export const metadata = {
  title: 'Approved Distributors Network | Yum Nest Admin',
  description: 'Manage authorized regional distributor partners, active status, and distribution territory.',
};

export default function AdminApprovedDistributorsPage() {
  return <ApprovedDistributorManager />;
}
