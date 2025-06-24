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

await register("CommandOrControl+Shift+T", async () => {
  console.log("Shortcut triggered");
  const window = getCurrentWindow();
  const isAlwaysOnTop = await window.isAlwaysOnTop();
  await window.setAlwaysOnTop(!isAlwaysOnTop);
  message.success(isAlwaysOnTop ? "窗口已取消置顶" : "窗口已置顶");
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
  icon: await defaultWindowIcon(),
  menu,
  menuOnRightClick: true,
  menuOnLeftClick: false,
  action: (event: any) => {
    switch (event.type) {
      case "DoubleClick":
        console.log("DoubleClick");
        show();
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
