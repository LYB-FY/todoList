import React from "react";
import { Drawer, Switch, Typography, Divider, Tag } from "antd";
import {
  RocketOutlined,
  PushpinOutlined,
  DragOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  autoStartEnabled: boolean;
  alwaysOnTopEnabled: boolean;
  customDragBarEnabled: boolean;
  onAutoStartChange: (checked: boolean) => void;
  onAlwaysOnTopChange: (checked: boolean) => void;
  onCustomDragBarChange: (checked: boolean) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
  autoStartEnabled,
  alwaysOnTopEnabled,
  customDragBarEnabled,
  onAutoStartChange,
  onAlwaysOnTopChange,
  onCustomDragBarChange,
}) => {
  return (
    <Drawer
      title="设置"
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
    >
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RocketOutlined style={{ color: "#1890ff" }} />
              <span>开机自启</span>
            </div>
            <Switch checked={autoStartEnabled} onChange={onAutoStartChange} />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            应用启动时自动运行
          </Text>
        </div>

        <Divider />

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PushpinOutlined style={{ color: "#1890ff" }} />
              <span>窗口置顶</span>
            </div>
            <Switch
              checked={alwaysOnTopEnabled}
              onChange={onAlwaysOnTopChange}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            窗口始终显示在最前面
          </Text>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue" style={{ fontSize: 11 }}>
              快捷键: Ctrl+Alt+T
            </Tag>
          </div>
        </div>

        <Divider />

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DragOutlined style={{ color: "#1890ff" }} />
              <span>自定义拖拽栏</span>
            </div>
            <Switch
              checked={customDragBarEnabled}
              onChange={onCustomDragBarChange}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            启用自定义窗口拖拽栏和控制按钮
          </Text>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
