import { useState, useEffect, useRef } from "react";
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
  Switch,
  Drawer,
  Divider,
  Spin,
  notification,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  PushpinOutlined,
  SettingOutlined,
  DragOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Footer } from "antd/es/layout/layout";
import { aiSummary } from "./service";

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
  completed_at?: string; // 新增完成时间字段
}

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customDragBarEnabled, setCustomDragBarEnabled] = useState(true);
  const dragRef = useRef<HTMLDivElement>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 从Rust后端加载数据
  useEffect(() => {
    loadTodosFromBackend();
    checkAutoStartStatus();
    checkAlwaysOnTopStatus();
  }, []);

  useEffect(() => {
    checkAlwaysOnTopStatus();
  }, [settingsVisible]);

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
      completed_at: undefined, // 新增任务时完成时间为undefined
    };

    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
    message.success("任务添加成功");
  };

  // 切换任务完成状态
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completed_at: !todo.completed
                ? dayjs().format("YYYY-MM-DD HH:mm:ss") // 完成时记录时间
                : undefined, // 取消完成时清除时间
            }
          : todo
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

    // 使用Tauri API移动窗口
    try {
      // 使用invoke调用Rust后端的窗口移动功能
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

  const handleAiSummary = async () => {
    // 判断选择的日期是否有任务
    const todayTodos = todos.filter(
      (todo) =>
        dayjs(todo.date).format("YYYY-MM-DD") ===
        selectedDate.format("YYYY-MM-DD")
    );
    if (todayTodos.length === 0) {
      message.warning("今日无事，勾栏听曲儿");
      return;
    }
    // 根据选择的日期的数据生成text，需要区分完成和未完成
    const completedTodos = todayTodos.filter((todo) => todo.completed);
    const uncompletedTodos = todayTodos.filter((todo) => !todo.completed);
    const text = `今日完成任务：${completedTodos
      .map((todo) => todo.content)
      .join("、")}${
      !completedTodos.length && "无"
    }。今日未完成任务：${uncompletedTodos
      .map((todo) => todo.content)
      .join("、")}${!uncompletedTodos.length && "无"}。`;
    setSummaryLoading(true);
    const response = await aiSummary(
      `以下是我今天完成和未完成的任务，${text}。帮我生成今日总结当做日报，只需要返回日报总结正文，不需要返回其他内容，丰富一下日报内容，不要自己创造内容。`
    );
    const data = await response.json();
    console.log(data);
    notification.open({
      message: `AI总结`,
      description: data.choices[0].message.content,
      duration: 0,
      btn: (
        <Button
          type="primary"
          onClick={() => {
            navigator.clipboard.writeText(data.choices[0].message.content);
            message.success("复制成功");
          }}
        >
          复制
        </Button>
      ),
    });
    setSummaryLoading(false);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: "none", // 防止拖拽时选中文本
      }}
    >
      {/* 自定义拖拽栏 */}
      {customDragBarEnabled && (
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
      )}

      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: "64px", // 增加高度以适应拖拽栏
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
              onChange={(date) => date && setSelectedDate(date)}
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
              onClick={() => setSettingsVisible(true)}
              style={{ color: "#1890ff" }}
            >
              设置
            </Button>
          </Space>
        </div>
      </Header>

      <Content
        style={{
          padding: "24px",
          background: "#f5f5f5",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
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
                  {screenWidth >= 500 ? "添加任务" : ""}
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
                            {
                              todo.completed && todo.completed_at
                                ? dayjs(todo.completed_at).format("HH:mm") // 已完成显示完成时间
                                : dayjs(todo.created_at).format("HH:mm") // 未完成显示创建时间
                            }
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

      <Footer>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" onClick={handleAiSummary}>
            今日AI总结
          </Button>
        </div>
      </Footer>

      <Drawer
        title="设置"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
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
              <Switch checked={autoStartEnabled} onChange={toggleAutoStart} />
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
                onChange={toggleAlwaysOnTop}
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
                onChange={setCustomDragBarEnabled}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              启用自定义窗口拖拽栏和控制按钮
            </Text>
          </div>
        </div>
      </Drawer>

      <Spin spinning={summaryLoading} fullscreen tip="AI总结中..."></Spin>
    </Layout>
  );
}

export default App;
