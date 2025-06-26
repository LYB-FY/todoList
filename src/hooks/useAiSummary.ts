import { useState } from "react";
import { message, notification } from "antd";
import dayjs from "dayjs";
import { aiSummary } from "../service";
import { TodoItem } from "../types";

export const useAiSummary = () => {
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleAiSummary = async (
    todos: TodoItem[],
    selectedDate: dayjs.Dayjs
  ) => {
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

    try {
      const response = await aiSummary(
        `以下是我今天完成和未完成的任务，${text}。帮我生成今日总结当做日报，只需要返回日报总结正文，不需要返回其他内容，丰富一下日报内容，不要自己创造内容。`
      );
      const data = await response.json();

      notification.open({
        message: `AI总结`,
        description: data.choices[0].message.content,
        duration: 0,
      });
    } catch (error) {
      console.error("AI总结失败:", error);
      message.error("AI总结失败，请重试");
    } finally {
      setSummaryLoading(false);
    }
  };

  return {
    summaryLoading,
    handleAiSummary,
  };
};
