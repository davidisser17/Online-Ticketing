import { Outlet } from 'react-router-dom';
import CmsSidebar from '@/components/cms/CmsSidebar';
import CmsTopbar from '@/components/cms/CmsTopbar';

export default function CmsLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar — fixed width on the left */}
      <aside className="w-64 flex-shrink-0">
        <CmsSidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <CmsTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
