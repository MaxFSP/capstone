'use client';

import { Button } from '~/components/ui/button';
import { useRouter } from 'next/navigation';

// Import icons from React Icons
import { FiRefreshCcw } from 'react-icons/fi';

export default function AdminKanbanHeader(props: { fetchData: () => Promise<void> }) {
  const { fetchData } = props;
  const router = useRouter();

  async function handleRefresh() {
    router.refresh();
    await fetchData();
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between md:items-center">
      {/* Title Section */}
      <div className="text-center md:text-left">
        <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">Admin Dashboard</h1>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-row items-center gap-2 justify-center">
        {/* Update Page Button */}
        <Button
          className="flex items-center justify-center space-x-0 md:space-x-2 bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2"
          onClick={() => {
            void handleRefresh();
          }}
          aria-label="Update Page"
        >
          {/* Show text on medium and larger screens, icon on small screens */}
          <span className="hidden md:inline">Update Page</span>
          <FiRefreshCcw className="md:hidden text-xl" />
        </Button>
      </div>
    </div>
  );
}
