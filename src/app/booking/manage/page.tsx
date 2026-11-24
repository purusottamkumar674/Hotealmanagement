import DemoManage from "@/components/DemoManage";
import { LiveManage } from "@/components/LiveBooking";
import { demoMode } from "@/lib/platform";
export default function ManagePage() {
  return demoMode ? <DemoManage /> : <LiveManage />;
}
