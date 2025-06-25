import { fetch } from "@tauri-apps/plugin-http";

export const aiSummary = (text: string) => {
  return fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [{ role: "user", content: text }],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer sk-riqmwjqzwciycysdozhyakrpbngbkdhsjqlmtxtrxtilwtce`,
    },
  });
};

export const aiSummary2 = (text: string) => {
  return fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-r1-250528",
      messages: [{ role: "user", content: text }],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer acb9a57d-b33a-4ee2-be2d-d754fdef3a72`,
    },
  });
};
