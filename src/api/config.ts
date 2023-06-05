export interface APILayout<T> {
  msg: any;
  code: number;
  data: T;
  message: string;
}
export const requestPrefix = {
  9002: "/v1/user",
  9003: "/v1/up",
  9004: "/v1/co_admin",
  9005: "/v1/co",
  9006: "/v1/base",
  9007: "/v1/kf",
  9008: "/v1/cm",
  9009: "/v1/stat",
  9018: "/v1/web"
};

export const server_url = "mall.com";

export const base = {
  // @ts-ignore
  api_host: process.env.NODE_ENV !== "production" ? `https://apitest.${server_url}` : `https://api.${server_url}`,
  // @ts-ignore
  up_host: process.env.NODE_ENV !== "production" ? `https://apitest.${server_url}` : `https://up.${server_url}`,
  // @ts-ignore
  file_host: process.env.NODE_ENV !== "production" ? `https://test.${server_url}/file` : `https://file.${server_url}`,
  // @ts-ignore
  api_stat: process.env.NODE_ENV !== "production" ? `http://192.168.2.53:9009/api` : `https://api.${server_url}`
};
