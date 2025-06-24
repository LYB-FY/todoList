# TodoList 使用说明

## 功能概述

这个TodoList应用现在使用Rust后端进行数据存储，数据会持久化保存在系统的数据目录中。

## 主要功能

### 1. 数据存储
- ✅ 数据自动保存到Rust后端
- ✅ 应用启动时自动加载历史数据
- ✅ 数据持久化，重启应用后数据不丢失

### 2. 任务管理
- 📝 添加新任务
- ✅ 标记任务完成/未完成
- 🗑️ 删除任务
- 📅 按日期查看任务

### 3. 统计信息
- 📊 实时显示总任务数、已完成数、待完成数

## 数据存储位置

数据文件保存在以下位置：

**Windows:**
```
%LOCALAPPDATA%/todolist/todos.json
```

**macOS:**
```
~/Library/Application Support/todolist/todos.json
```

**Linux:**
```
~/.local/share/todolist/todos.json
```

## 数据格式

数据以JSON格式存储：

```json
{
  "todos": [
    {
      "id": "1705123456789",
      "content": "完成项目文档",
      "completed": false,
      "date": "2024-01-15",
      "created_at": "2024-01-15 14:30:00"
    }
  ]
}
```

## 使用步骤

1. **启动应用**
   ```bash
   pnpm tauri dev
   ```

2. **添加任务**
   - 在输入框中输入任务内容
   - 点击"添加任务"按钮或按回车键

3. **管理任务**
   - 点击复选框标记任务完成
   - 点击删除按钮删除任务
   - 使用日期选择器切换不同日期的任务

4. **查看统计**
   - 页面顶部显示当前日期的任务统计信息

## 技术特点

- **前端**: React + TypeScript + Ant Design
- **后端**: Rust (Tauri)
- **数据存储**: JSON文件
- **实时同步**: 数据变更立即保存到后端

## 故障排除

### 数据加载失败
- 检查应用数据目录权限
- 确认数据文件格式正确

### 数据保存失败
- 检查磁盘空间
- 确认应用数据目录可写

### 应用无法启动
- 检查Rust环境是否正确安装
- 确认所有依赖已安装

## 开发调试

可以在浏览器控制台中运行以下代码测试数据存储功能：

```javascript
// 测试保存数据
await window.__TAURI__.invoke("save_todos", { 
  todos: [
    {
      id: "1",
      content: "测试任务",
      completed: false,
      date: "2024-01-15",
      created_at: "2024-01-15 10:00:00"
    }
  ]
});

// 测试加载数据
const todos = await window.__TAURI__.invoke("load_todos");
console.log(todos);
``` 