import { Client, createSignature } from "@khang07/zing-mp3-api";
import { getZingClient } from "@/lib/zing-client";

interface ZingApiResponse {
  err: number;
  data?: {
    "128"?: string;
    "320"?: string;
    streaming?: {
      default?: {
        "128"?: string;
      };
    };
  };
}

interface ZingClientInternal {
  ctime: string;
  instance: {
    get: (url: string, config?: object) => Promise<ZingApiResponse>;
  };
}

export async function resolveZingStreamUrl(musicId: string): Promise<string> {
  const id = musicId.trim();
  if (!id) {
    throw new Error("Song id is required");
  }

  const client = getZingClient() as unknown as ZingClientInternal;
  await client.instance.get("/");

  const response = await client.instance.get(Client.API_MUSIC_PATH, {
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

  let musicURL =
    response.data?.["320"] && response.data["320"] !== "VIP"
      ? response.data["320"]
      : response.data?.["128"];

  if (response.err === -1150) {
    musicURL = await resolveVipStreamUrl(client, id);
  }

  if (!musicURL?.trim()) {
    throw new Error("Streaming URL not found");
  }

  return musicURL;
}

async function resolveVipStreamUrl(
  client: ZingClientInternal,
  id: string,
): Promise<string | undefined> {
  const retry = async (step: number): Promise<string | undefined> => {
    if (step > 3) {
      throw new Error("This track requires VIP on Zing MP3");
    }

    const retryData = await client.instance.get(Client.EXTRA_API_MUSIC_PATH, {
      params: {
        id,
        api_key: Client.API_KEY_V3,
        sig: createSignature(
          "/song/get-song-info",
          {
            ctime: client.ctime,
            id,
          },
          Client.SECRET_KEY_V3,
        ),
        version: undefined,
        apiKey: undefined,
      },
    });

    if (retryData.err === 0) {
      return retryData.data?.streaming?.default?.["128"];
    }

    return retry(step + 1);
  };

  return retry(0);
}
