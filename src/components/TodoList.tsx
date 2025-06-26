import React from "react";
import {
  Card,
  List,
  Checkbox,
  Space,
  Typography,
  Empty,
  Tag,
  Popconfirm,
  Button,
} from "antd";
import { DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { TodoItem } from "../types";

const { Text } = Typography;

interface TodoListProps {
  todos: TodoItem[];
  selectedDate: Dayjs;
  loading: boolean;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  selectedDate,
  loading,
  onToggleTodo,
  onDeleteTodo,
}) => {
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Text strong>{selectedDate.format("YYYY年MM月DD日")} 的任务</Text>
        {todos.length > 0 && (
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {todos.length} 个任务
          </Tag>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Text type="secondary">正在加载数据...</Text>
        </div>
      ) : todos.length === 0 ? (
        <Empty
          description="今天还没有任务，添加一个吧！"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={todos}
          renderItem={(todo) => (
            <List.Item
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
                opacity: todo.completed ? 0.6 : 1,
              }}
              actions={[
                <Popconfirm
                  title="确定要删除这个任务吗？"
                  onConfirm={() => onDeleteTodo(todo.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => onToggleTodo(todo.id)}
                    style={{ marginTop: 4 }}
                  />
                }
                title={
                  <div
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "#999" : "#000",
                    }}
                  >
                    {todo.content}
                  </div>
                }
                description={
                  <Space size="small">
                    <ClockCircleOutlined style={{ color: "#999" }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {todo.completed && todo.completed_at
                        ? dayjs(todo.completed_at).format("HH:mm")
                        : dayjs(todo.created_at).format("HH:mm")}
                    </Text>
                    {todo.completed && <Tag color="success">已完成</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default TodoList;
