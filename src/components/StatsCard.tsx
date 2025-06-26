import React from "react";
import { Card, Typography } from "antd";
import { TodoStats } from "../types";

const { Text } = Typography;

interface StatsCardProps {
  stats: TodoStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
            {stats.total}
          </div>
          <Text type="secondary">总任务</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
            {stats.completed}
          </div>
          <Text type="secondary">已完成</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}>
            {stats.pending}
          </div>
          <Text type="secondary">待完成</Text>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
