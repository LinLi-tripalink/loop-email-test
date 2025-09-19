"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";
import { MarkdownEditorModal } from "../Md";
import TemplateClaudeParamsModal from "../TemplateClaudeParamsModal";
import JsonResultModal from "../JsonResultModal";
import Anthropic from "@anthropic-ai/sdk";

const EmailTemplateStep = ({ sharedData, updateSharedData }) => {
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const anthropic = new Anthropic({
    apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || "",
    dangerouslyAllowBrowser: true,
  });

  // 处理模板System内容保存
  const handleSaveTemplateSystemContent = (content) => {
    updateSharedData({ templateSystemContent: content });
    console.log("模板System内容已保存:", content);
  };

  // 处理模板Claude参数保存
  const handleSaveTemplateClaudeParams = (params) => {
    updateSharedData({ templateClaudeParams: params });
    console.log("模板Claude参数已保存:", params);
  };

  // 从Claude响应中提取HTML和图片信息
  const extractHtmlAndImages = (responseText) => {
    let extractedHtml = "";
    let extractedImages = [];

    // 提取HTML代码块
    const htmlMatch = responseText.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) {
      extractedHtml = htmlMatch[1].trim();
    }

    // 提取图片信息 [Image: description - dimensions]
    // 修改正则表达式以正确匹配包含逗号的描述
    const imageMatches = responseText.match(/\[Image: (.+?) - ([^\]]+)\]/g);
    if (imageMatches) {
      extractedImages = imageMatches
        .map((match) => {
          // 使用更精确的正则表达式来分离描述和尺寸
          const parts = match.match(/\[Image: (.+?) - ([^\]]+)\]/);
          if (parts && parts.length >= 3) {
            return {
              description: parts[1].trim(),
              dimensions: parts[2].trim(),
              fullText: match,
            };
          }
          return null;
        })
        .filter(Boolean); // 过滤掉null值
    }

    return { extractedHtml, extractedImages };
  };

  // 发送模板Claude请求
  const handleSendRequest = async () => {
    if (!sharedData.templateClaudeParams) {
      alert("请先填写模板Claude请求参数");
      return;
    }

    if (!process.env.NEXT_PUBLIC_CLAUDE_API_KEY) {
      alert("请在.env.local文件中配置NEXT_PUBLIC_CLAUDE_API_KEY");
      return;
    }

    setIsSendingRequest(true);
    try {
      const msg = await anthropic.messages.create({
        model: sharedData.templateClaudeParams.model,
        max_tokens: sharedData.templateClaudeParams.max_tokens,
        messages: sharedData.templateClaudeParams.messages,
        temperature: sharedData.templateClaudeParams.temperature,
        system: sharedData.templateClaudeParams.system,
      });

      // 提取HTML和图片信息
      const responseText = msg.content[0]?.text || "";
      const { extractedHtml, extractedImages } =
        extractHtmlAndImages(responseText);

      updateSharedData({
        templateClaudeResponse: msg,
        extractedHtml: extractedHtml,
        extractedImages: extractedImages,
      });

      console.log("模板Claude响应:", msg);
      console.log("提取的HTML:", extractedHtml);
      console.log("提取的图片:", extractedImages);
      alert("邮件模板生成成功！HTML和图片信息已提取");
    } catch (error) {
      console.error("模板Claude请求失败:", error);
      alert("请求失败，请检查参数配置");
    } finally {
      setIsSendingRequest(false);
    }
  };

  // 显示请求结果
  const handleShowResult = () => {
    if (!sharedData.templateClaudeResponse) {
      alert("请先发送请求生成邮件模板");
      return;
    }
    setIsResultModalOpen(true);
  };

  // 导出模板Claude参数和结果
  const handleExport = () => {
    if (
      !sharedData.templateClaudeParams &&
      !sharedData.templateClaudeResponse
    ) {
      alert("没有可导出的数据");
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      step: "步骤4 - 生成Email模板",
      templateClaudeParams: sharedData.templateClaudeParams,
      templateClaudeResponse: sharedData.templateClaudeResponse,
      templateSystemContent: sharedData.templateSystemContent,
      extractedHtml: sharedData.extractedHtml,
      extractedImages: sharedData.extractedImages,
      previousStepsData: {
        companyName: sharedData.companyName,
        emailPurpose: sharedData.emailPurpose,
        link: sharedData.link,
        scenarioDescription: sharedData.scenarioDescription,
        extractedData: sharedData.extractedData,
        claudeResponse: sharedData.claudeResponse,
      },
    };

    // 创建并下载JSON文件
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `email-template-step4-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("数据已导出为JSON文件！");
  };

  return (
    <>
      <StepBase
        stepNumber={4}
        title="生成Email模板"
        description="创建符合邮件格式的HTML模板"
        icon="📧"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            <strong>模板特性：</strong>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>响应式邮件模板设计</li>
            <li>兼容主流邮件客户端</li>
            <li>优化邮件显示效果</li>
            <li>支持自定义样式配置</li>
          </ul>

          {/* 按钮组 */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setIsSystemModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              填写System
            </button>

            <button
              onClick={() => setIsParamsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
            >
              填写Claude参数
            </button>

            <button
              onClick={handleSendRequest}
              disabled={!sharedData.templateClaudeParams || isSendingRequest}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.templateClaudeParams || isSendingRequest
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              }`}
            >
              {isSendingRequest ? "发送中..." : "发送请求"}
            </button>

            <button
              onClick={handleShowResult}
              disabled={!sharedData.templateClaudeResponse}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.templateClaudeResponse
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              }`}
            >
              请求结果
            </button>

            <button
              onClick={handleExport}
              disabled={
                !sharedData.templateClaudeParams &&
                !sharedData.templateClaudeResponse
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors col-span-2 ${
                !sharedData.templateClaudeParams &&
                !sharedData.templateClaudeResponse
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              }`}
            >
              📥 导出当前参数和结果
            </button>
          </div>

          {/* 状态显示 */}
          <div className="space-y-2">
            {sharedData.templateSystemContent && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">✅ 模板System内容已设置</p>
              </div>
            )}

            {sharedData.templateClaudeParams && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-700">
                  ✅ 模板Claude参数已配置
                </p>
              </div>
            )}

            {sharedData.templateClaudeResponse && (
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="text-sm text-purple-700">
                  ✅ 邮件模板已生成，点击&ldquo;请求结果&rdquo;查看详细内容
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
            <p className="text-sm text-orange-700">
              📱 创建专业的邮件模板，确保在各种设备上完美显示
            </p>
          </div>
        </div>
      </StepBase>

      {/* 模板System内容编辑弹窗 */}
      <MarkdownEditorModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        initialContent={sharedData.templateSystemContent}
        onSave={handleSaveTemplateSystemContent}
      />

      {/* 模板Claude参数编辑弹窗 */}
      <TemplateClaudeParamsModal
        isOpen={isParamsModalOpen}
        onClose={() => setIsParamsModalOpen(false)}
        templateSystemContent={sharedData.templateSystemContent}
        sharedData={sharedData}
        onSave={handleSaveTemplateClaudeParams}
      />

      {/* 请求结果显示弹窗 */}
      <JsonResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={sharedData.templateClaudeResponse}
        title="模板Claude响应结果"
      />
    </>
  );
};

export default EmailTemplateStep;
