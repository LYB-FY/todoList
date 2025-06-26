import React, { useRef, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface DragBarProps {
  customDragBarEnabled: boolean;
}

const DragBar: React.FC<DragBarProps> = ({ customDragBarEnabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  // 拖拽相关函数
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键点击

    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = async (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    try {
      await invoke("move_window", { x: newX, y: newY });
    } catch (error) {
      console.error("移动窗口失败:", error);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 监听鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // 窗口控制函数
  const handleCloseWindow = async () => {
    try {
      const window = getCurrentWindow();
      await window.hide();
    } catch (error) {
      console.error("关闭窗口失败:", error);
    }
  };

  const handleMinimizeWindow = async () => {
    try {
      const window = getCurrentWindow();
      await window.minimize();
    } catch (error) {
      console.error("最小化窗口失败:", error);
    }
  };

  const handleMaximizeWindow = async () => {
    try {
      const window = getCurrentWindow();
      const isMaximized = await window.isMaximized();
      if (isMaximized) {
        await window.unmaximize();
      } else {
        await window.maximize();
      }
    } catch (error) {
      console.error("最大化/还原窗口失败:", error);
    }
  };

  if (!customDragBarEnabled) return null;

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      className={`drag-bar ${isDragging ? "dragging" : ""}`}
      style={{
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "relative",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
          TodoList
        </span>
      </div>
      <div
        className="window-controls"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          onClick={handleCloseWindow}
          className="window-control-button close"
          title="关闭"
        />
        <div
          onClick={handleMinimizeWindow}
          className="window-control-button minimize"
          title="最小化"
        />
        <div
          onClick={handleMaximizeWindow}
          className="window-control-button maximize"
          title="最大化"
        />
      </div>
    </div>
  );
};

export default DragBar;
