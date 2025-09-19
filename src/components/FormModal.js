"use client";

import React, { useState } from "react";

const FormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    emailPurpose: "",
    link: "",
    scenarioDescription: "",
  });

  const [errors, setErrors] = useState({});

  const emailPurposeOptions = [
    { value: "", label: "请选择邮件用途" },
    { value: "Welcome", label: "Welcome" },
    { value: "Awakening", label: "Awakening" },
    { value: "Promotion", label: "Promotion" },
    { value: "Order updates", label: "Order updates" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除该字段的错误信息
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "公司名称不能为空";
    }

    if (!formData.emailPurpose) {
      newErrors.emailPurpose = "请选择邮件用途";
    }

    if (formData.link) {
      // 简单的URL验证
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.link)) {
        newErrors.link = "请输入有效的链接地址";
      }
    }

    if (!formData.scenarioDescription.trim()) {
      newErrors.scenarioDescription = "场景描述不能为空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // 重置表单
      setFormData({
        companyName: "",
        emailPurpose: "",
        link: "",
        scenarioDescription: "",
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    // 重置表单和错误
    setFormData({
      companyName: "",
      emailPurpose: "",
      link: "",
      scenarioDescription: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">填写表单</h3>
          <button
            onClick={handleClose}
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

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="请输入公司名称"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          {/* Email Purpose */}
          <div>
            <label
              htmlFor="emailPurpose"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Purpose <span className="text-red-500">*</span>
            </label>
            <select
              id="emailPurpose"
              name="emailPurpose"
              value={formData.emailPurpose}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emailPurpose ? "border-red-500" : "border-gray-300"
              }`}
            >
              {emailPurposeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.emailPurpose && (
              <p className="mt-1 text-sm text-red-600">{errors.emailPurpose}</p>
            )}
          </div>

          {/* Link */}
          <div>
            <label
              htmlFor="link"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Link
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.link ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://example.com"
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-600">{errors.link}</p>
            )}
          </div>

          {/* Scenario Description */}
          <div>
            <label
              htmlFor="scenarioDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Scenario Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="scenarioDescription"
              name="scenarioDescription"
              value={formData.scenarioDescription}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.scenarioDescription
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="请详细描述邮件使用场景..."
            />
            {errors.scenarioDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.scenarioDescription}
              </p>
            )}
          </div>

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
