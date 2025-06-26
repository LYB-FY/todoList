import React from "react";
import { Layout, Typography, Space, DatePicker, Button } from "antd";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { TodoItem } from "../types";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  onSettingsClick: () => void;
  todos: TodoItem[];
  screenWidth: number;
}

const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onSettingsClick,
  todos,
  screenWidth,
}) => {
  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "64px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {screenWidth >= 500 ? (
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            <CheckCircleOutlined /> TodoList
          </Title>
        ) : (
          <div></div>
        )}
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && onDateChange(date)}
            format="YYYY-MM-DD"
            placeholder="选择日期"
            style={{ width: 150 }}
            cellRender={(current, info) => {
              if (info.type !== "date") return info.originNode;

              const dayjsCurrent = dayjs(current);
              const dateStr = dayjsCurrent.format("YYYY-MM-DD");
              const isToday = dayjsCurrent.isSame(dayjs(), "day");
              const isSelected = dayjsCurrent.isSame(selectedDate, "day");
              const hasTodos = todos.some(
                (todo) => dayjs(todo.date).format("YYYY-MM-DD") === dateStr
              );
              const hasUncompletedTodos = todos.some(
                (todo) =>
                  dayjs(todo.date).format("YYYY-MM-DD") === dateStr &&
                  !todo.completed
              );

              // 确定背景色
              let backgroundColor = "transparent";
              if (isSelected) {
                backgroundColor = "#1890ff";
              } else if (isToday) {
                backgroundColor = "#f0f8ff";
              }

              return (
                <div
                  style={{
                    position: "relative",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                    backgroundColor: backgroundColor,
                    border:
                      isToday && !isSelected ? "1px solid #1890ff" : "none",
                    margin: "0 auto",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: hasTodos ? "600" : "400",
                      color: isSelected
                        ? hasUncompletedTodos
                          ? "#ff4d4f"
                          : hasTodos
                          ? "#52c41a"
                          : "#fff"
                        : hasUncompletedTodos
                        ? "#ff4d4f"
                        : hasTodos
                        ? "#52c41a"
                        : "inherit",
                    }}
                  >
                    {dayjsCurrent.date()}
                  </span>
                  {hasTodos && (
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: isSelected
                          ? hasUncompletedTodos
                            ? "#ff4d4f"
                            : "#52c41a"
                          : hasUncompletedTodos
                          ? "#ff4d4f"
                          : "#52c41a",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        border: isSelected
                          ? "1px solid #fff"
                          : "1px solid #fff",
                      }}
                    />
                  )}
                </div>
              );
            }}
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={onSettingsClick}
            style={{ color: "#1890ff" }}
          >
            设置
          </Button>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
