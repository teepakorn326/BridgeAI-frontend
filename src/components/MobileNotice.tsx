import React from "react";
import { Monitor } from "lucide-react";

export function MobileNotice() {
  return (
    <div className="md:hidden sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="px-4 py-3 flex items-start gap-3 text-xs leading-relaxed">
        <Monitor className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">
            BridgeAI is optimized for desktop
          </p>
          <p className="text-muted-foreground mt-0.5">
            Sign in and the full study experience work best on a laptop. Mobile
            support is on the roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
