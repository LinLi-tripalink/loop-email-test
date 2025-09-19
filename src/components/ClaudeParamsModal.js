"use client";

import React, { useState, useEffect } from "react";

const ClaudeParamsModal = ({
  isOpen,
  onClose,
  systemContent = "",
  extractedData,
  sharedData,
  onSave,
}) => {
  // 单独的表单字段状态
  const [formData, setFormData] = useState({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.7,
    systemMessage: "",
    messages: [],
  });
  const [errors, setErrors] = useState({});

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      // 构建用户消息内容
      const userContent = `Company Name: ${sharedData?.companyName || "未填写"}
Email Purpose: ${sharedData?.emailPurpose || "未选择"}
Scenario Description: ${sharedData?.scenarioDescription || "未填写"}
Link Replacement: ${sharedData?.link || "未提供"}

IMPORTANT: If your HTML contains any clickable links or buttons that should redirect users, please replace them with the provided link address: ${
        sharedData?.link || "未提供"
      }

CRITICAL: Do NOT add any UTM parameters to the links in your HTML. Use ONLY the exact link address provided above. Our system will automatically add UTM parameters later.

IMPORTANT OUTPUT FORMAT:
You must return your response in the following format:

**Subject Line:** [Your email subject here]

\`\`\`html
[Your complete HTML email template here]
\`\`\`

Note: Please include relevant images in your email template using [Image: description - widthxheightpx] format for visual appeal.`;

      // 构建messages数组
      const messagesArray = [
        {
          role: "user",
          content: userContent,
        },
      ];

      setFormData({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        temperature: 0.7,
        systemMessage: systemContent || "",
        messages: messagesArray,
      });
      setErrors({});
    }
  }, [isOpen, systemContent, extractedData, sharedData]);

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

    if (
      !formData.messages ||
      formData.messages.length === 0 ||
      !formData.messages[0]?.content?.trim()
    ) {
      newErrors.messages = "User消息不能为空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存参数
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const claudeParams = {
      model: formData.model,
      max_tokens: parseInt(formData.max_tokens),
      temperature: parseFloat(formData.temperature),
      system: formData.systemMessage,
      messages: formData.messages,
    };

    onSave(claudeParams);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Claude请求参数编辑
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

            {/* User Message 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={8}
                value={formData.messages[0]?.content || ""}
                onChange={(e) => {
                  const newMessages = [
                    {
                      role: "user",
                      content: e.target.value,
                    },
                  ];
                  handleInputChange("messages", newMessages);
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.messages ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="输入用户的具体请求和上下文信息..."
              />
              {errors.messages && (
                <p className="mt-1 text-sm text-red-600">{errors.messages}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                用户的具体请求和上下文信息（自动包含公司信息、邮件用途、链接等）
              </p>
            </div>
          </div>

          {/* 参数说明 */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              参数说明：
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <strong>Model:</strong>{" "}
                选择Claude模型版本，不同模型有不同的能力和成本
              </li>
              <li>
                <strong>Max Tokens:</strong> 控制响应的最大长度
              </li>
              <li>
                <strong>Temperature:</strong> 控制输出的随机性和创造性
              </li>
              <li>
                <strong>System:</strong> 设置AI的角色、风格和行为准则
              </li>
              <li>
                <strong>User:</strong> 用户的具体请求，包含上下文信息
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

export default ClaudeParamsModal;
