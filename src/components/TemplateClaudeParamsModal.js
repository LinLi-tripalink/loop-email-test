"use client";

import React, { useState, useEffect } from "react";

const TemplateClaudeParamsModal = ({
  isOpen,
  onClose,
  templateSystemContent = "",
  sharedData,
  onSave,
}) => {
  // 单独的表单字段状态
  const [formData, setFormData] = useState({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    temperature: 1,
    systemMessage: "",
    messagesJson: "",
  });
  const [errors, setErrors] = useState({});

  // 构建默认的messages数组
  const buildDefaultMessages = () => {
    const messages = [];

    // 第一条：从步骤2的提取结果获取title和description
    const extractedTitle =
      sharedData?.extractedData?.data?.title || "未提取到标题";
    const extractedDescription =
      sharedData?.extractedData?.data?.description || "未提取到描述";
    messages.push({
      role: "user",
      content: `Title: ${extractedTitle}\nDescription: ${extractedDescription}`,
    });

    // 第二条：步骤3的message参数
    const step3Message =
      sharedData?.claudeParams?.messages?.[0]?.content || "步骤3未设置message";
    messages.push({
      role: "user",
      content: step3Message,
    });

    // 第三条：步骤3的结果text
    const step3Result =
      sharedData?.claudeResponse?.content?.[0]?.text || "步骤3未生成结果";
    messages.push({
      role: "user",
      content: step3Result,
    });

    return messages;
  };

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      const defaultMessages = buildDefaultMessages();

      setFormData({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        temperature: 1,
        systemMessage: templateSystemContent || "",
        messagesJson: JSON.stringify(defaultMessages, null, 2),
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateSystemContent, sharedData]);

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    if (!formData.model.trim()) {
      newErrors.model = "模型不能为空";
    }

    if (
      !formData.max_tokens ||
      formData.max_tokens < 1 ||
      formData.max_tokens > 8192
    ) {
      newErrors.max_tokens = "max_tokens必须在1-8192之间";
    }

    if (formData.temperature < 0 || formData.temperature > 1) {
      newErrors.temperature = "temperature必须在0-1之间";
    }

    if (!formData.systemMessage.trim()) {
      newErrors.systemMessage = "System消息不能为空";
    }

    if (!formData.messagesJson.trim()) {
      newErrors.messagesJson = "Messages不能为空";
    } else {
      try {
        const messages = JSON.parse(formData.messagesJson);
        if (!Array.isArray(messages)) {
          newErrors.messagesJson = "Messages必须是数组格式";
        } else if (messages.length === 0) {
          newErrors.messagesJson = "Messages数组不能为空";
        } else {
          // 验证每个message的格式
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (!msg.role || !msg.content) {
              newErrors.messagesJson = `第${i + 1}条消息缺少role或content字段`;
              break;
            }
            if (!["user", "user"].includes(msg.role)) {
              newErrors.messagesJson = `第${i + 1}条消息的role必须是user`;
              break;
            }
          }
        }
      } catch (err) {
        newErrors.messagesJson = "JSON格式错误，请检查语法";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存参数
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const messages = JSON.parse(formData.messagesJson);
    const templateClaudeParams = {
      model: formData.model,
      max_tokens: parseInt(formData.max_tokens),
      temperature: parseFloat(formData.temperature),
      system: formData.systemMessage,
      messages: messages,
    };

    onSave(templateClaudeParams);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            模板Claude参数编辑
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Model 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="例如: claude-sonnet-4-20250514"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                输入Claude模型名称，例如: claude-sonnet-4-20250514
              </p>
            </div>

            {/* Max Tokens 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="8192"
                value={formData.max_tokens}
                onChange={(e) =>
                  handleInputChange("max_tokens", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.max_tokens ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="1-8192"
              />
              {errors.max_tokens && (
                <p className="mt-1 text-sm text-red-600">{errors.max_tokens}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                最大输出token数量 (1-8192)
              </p>
            </div>

            {/* Temperature 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.temperature ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.0-1.0"
              />
              {errors.temperature && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.temperature}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                创造性程度 (0=保守, 1=创造)
              </p>
            </div>

            {/* System Message 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.systemMessage}
                onChange={(e) =>
                  handleInputChange("systemMessage", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.systemMessage ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="设置AI助手的角色和行为指令..."
              />
              {errors.systemMessage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.systemMessage}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                定义AI助手的角色和行为
              </p>
            </div>

            {/* Messages JSON 编辑器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Messages (JSON格式) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={12}
                value={formData.messagesJson}
                onChange={(e) =>
                  handleInputChange("messagesJson", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm ${
                  errors.messagesJson ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='[{"role": "user", "content": "Hello"}]'
              />
              {errors.messagesJson && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.messagesJson}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                JSON格式的消息数组，自动包含步骤2和步骤3的数据
              </p>
            </div>
          </div>

          {/* 参数说明 */}
          <div className="mt-6 bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
            <h4 className="text-sm font-semibold text-orange-800 mb-2">
              Messages结构说明：
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>
                <strong>第1条:</strong> 步骤2提取的链接标题和描述 (role:
                &ldquo;user&rdquo;)
              </li>
              <li>
                <strong>第2条:</strong> 步骤3的message参数 (role:
                &ldquo;user&rdquo;)
              </li>
              <li>
                <strong>第3条:</strong> 步骤3的生成结果 (role:
                &ldquo;user&rdquo;)
              </li>
              <li>
                <strong>可编辑:</strong> 您可以修改任何消息内容或添加更多消息
              </li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            保存参数
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateClaudeParamsModal;
