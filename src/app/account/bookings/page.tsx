import { demoMode } from "@/lib/platform";
import DemoAccountBookings from "@/components/DemoAccountBookings";
import { LiveManage } from "@/components/LiveBooking";
export default function Bookings() {
  return demoMode ? <DemoAccountBookings /> : <LiveManage />;
}
