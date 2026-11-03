import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  return (
    <div role="note" className="status-demo flex min-w-0 items-center gap-2 px-3 py-2 text-xs font-medium rounded-md">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>SAMPLE DATA / NOT LIVE — Trading values and controls are simulated. Manual workspaces are browser-local. No services connected or trades executed.</span>
    </div>
  );
}