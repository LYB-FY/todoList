import { useState, useEffect } from "react";
import { message } from "antd";
import { invoke } from "@tauri-apps/api/core";
import dayjs from "dayjs";
import { TodoItem } from "../types";

export const useTodos = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 从Rust后端加载数据
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

  // 添加新任务
  const addTodo = (content: string, selectedDate: dayjs.Dayjs) => {
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
      completed_at: undefined,
    };

    setTodos((prev) => [...prev, newTodo]);
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
                ? dayjs().format("YYYY-MM-DD HH:mm:ss")
                : undefined,
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

  // 获取指定日期的任务
  const getTodosByDate = (date: dayjs.Dayjs) => {
    return todos.filter(
      (todo) =>
        dayjs(todo.date).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  // 获取任务统计信息
  const getStats = (currentDateTodos: TodoItem[]) => {
    const total = currentDateTodos.length;
    const completed = currentDateTodos.filter((todo) => todo.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  return {
    todos,
    loading,
    loadTodosFromBackend,
    addTodo,
    toggleTodo,
    deleteTodo,
    getTodosByDate,
    getStats,
  };
};
