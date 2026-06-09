import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0f1e" }}>
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
        <div className="absolute top-[40%] right-[30%] h-[300px] w-[300px] rounded-full bg-emerald-600/[0.04] blur-[80px]" />
      </div>

      {/* Sidebar */}
      <Sidebar userRole={session.user.role ?? "STAFF"} />

      {/* Main */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
