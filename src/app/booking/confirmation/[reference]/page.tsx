import DemoConfirmation from "@/components/DemoConfirmation";
import { LiveManage } from "@/components/LiveBooking";
import { demoMode } from "@/lib/platform";
export default function ConfirmationPage() {
  return demoMode ? <DemoConfirmation /> : <LiveManage confirmation />;
}
