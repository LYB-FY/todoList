import { useState, useEffect } from "react";
import { Layout, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import "./App.css";

// 导入组件
import {
  DragBar,
  Header,
  StatsCard,
  AddTodoForm,
  TodoList,
  SettingsDrawer,
  Footer,
} from "./components";

// 导入 hooks
import { useTodos, useSettings, useAiSummary } from "./hooks";

// 设置dayjs为中文
dayjs.locale("zh-cn");

const { Content } = Layout;

function App() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [inputValue, setInputValue] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // 使用自定义 hooks
  const {
    todos,
    loading,
    loadTodosFromBackend,
    addTodo,
    toggleTodo,
    deleteTodo,
    getTodosByDate,
    getStats,
  } = useTodos();

  const {
    autoStartEnabled,
    alwaysOnTopEnabled,
    customDragBarEnabled,
    setCustomDragBarEnabled,
    checkAutoStartStatus,
    checkAlwaysOnTopStatus,
    toggleAutoStart,
    toggleAlwaysOnTop,
  } = useSettings();

  const { summaryLoading, handleAiSummary } = useAiSummary();

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 初始化
  useEffect(() => {
    loadTodosFromBackend();
    checkAutoStartStatus();
    checkAlwaysOnTopStatus();
  }, []);

  useEffect(() => {
    checkAlwaysOnTopStatus();
  }, [settingsVisible]);

  // 获取当前选中日期的任务
  const currentDateTodos = getTodosByDate(selectedDate);
  const stats = getStats(currentDateTodos);

  // 处理添加任务
  const handleAddTodo = (content: string) => {
    addTodo(content, selectedDate);
    setInputValue("");
  };

  // 处理AI总结
  const handleAiSummaryClick = () => {
    handleAiSummary(todos, selectedDate);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <DragBar customDragBarEnabled={customDragBarEnabled} />

      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSettingsClick={() => setSettingsVisible(true)}
        todos={todos}
        screenWidth={screenWidth}
      />

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
          <StatsCard stats={stats} />

          <AddTodoForm
            inputValue={inputValue}
            onInputChange={setInputValue}
            onAddTodo={handleAddTodo}
            screenWidth={screenWidth}
          />

          <TodoList
            todos={currentDateTodos}
            selectedDate={selectedDate}
            loading={loading}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
          />
        </div>
      </Content>

      <Footer onAiSummary={handleAiSummaryClick} />

      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        autoStartEnabled={autoStartEnabled}
        alwaysOnTopEnabled={alwaysOnTopEnabled}
        customDragBarEnabled={customDragBarEnabled}
        onAutoStartChange={toggleAutoStart}
        onAlwaysOnTopChange={toggleAlwaysOnTop}
        onCustomDragBarChange={setCustomDragBarEnabled}
      />

      <Spin spinning={summaryLoading} fullscreen tip="AI总结中..."></Spin>
    </Layout>
  );
}

export default App;
