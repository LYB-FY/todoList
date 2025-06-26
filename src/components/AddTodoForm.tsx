import React from "react";
import { Card, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

interface AddTodoFormProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTodo: (content: string) => void;
  screenWidth: number;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({
  inputValue,
  onInputChange,
  onAddTodo,
  screenWidth,
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Search
        placeholder="输入新任务..."
        enterButton={
          <Button type="primary" icon={<PlusOutlined />}>
            {screenWidth >= 500 ? "添加任务" : ""}
          </Button>
        }
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onSearch={onAddTodo}
        size="large"
      />
    </Card>
  );
};

export default AddTodoForm;
