import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s your inventory overview for today.
        </p>
      </div>

      {/* Role badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
        Signed in as {session.user.role}
      </div>

      {/* Placeholder stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products",   value: "—", color: "blue" },
          { label: "Low Stock Items",  value: "—", color: "amber" },
          { label: "Expiring Soon",    value: "—", color: "red" },
          { label: "Total Suppliers",  value: "—", color: "emerald" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="stat-card glass rounded-2xl p-5"
          >
            <p className="text-xs font-medium text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500">
        Dashboard widgets loading — connect your database to see live data.
      </p>
    </div>
  );
}
