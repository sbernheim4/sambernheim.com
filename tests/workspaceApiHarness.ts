import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createExampleApi } from "../server/example-api";

export const apiHarness = () => {
  const api = createExampleApi();
  return {
    ...api,
    request: async (method: string, url: string, body?: unknown) => {
      const request = Object.assign(
        Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []),
        { method, url },
      );
      let status = 200;
      let data: any;
      const response = {
        writeHead: (code: number) => {
          status = code;
        },
        end: (text: string) => {
          data = JSON.parse(text);
        },
      };
      await api.handleApiRequest(request as IncomingMessage, response as unknown as ServerResponse);
      return { status, data };
    },
  };
};
