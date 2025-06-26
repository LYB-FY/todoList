import { fetch } from "@tauri-apps/plugin-http";
import { config, config2 } from "../config";

export const aiSummary = (text: string) => {
  return fetch(config.apiUrl, {
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [{ role: "user", content: text }],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
  });
};

export const aiSummary2 = (text: string) => {
  return fetch(config2.apiUrl, {
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-r1-250528",
      messages: [{ role: "user", content: text }],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config2.apiKey}`,
    },
  });
};
