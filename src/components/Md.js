"use client";

import { useState, useRef, useEffect } from "react";

// Markdown 编辑器弹窗组件
function MarkdownEditorModal({ isOpen, onClose, initialContent = "", onSave }) {
  const [content, setContent] = useState(
    initialContent ||
      `# 欢迎使用 Markdown 编辑器

## 功能特性

- **实时预览**: 左侧编辑，右侧实时预览
- **语法高亮**: 支持 Markdown 语法高亮
- **工具栏**: 快速插入常用格式
- **快捷键**: 支持常用快捷键操作

## 示例内容

### 代码块
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

### 列表
1. 有序列表项 1
2. 有序列表项 2
   - 无序子项
   - 另一个子项

### 链接和图片
[GitHub](https://github.com)

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

---

**开始编辑吧！**`
  );

  // 当 initialContent 变化时更新内容
  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef(null);

  // 处理键盘快捷键
  const handleKeyDown = (e) => {
    // Tab 键缩进处理
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (e.shiftKey) {
        // Shift+Tab: 减少缩进
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = value.indexOf("\n", end);
        const selectedLines = value.substring(
          lineStart,
          lineEnd === -1 ? value.length : lineEnd
        );

        if (selectedLines.startsWith("  ")) {
          const newValue =
            value.substring(0, lineStart) +
            selectedLines.replace(/^  /, "") +
            value.substring(lineEnd === -1 ? value.length : lineEnd);
          setContent(newValue);
          setTimeout(() => {
            textarea.selectionStart = Math.max(0, start - 2);
            textarea.selectionEnd = Math.max(0, end - 2);
          }, 0);
        }
      } else {
        // Tab: 增加缩进
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        setContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
        }, 0);
      }
      return;
    }

    // 快捷键处理
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertText("**", "**", "粗体文字");
          break;
        case "i":
          e.preventDefault();
          insertText("*", "*", "斜体文字");
          break;
        case "k":
          e.preventDefault();
          insertText("[", "](url)", "链接文字");
          break;
        case "e":
          e.preventDefault();
          insertText("`", "`", "代码");
          break;
        case "Enter":
          e.preventDefault();
          setIsPreviewMode(!isPreviewMode);
          break;
        case "s":
          e.preventDefault();
          // 这里可以添加保存功能
          console.log("保存功能待实现");
          break;
        default:
          break;
      }
    }
  };

  // 工具栏按钮功能
  const insertText = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || placeholder) + after;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
      } else {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + placeholder.length;
      }
    }, 0);
  };

  // 简单的 Markdown 渲染函数
  const renderMarkdown = (text) => {
    return (
      text
        // 标题
        .replace(
          /^### (.*$)/gm,
          '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
        )
        .replace(
          /^## (.*$)/gm,
          '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>'
        )
        .replace(
          /^# (.*$)/gm,
          '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
        )
        // 粗体和斜体
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // 行内代码
        .replace(
          /`([^`]+)`/g,
          '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
        )
        // 链接
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>'
        )
        // 代码块
        .replace(
          /```(\w+)?\n([\s\S]*?)```/g,
          '<pre class="bg-gray-100 p-4 rounded-lg mt-4 mb-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>'
        )
        // 水平线
        .replace(/^---$/gm, '<hr class="my-6 border-gray-300">')
        // 无序列表
        .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
        // 有序列表
        .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
        // 换行
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/\n/g, "<br>")
    );
  };

  // 处理保存
  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
    onClose();
  };

  // 处理取消
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[85vh] max-w-7xl flex flex-col">
        {/* 弹窗标题栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            Markdown 编辑器
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            title="关闭"
          >
            ×
          </button>
        </div>

        {/* 工具栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => insertText("# ", "", "标题")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="标题 1"
          >
            H1
          </button>
          <button
            onClick={() => insertText("## ", "", "副标题")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            title="标题 2"
          >
            H2
          </button>
          <button
            onClick={() => insertText("**", "**", "粗体文字")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
            title="粗体"
          >
            B
          </button>
          <button
            onClick={() => insertText("*", "*", "斜体文字")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm italic"
            title="斜体"
          >
            I
          </button>
          <button
            onClick={() => insertText("`", "`", "代码")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-mono"
            title="行内代码"
          >
            Code
          </button>
          <button
            onClick={() => insertText("[", "](url)", "链接文字")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            title="链接"
          >
            Link
          </button>
          <button
            onClick={() => insertText("- ", "", "列表项")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            title="无序列表"
          >
            List
          </button>
          <button
            onClick={() => insertText("```\n", "\n```", "代码块")}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            title="代码块"
          >
            Block
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                isPreviewMode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {isPreviewMode ? "编辑模式" : "预览模式"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
            >
              保存
            </button>
          </div>
        </div>

        {/* 编辑器主体 */}
        <div className="flex-1 flex min-h-0">
          {/* 编辑区域 */}
          <div
            className={`${
              isPreviewMode ? "hidden" : "w-1/2"
            } border-r border-gray-200 flex flex-col min-h-0`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-4 resize-none outline-none font-mono text-sm leading-relaxed overflow-y-auto overflow-x-hidden border-0"
              placeholder="在这里开始编写 Markdown..."
              spellCheck={false}
              style={{ minHeight: 0, maxHeight: "100%" }}
            />
          </div>

          {/* 预览区域 */}
          <div
            className={`${
              isPreviewMode ? "w-full" : "w-1/2"
            } bg-white overflow-y-auto overflow-x-hidden min-h-0`}
          >
            <div
              className="p-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-4">${renderMarkdown(content)}</p>`,
              }}
            />
          </div>
        </div>

        {/* 状态栏 */}
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
          <div>
            字符数: {content.length} | 行数: {content.split("\n").length}
          </div>
          <div>
            快捷键: Ctrl+B 粗体 | Ctrl+I 斜体 | Ctrl+K 链接 | Ctrl+E 代码 |
            Ctrl+Enter 切换预览 | Tab 缩进
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件 - 包含触发按钮和弹窗
// 导出 MarkdownEditorModal 以供其他组件使用
export { MarkdownEditorModal };

export default function Md() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedContent, setSavedContent] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveContent = (content) => {
    setSavedContent(content);
    console.log("保存的内容:", content);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Markdown 编辑器
        </h1>

        <div className="text-center mb-8">
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            打开 Markdown 编辑器
          </button>
        </div>

        {savedContent && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              已保存的内容预览：
            </h2>
            <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {savedContent}
              </pre>
            </div>
          </div>
        )}
      </div>

      <MarkdownEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialContent={savedContent}
        onSave={handleSaveContent}
      />
    </div>
  );
}
