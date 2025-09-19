"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";
import FormModal from "../FormModal";

const UserInputStep = ({ sharedData, updateSharedData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    updateSharedData(formData);
    console.log("表单提交数据:", formData);
  };

  return (
    <>
      <StepBase
        stepNumber={1}
        title="用户输入"
        description="用户输入相关信息和需求"
        icon="📝"
      >
        <div className="space-y-4">
          {/* 填写表单按钮 */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleOpenModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              填写表单
            </button>
          </div>

          {/* 显示已提交的数据 */}
          {sharedData.companyName && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                ✅ 表单已提交
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>公司名称:</strong> {sharedData.companyName}
                </p>
                <p>
                  <strong>邮件用途:</strong> {sharedData.emailPurpose}
                </p>
                {sharedData.link && (
                  <p>
                    <strong>链接:</strong> {sharedData.link}
                  </p>
                )}
                <p>
                  <strong>场景描述:</strong> {sharedData.scenarioDescription}
                </p>
              </div>
            </div>
          )}

          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-700">
              💡 这是整个流程的起始点，用户在此输入需要处理的信息
            </p>
          </div>
        </div>
      </StepBase>

      {/* 表单弹窗 */}
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default UserInputStep;
