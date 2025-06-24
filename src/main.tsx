import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import { ConfigProvider, message } from "antd";
import zhCN from "antd/locale/zh_CN";
// for date-picker i18n
import "dayjs/locale/zh-cn";

import { show } from "@tauri-apps/api/app";
import { TrayIcon } from "@tauri-apps/api/tray";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";
import { register } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 添加防抖标志
let isProcessingShortcut = false;

await register("CommandOrControl+Shift+T", async () => {
  // 防止重复执行
  if (isProcessingShortcut) {
    return;
  }

  isProcessingShortcut = true;
  console.log("Shortcut triggered");

  try {
    const window = getCurrentWindow();
    const isAlwaysOnTop = await window.isAlwaysOnTop();
    await window.setAlwaysOnTop(!isAlwaysOnTop);
    message.success(isAlwaysOnTop ? "窗口已取消置顶" : "窗口已置顶");
  } catch (error) {
    console.error("快捷键执行失败:", error);
  } finally {
    // 延迟重置标志，防止快速重复触发
    setTimeout(() => {
      isProcessingShortcut = false;
    }, 100);
  }
});

const menu = await Menu.new({
  items: [
    {
      id: "quit",
      text: "退出",
    },
  ],
});

const options = {
  icon: (await defaultWindowIcon()) || undefined,
  menu,
  menuOnRightClick: true,
  menuOnLeftClick: false,
  action: (event: any) => {
    switch (event.type) {
      case "DoubleClick":
        const window = getCurrentWindow();
        console.log(window);

        break;

      default:
        break;
    }
  },
};

await TrayIcon.new(options);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
