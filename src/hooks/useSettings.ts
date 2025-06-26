import { useState } from "react";
import { message } from "antd";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const useSettings = () => {
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState(false);
  const [customDragBarEnabled, setCustomDragBarEnabled] = useState(true);

  // 检查自动启动状态
  const checkAutoStartStatus = async () => {
    try {
      const enabled = await isEnabled();
      setAutoStartEnabled(enabled);
    } catch (error) {
      console.error("检查自动启动状态失败:", error);
    }
  };

  // 切换自动启动状态
  const toggleAutoStart = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
        message.success("自动启动已开启");
      } else {
        await disable();
        message.success("自动启动已关闭");
      }
      setAutoStartEnabled(checked);
    } catch (error) {
      console.error("切换自动启动状态失败:", error);
      message.error("操作失败，请重试");
      // 恢复原状态
      setAutoStartEnabled(!checked);
    }
  };

  // 检查窗口置顶状态
  const checkAlwaysOnTopStatus = async () => {
    try {
      const window = getCurrentWindow();
      const isAlwaysOnTop = await window.isAlwaysOnTop();
      setAlwaysOnTopEnabled(isAlwaysOnTop);
    } catch (error) {
      console.error("检查窗口置顶状态失败:", error);
    }
  };

  // 切换窗口置顶状态
  const toggleAlwaysOnTop = async (checked: boolean) => {
    try {
      const window = getCurrentWindow();
      await window.setAlwaysOnTop(checked);
      setAlwaysOnTopEnabled(checked);
      message.success(checked ? "窗口已置顶" : "窗口已取消置顶");
    } catch (error) {
      console.error("切换窗口置顶状态失败:", error);
      message.error("操作失败，请重试");
      // 恢复原状态
      setAlwaysOnTopEnabled(!checked);
    }
  };

  return {
    autoStartEnabled,
    alwaysOnTopEnabled,
    customDragBarEnabled,
    setCustomDragBarEnabled,
    checkAutoStartStatus,
    checkAlwaysOnTopStatus,
    toggleAutoStart,
    toggleAlwaysOnTop,
  };
};
