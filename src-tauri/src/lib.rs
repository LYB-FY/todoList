use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TodoItem {
    pub id: String,
    pub content: String,
    pub completed: bool,
    pub date: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoData {
    pub todos: Vec<TodoItem>,
}

impl Default for TodoData {
    fn default() -> Self {
        Self { todos: Vec::new() }
    }
}

// 获取数据文件路径
fn get_data_file_path() -> Result<PathBuf> {
    let app_data = dirs::data_local_dir()
        .ok_or_else(|| anyhow::anyhow!("无法获取应用数据目录"))?
        .join("todolist");
    fs::create_dir_all(&app_data)?;
    Ok(app_data.join("todos.json"))
}

// 保存数据到文件
#[tauri::command]
async fn save_todos(todos: Vec<TodoItem>) -> Result<(), String> {
    let data = TodoData { todos };
    let file_path = get_data_file_path().map_err(|e| e.to_string())?;

    let json = serde_json::to_string_pretty(&data).map_err(|e| format!("序列化数据失败: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("写入文件失败: {}", e))?;

    println!("数据已保存到: {:?}", file_path);
    Ok(())
}

// 从文件加载数据
#[tauri::command]
async fn load_todos() -> Result<Vec<TodoItem>, String> {
    let file_path = get_data_file_path().map_err(|e| e.to_string())?;

    if !file_path.exists() {
        println!("数据文件不存在，返回空列表: {:?}", file_path);
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&file_path).map_err(|e| format!("读取文件失败: {}", e))?;

    let data: TodoData =
        serde_json::from_str(&content).map_err(|e| format!("解析数据失败: {}", e))?;

    println!("从文件加载数据: {:?}", file_path);
    Ok(data.todos)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]), /* 传递给应用程序的任意数量的参数 */
        ))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_todos, load_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
