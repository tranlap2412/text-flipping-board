import { Client } from "@khang07/zing-mp3-api";

/** Fresh client per request — module singleton ctime goes stale on warm serverless isolates. */
export function getZingClient(): Client {
  return new Client();
}

export function getZingClientCtime(client: Client): string {
  return (client as unknown as { ctime: string }).ctime;
}
