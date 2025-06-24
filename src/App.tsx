import { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Input,
  Button,
  List,
  Checkbox,
  DatePicker,
  Typography,
  Space,
  Empty,
  Tag,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// 设置dayjs为中文
dayjs.locale("zh-cn");

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  date: string;
  created_at: string; // 注意：这里改为created_at以匹配Rust后端
}

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  // 从Rust后端加载数据
  useEffect(() => {
    loadTodosFromBackend();
  }, []);

  // 加载数据函数
  const loadTodosFromBackend = async () => {
    try {
      setLoading(true);
      const loadedTodos: TodoItem[] = await invoke("load_todos");
      setTodos(loadedTodos);
    } catch (error) {
      console.error("加载数据失败:", error);
      message.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 保存数据到Rust后端
  const saveTodosToBackend = async (todosToSave: TodoItem[]) => {
    try {
      await invoke("save_todos", { todos: todosToSave });
    } catch (error) {
      console.error("保存数据失败:", error);
      message.error("保存数据失败");
    }
  };

  // 当todos变化时保存到后端
  useEffect(() => {
    if (!loading) {
      saveTodosToBackend(todos);
    }
  }, [todos, loading]);

  // 获取当前选中日期的任务
  const currentDateTodos = todos.filter(
    (todo) =>
      dayjs(todo.date).format("YYYY-MM-DD") ===
      selectedDate.format("YYYY-MM-DD")
  );

  // 添加新任务
  const addTodo = (content: string) => {
    if (!content.trim()) {
      message.warning("请输入任务内容");
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content: content.trim(),
      completed: false,
      date: selectedDate.format("YYYY-MM-DD"),
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
    message.success("任务添加成功");
  };

  // 切换任务完成状态
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 删除任务
  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    message.success("任务已删除");
  };

  // 获取任务统计信息
  const getStats = () => {
    const total = currentDateTodos.length;
    const completed = currentDateTodos.filter((todo) => todo.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const stats = getStats();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            <CheckCircleOutlined /> TodoList
          </Title>
          <Space>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="YYYY-MM-DD"
              placeholder="选择日期"
              style={{ width: 150 }}
            />
          </Space>
        </div>
      </Header>

      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* 统计信息 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}
                >
                  {stats.total}
                </div>
                <Text type="secondary">总任务</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}
                >
                  {stats.completed}
                </div>
                <Text type="secondary">已完成</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}
                >
                  {stats.pending}
                </div>
                <Text type="secondary">待完成</Text>
              </div>
            </div>
          </Card>

          {/* 添加任务 */}
          <Card style={{ marginBottom: 16 }}>
            <Search
              placeholder="输入新任务..."
              enterButton={
                <Button type="primary" icon={<PlusOutlined />}>
                  添加任务
                </Button>
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={addTodo}
              size="large"
            />
          </Card>

          {/* 任务列表 */}
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Text strong>{selectedDate.format("YYYY年MM月DD日")} 的任务</Text>
              {currentDateTodos.length > 0 && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {currentDateTodos.length} 个任务
                </Tag>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Text type="secondary">正在加载数据...</Text>
              </div>
            ) : currentDateTodos.length === 0 ? (
              <Empty
                description="今天还没有任务，添加一个吧！"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={currentDateTodos}
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
                        onConfirm={() => deleteTodo(todo.id)}
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
                          onChange={() => toggleTodo(todo.id)}
                          style={{ marginTop: 4 }}
                        />
                      }
                      title={
                        <div
                          style={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
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
                            {dayjs(todo.created_at).format("HH:mm")}
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
        </div>
      </Content>
    </Layout>
  );
}

export default App;
