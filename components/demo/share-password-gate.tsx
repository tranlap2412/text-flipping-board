"use client";

import { useState, type FormEvent } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareCopy, siteCopy } from "@/lib/content";
import { verifySharePassword, storeUnlock } from "@/lib/share-password";

interface SharePasswordGateProps {
  lockHash: string;
  onUnlock: () => void;
}

export function SharePasswordGate({ lockHash, onUnlock }: SharePasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!password.trim() || isChecking) return;

    setIsChecking(true);
    setError(false);

    const valid = await verifySharePassword(password, lockHash);
    setIsChecking(false);

    if (valid) {
      storeUnlock(lockHash);
      onUnlock();
      return;
    }

    setError(true);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
      <div className="studio-panel w-full max-w-md border border-primary/20 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-primary/25 bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-primary/80 uppercase">
              {shareCopy.gateTitle}
            </p>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {shareCopy.gateHeading}
            </h2>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {shareCopy.gateBody}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="share-unlock-password">{shareCopy.gatePassword}</Label>
            <Input
              id="share-unlock-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder={shareCopy.gatePasswordPlaceholder}
              autoComplete="current-password"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">{shareCopy.gateWrongPassword}</p>
            )}
          </div>

          <Button type="submit" disabled={!password.trim() || isChecking}>
            <Sparkles data-icon="inline-start" />
            {isChecking ? shareCopy.gateChecking : shareCopy.gateSubmit}
          </Button>
        </form>

        <p className="mt-6 text-center text-[10px] tracking-widest text-muted-foreground uppercase">
          {siteCopy.name}
        </p>
      </div>
    </div>
  );
}
