"use client";

import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { shareCopy } from "@/lib/content";

interface SharePasswordSettingsProps {
  enabled: boolean;
  password: string;
  onEnabledChange: (enabled: boolean) => void;
  onPasswordChange: (password: string) => void;
}

export function SharePasswordSettings({
  enabled,
  password,
  onEnabledChange,
  onPasswordChange,
}: SharePasswordSettingsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-none border border-border/50 bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <Label htmlFor="share-password-toggle">{shareCopy.passwordProtect}</Label>
        </div>
        <Switch
          id="share-password-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
          <Label htmlFor="share-password">{shareCopy.sharePassword}</Label>
          <Input
            id="share-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={shareCopy.sharePasswordPlaceholder}
            autoComplete="new-password"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {shareCopy.sharePasswordHint}
          </p>
        </div>
      )}
    </div>
  );
}
