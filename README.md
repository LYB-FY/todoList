# TodoList 应用

一个基于 Tauri + React + Ant Design 的现代化待办事项管理应用。

## 功能特性

- 📝 创建、编辑、删除待办事项
- 📅 按日期管理任务
- ✅ 标记任务完成状态
- 📊 实时统计信息
- 💾 数据持久化存储（Rust后端）
- 🎨 现代化UI设计

## 技术栈

- **前端**: React + TypeScript + Ant Design
- **后端**: Rust (Tauri)
- **数据存储**: JSON文件（存储在系统数据目录）
- **构建工具**: Vite + Tauri CLI

## 数据存储

应用使用Rust后端进行数据存储，数据保存在系统的数据目录中：

- **Windows**: `%LOCALAPPDATA%/todolist/todos.json`
- **macOS**: `~/Library/Application Support/todolist/todos.json`
- **Linux**: `~/.local/share/todolist/todos.json`

数据以JSON格式存储，包含所有待办事项的完整信息。

## 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建应用

```bash
pnpm tauri build
```

## 项目结构

```
todoList/
├── src/                    # React前端代码
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── src-tauri/             # Rust后端代码
│   ├── src/
│   │   ├── lib.rs         # 主要逻辑和数据存储
│   │   └── main.rs        # 应用入口
│   └── Cargo.toml         # Rust依赖配置
└── package.json           # 前端依赖配置
```

## API接口

### 保存数据
```rust
#[tauri::command]
async fn save_todos(todos: Vec<TodoItem>) -> Result<(), String>
```

### 加载数据
```rust
#[tauri::command]
async fn load_todos() -> Result<Vec<TodoItem>, String>
```

## 数据格式

```typescript
interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  date: string;
  created_at: string;
}
```

## 许可证

MIT
