import { Dashboard } from "@/components/admin/Dashboard";
import { LiveAdmin } from "@/components/admin/LiveAdmin";
import { demoMode } from "@/lib/platform";
export default function AdminPage() {
  return demoMode ? <Dashboard /> : <LiveAdmin section="dashboard" />;
}
