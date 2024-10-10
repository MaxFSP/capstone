// page.tsx
import { getActiveOrg } from '~/server/queries/queries';

import DashboardView from '../_components/dashboardView';
import AdminDashboardView from '../_components/adminDashboardView';

export default async function DashboardPage() {
  const role = await getActiveOrg();

  return role === 'admin' ? <AdminDashboardView /> : <DashboardView />;
}
