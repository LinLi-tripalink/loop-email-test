"use client";

import React, { useState, useEffect } from "react";

const JimengParamsModal = ({ isOpen, onClose, sharedData, onSave }) => {
  // 单独的表单字段状态
  const [formData, setFormData] = useState({
    prompt: "",
    use_pre_llm: true,
    seed: -1,
    width: 1200,
    height: 560,
    req_key: "jimeng_t2i_v31",
  });
  const [errors, setErrors] = useState({});

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      // 从提取的图片信息中获取第一个图片的描述作为默认prompt
      const defaultPrompt =
        sharedData.extractedImages && sharedData.extractedImages.length > 0
          ? sharedData.extractedImages[0].description
          : "";

      // 从第一个图片的尺寸中提取默认宽高
      // let defaultWidth = 512;
      // let defaultHeight = 512;

      // if (sharedData.extractedImages && sharedData.extractedImages.length > 0) {
      //   const dimensions = sharedData.extractedImages[0].dimensions;
      //   const match = dimensions.match(/(\d+)x(\d+)/);
      //   if (match) {
      //     defaultWidth = parseInt(match[1]);
      //     defaultHeight = parseInt(match[2]);
      //   }
      // }

      setFormData({
        prompt: defaultPrompt,
        use_pre_llm: true,
        seed: -1,
        width: 1200,
        height: 560,
        req_key: "jimeng_t2i_v31",
      });
      setErrors({});
    }
  }, [isOpen, sharedData]);

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

    if (!formData.prompt.trim()) {
      newErrors.prompt = "提示词不能为空";
    }

    if (!formData.width || formData.width < 512 || formData.width > 2048) {
      newErrors.width = "宽度必须在512-2048之间";
    }

    if (!formData.height || formData.height < 512 || formData.height > 2048) {
      newErrors.height = "高度必须在512-2048之间";
    }

    if (!formData.req_key.trim()) {
      newErrors.req_key = "req_key不能为空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存参数
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const jimengParams = {
      prompt: formData.prompt,
      use_pre_llm: formData.use_pre_llm,
      seed: parseInt(formData.seed),
      width: parseInt(formData.width),
      height: parseInt(formData.height),
      req_key: formData.req_key,
    };

    onSave(jimengParams);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">即梦参数编辑</h3>
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
            {/* Prompt 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt (提示词) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.prompt}
                onChange={(e) => handleInputChange("prompt", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.prompt ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="请输入图片描述提示词..."
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                描述您想要生成的图片内容
              </p>
            </div>

            {/* Use Pre LLM 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文本扩写优化
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="use_pre_llm"
                    checked={formData.use_pre_llm === true}
                    onChange={() => handleInputChange("use_pre_llm", true)}
                    className="mr-2"
                  />
                  开启 (推荐用于短提示词)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="use_pre_llm"
                    checked={formData.use_pre_llm === false}
                    onChange={() => handleInputChange("use_pre_llm", false)}
                    className="mr-2"
                  />
                  关闭 (推荐用于长提示词)
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                开启后会对输入的提示词进行扩写优化
              </p>
            </div>

            {/* Seed 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                随机种子 (Seed)
              </label>
              <input
                type="number"
                value={formData.seed}
                onChange={(e) => handleInputChange("seed", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="-1"
              />
              <p className="mt-1 text-sm text-gray-500">
                -1为随机，相同种子和参数会生成相似图片
              </p>
            </div>

            {/* 尺寸字段 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  宽度 (Width) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="512"
                  max="2048"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.width ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="1200"
                />
                {errors.width && (
                  <p className="mt-1 text-sm text-red-600">{errors.width}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  高度 (Height) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="512"
                  max="2048"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.height ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="560"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                )}
              </div>
            </div>

            {/* Req Key 字段 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Req Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.req_key}
                onChange={(e) => handleInputChange("req_key", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.req_key ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="jimeng_t2i_v31"
              />
              {errors.req_key && (
                <p className="mt-1 text-sm text-red-600">{errors.req_key}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                即梦API的请求密钥标识
              </p>
            </div>
          </div>

          {/* 参数说明 */}
          <div className="mt-6 bg-pink-50 rounded-lg p-4 border-l-4 border-pink-400">
            <h4 className="text-sm font-semibold text-pink-800 mb-2">
              参数说明：
            </h4>
            <ul className="text-sm text-pink-700 space-y-1">
              <li>
                <strong>Prompt:</strong> 图片描述，支持中英文，建议详细描述
              </li>
              <li>
                <strong>文本扩写:</strong> 短提示词建议开启，长提示词建议关闭
              </li>
              <li>
                <strong>随机种子:</strong>{" "}
                控制生成的随机性，相同种子产生相似结果
              </li>
              <li>
                <strong>尺寸:</strong> 图片宽高，范512-2048像素
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

export default JimengParamsModal;
