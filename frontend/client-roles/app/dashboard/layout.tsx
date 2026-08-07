import ClientSidebar from "@/components/client/ClientSidebar";
import AuthWrapper from "@/components/AuthWrapper";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <div className="flex h-screen ">
        <ClientSidebar />
        <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">{children}</main>
      </div>
    </AuthWrapper>
  );
}
