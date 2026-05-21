import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#08080C" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", backgroundColor: "#08080C" }}>
        {children}
      </main>
    </div>
  );
}
