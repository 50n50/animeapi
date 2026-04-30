import { fetchJSON, DEFAULT_HEADERS } from "./http.ts";
const ENC_API = "https://enc-dec.app/api";

export async function encrypt(text: string): Promise<string> {
  const data = await fetchJSON(`${ENC_API}/enc-kai?text=${encodeURIComponent(text)}`);
  return data.result;
}

export async function decrypt(text: string): Promise<string> {
  const res = await fetch(`${ENC_API}/dec-kai?text=${text}`, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for dec-kai`);
  const json = await res.json();
  return json.result;
}

export async function decryptMega(text: string): Promise<any> {
  const res = await fetch(`${ENC_API}/dec-mega`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, agent: DEFAULT_HEADERS["User-Agent"] }),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for dec-mega`);
  const json = await res.json();
  return json?.result || null;
}