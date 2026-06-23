import { Client, createSignature } from "@khang07/zing-mp3-api";
import { getZingClient } from "@/lib/zing-client";
import { getClientCtimeAgeSec, logZingStreamEvent } from "@/lib/zing-error";

interface ZingApiPayload {
  err: number;
  msg?: string;
  data?: Record<string, unknown>;
}

interface ZingClientInternal {
  ctime: string;
  instance: {
    get: (url: string, config?: object) => Promise<ZingApiPayload>;
  };
}

export interface ZingProbeResult {
  songId: string;
  clientCtime: string;
  clientCtimeAgeSec: number;
  cookies: "ok" | "fail";
  streaming: {
    err: number;
    msg?: string;
    has128: boolean;
    has320: boolean;
    is320Vip: boolean;
  } | null;
  vipRetry: {
    err: number;
    msg?: string;
    has128: boolean;
  } | null;
  at: string;
}

export async function probeZingStream(songId: string): Promise<ZingProbeResult> {
  const id = songId.trim();
  const client = getZingClient() as unknown as ZingClientInternal;
  const result: ZingProbeResult = {
    songId: id,
    clientCtime: client.ctime,
    clientCtimeAgeSec: getClientCtimeAgeSec(client.ctime),
    cookies: "fail",
    streaming: null,
    vipRetry: null,
    at: new Date().toISOString(),
  };

  try {
    await client.instance.get("/");
    result.cookies = "ok";
  } catch (error) {
    logZingStreamEvent("error", {
      event: "probe-cookies-fail",
      songId: id,
      message: error instanceof Error ? error.message : "cookie bootstrap failed",
    });
    return result;
  }

  try {
    const streaming = await client.instance.get(Client.API_MUSIC_PATH, {
      params: {
        id,
        sig: createSignature(
          Client.API_MUSIC_PATH,
          {
            ctime: client.ctime,
            id,
            version: Client.VERSION_URL_V1,
          },
          Client.SECRET_KEY_V1,
        ),
      },
    });

    const data = streaming.data ?? {};
    result.streaming = {
      err: streaming.err,
      msg: streaming.msg,
      has128: typeof data["128"] === "string" && data["128"].length > 0,
      has320: typeof data["320"] === "string" && data["320"].length > 0,
      is320Vip: data["320"] === "VIP",
    };

    if (streaming.err === -1150) {
      const vip = await client.instance.get(Client.EXTRA_API_MUSIC_PATH, {
        params: {
          id,
          api_key: Client.API_KEY_V3,
          sig: createSignature(
            "/song/get-song-info",
            { ctime: client.ctime, id },
            Client.SECRET_KEY_V3,
          ),
          version: undefined,
          apiKey: undefined,
        },
      });

      const vipData = vip.data as
        | { streaming?: { default?: { "128"?: string } } }
        | undefined;

      result.vipRetry = {
        err: vip.err,
        msg: vip.msg,
        has128: Boolean(vipData?.streaming?.default?.["128"]),
      };
    }
  } catch (error) {
    logZingStreamEvent("error", {
      event: "probe-streaming-fail",
      songId: id,
      message: error instanceof Error ? error.message : "streaming probe failed",
    });
  }

  return result;
}
