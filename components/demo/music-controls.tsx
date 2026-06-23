"use client";

import { useState } from "react";
import { Globe, Music, Search } from "lucide-react";
import { BackgroundMusicPlayer } from "@/components/background-music-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZING_API_ENABLED } from "@/lib/deploy";
import { MUSIC_PRESETS } from "@/lib/music-presets";
import { musicCopy } from "@/lib/content";
import {
  getMusicPlaybackUrl,
  type MusicSelection,
  type OnlineSong,
} from "@/lib/music-types";

interface MusicControlsProps {
  selection: MusicSelection;
  playing: boolean;
  playTrigger: number;
  onSelectionChange: (selection: MusicSelection) => void;
  onPlayingChange: (playing: boolean) => void;
  onPlayRequest: () => void;
  onPlayBlocked: () => void;
}

export function MusicControls({
  selection,
  playing,
  playTrigger,
  onSelectionChange,
  onPlayingChange,
  onPlayRequest,
  onPlayBlocked,
}: MusicControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OnlineSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const playbackUrl = getMusicPlaybackUrl(selection);

  const handlePresetChange = (presetId: string) => {
    onSelectionChange({
      mode: "preset",
      presetId,
      onlineSong: null,
    });
    if (playing) onPlayRequest();
  };

  const handleOnlineSelect = (song: OnlineSong) => {
    onSelectionChange({
      mode: "online",
      presetId: selection.presetId,
      onlineSong: song,
    });
    if (playing) onPlayRequest();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/zing/search?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      const body = await res.json();
      if (res.ok && body.success && Array.isArray(body.data)) {
        setSearchResults(body.data);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-3.5 w-3.5 text-primary" />
          <Label>{musicCopy.background}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="music-toggle" className="text-xs text-muted-foreground">
            {playing ? "On" : "Off"}
          </Label>
          <Switch
            id="music-toggle"
            checked={playing}
            onCheckedChange={(next) => {
              onPlayingChange(next);
              if (next) onPlayRequest();
            }}
          />
        </div>
      </div>

      <Tabs
        value={ZING_API_ENABLED ? selection.mode : "preset"}
        onValueChange={(mode) => {
          if (!ZING_API_ENABLED) return;
          onSelectionChange({
            ...selection,
            mode: mode as MusicSelection["mode"],
          });
        }}
      >
        {ZING_API_ENABLED ? (
          <TabsList className="w-full">
            <TabsTrigger value="preset" className="flex-1">
              Presets
            </TabsTrigger>
            <TabsTrigger value="online" className="flex-1">
              Zing MP3
            </TabsTrigger>
          </TabsList>
        ) : null}

        <TabsContent value="preset" className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{musicCopy.presetsNote}</p>
          <Select value={selection.presetId} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={musicCopy.selectTrack} />
            </SelectTrigger>
            <SelectContent>
              {MUSIC_PRESETS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>

        {ZING_API_ENABLED ? (
        <TabsContent value="online" className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{musicCopy.zingHint}</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={musicCopy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search data-icon="inline-start" />
              {isSearching ? "…" : musicCopy.search}
            </Button>
          </div>

          {selection.onlineSong && (
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              <span className="font-semibold text-foreground">
                {selection.onlineSong.name}
              </span>
              <span> — {selection.onlineSong.artist}</span>
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="custom-scrollbar flex max-h-40 flex-col gap-1 overflow-y-auto rounded-none border border-border/50 bg-muted/20 p-1">
              {searchResults.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => handleOnlineSelect(song)}
                  className={`flex cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-left transition-colors ${selection.onlineSong?.id === song.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {song.thumbnail ? (
                    <img
                      src={song.thumbnail}
                      alt={song.name}
                      className="h-7 w-7 rounded-none border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-none border border-border bg-muted">
                      <Music className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-semibold leading-tight">
                      {song.name}
                    </span>
                    <span className="truncate text-[10px] leading-none opacity-75">
                      {song.artist}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
        ) : null}
      </Tabs>

      <BackgroundMusicPlayer
        url={playbackUrl}
        playing={playing}
        playTrigger={playTrigger}
        onPlayBlocked={onPlayBlocked}
        hidden
      />
    </div>
  );
}
