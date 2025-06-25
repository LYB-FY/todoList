import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import { ConfigProvider, message } from "antd";
import zhCN from "antd/locale/zh_CN";
// for date-picker i18n
import "dayjs/locale/zh-cn";

import { TrayIcon } from "@tauri-apps/api/tray";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";
import { register } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 添加防抖标志
let isProcessingShortcut = false;

/**
 * 窗口置顶显示
 */
async function winShowFocus() {
  // 获取窗体实例
  const win = getCurrentWindow();
  // 检查窗口是否见，如果不可见则显示出来
  if (!(await win.isVisible())) {
    win.show();
  } else {
    // 检查是否处于最小化状态，如果处于最小化状态则解除最小化
    if (await win.isMinimized()) {
      await win.unminimize();
    }
    // 窗口置顶
    await win.setFocus();
  }
}

/**
 * 初始化 Tauri 相关功能
 */
async function initializeTauri() {
  await register("CommandOrControl+Alt+T", async () => {
    // 防止重复执行
    if (isProcessingShortcut) {
      return;
    }

    isProcessingShortcut = true;

    try {
      const window = getCurrentWindow();
      const isAlwaysOnTop = await window.isAlwaysOnTop();
      await window.setAlwaysOnTop(!isAlwaysOnTop);
      if (!isAlwaysOnTop) {
        winShowFocus();
      }
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

  const itemAction = async (key: any) => {
    console.log(key, "key");
    switch (key) {
      case "quit":
        const window = getCurrentWindow();
        await window.close();
        break;
      default:
        break;
    }
  };

  const menu = await Menu.new({
    items: [
      {
        id: "quit",
        text: "退出",
        action: itemAction,
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
          winShowFocus();

          break;

        default:
          break;
      }
    },
  };

  await TrayIcon.new(options);
}

// 初始化 Tauri 功能
initializeTauri().catch(console.error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
