import DistributorManager from './DistributorManager';

export const instant = false;

export const metadata = {
  title: 'Distributor Applications | Yum Nest Admin',
  description: 'Manage territory distributor applications, evaluate distribution experience, and authorize partners.',
};

export default function AdminDistributorsPage() {
  return <DistributorManager />;
}
