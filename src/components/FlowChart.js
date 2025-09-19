"use client";

import React, { useState } from "react";
import UserInputStep from "./steps/UserInputStep";
import LinkExtractStep from "./steps/LinkExtractStep";
import EmailContentStep from "./steps/EmailContentStep";
import EmailTemplateStep from "./steps/EmailTemplateStep";
import ImageGenerateStep from "./steps/ImageGenerateStep";
import HtmlAssemblyStep from "./steps/HtmlAssemblyStep";

import system from "../utils/system.json";

const { intentPrompt, emailHtmlPrompt } = system;

const FlowChart = () => {
  const [sharedData, setSharedData] = useState({
    link: "",
    companyName: "",
    emailPurpose: "",
    scenarioDescription: "",
    extractedData: null,
    systemContent: intentPrompt,
    claudeParams: null,
    claudeResponse: null,
    templateSystemContent: emailHtmlPrompt,
    templateClaudeParams: null,
    templateClaudeResponse: null,
    extractedHtml: "",
    extractedImages: [],
    jimengParams: null,
    jimengResponse: null,
    generatedImageUrl: null,
  });

  const updateSharedData = (newData) => {
    setSharedData((prev) => ({ ...prev, ...newData }));
  };

  const stepComponents = [
    <UserInputStep
      key="step-1"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
    <LinkExtractStep
      key="step-2"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
    <EmailContentStep
      key="step-3"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
    <EmailTemplateStep
      key="step-4"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
    <ImageGenerateStep
      key="step-5"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
    <HtmlAssemblyStep
      key="step-6"
      sharedData={sharedData}
      updateSharedData={updateSharedData}
    />,
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">邮件生成流程</h1>
        <p className="text-lg text-gray-600">
          从用户输入到最终HTML的完整处理流程
        </p>
      </div>

      <div className="space-y-8">
        {stepComponents.map((StepComponent, index) => (
          <div key={`step-container-${index}`} className="relative">
            {/* 步骤组件 */}
            {StepComponent}

            {/* 连接箭头 */}
            {index < stepComponents.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-0.5 h-8 bg-blue-300"></div>
                <div className="absolute mt-6">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-blue-400"
                  >
                    <path
                      d="M10 2L10 18M10 18L4 12M10 18L16 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">流程说明</h3>
          <p className="text-gray-600">
            整个流程自动化处理用户输入，通过多个步骤最终生成完整的邮件HTML内容。
            每个步骤都经过精心设计，确保输出质量和用户体验。
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlowChart;
