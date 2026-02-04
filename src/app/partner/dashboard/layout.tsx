import PartnerSidebar from '@/components/PartnerSidebar';

export default function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerSidebar />
      <main className="lg:pl-72 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 mt-16 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
