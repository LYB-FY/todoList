import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
// for date-picker i18n
import "dayjs/locale/zh-cn";

import { show } from "@tauri-apps/api/app";
import { TrayIcon } from "@tauri-apps/api/tray";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";

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
