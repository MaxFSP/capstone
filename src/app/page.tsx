import { getActiveOrg } from '~/server/queries/queries';
import HomeView from './_components/homeView';
import AdminHomeView from './_components/adminHomeView';

export default async function HomePage() {
  const role = await getActiveOrg();

  return role === 'admin' ? <AdminHomeView /> : <HomeView />;
}
