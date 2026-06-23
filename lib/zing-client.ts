import { Client } from "@khang07/zing-mp3-api";

let client: Client | undefined;

/** Reuse one client on standalone Node — avoids re-bootstrapping cookies every request. */
export function getZingClient(): Client {
  if (!client) {
    client = new Client();
  }
  return client;
}
