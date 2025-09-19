"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";
import { MarkdownEditorModal } from "../Md";
import ClaudeParamsModal from "../ClaudeParamsModal";
import JsonResultModal from "../JsonResultModal";
import Anthropic from "@anthropic-ai/sdk";

const EmailContentStep = ({ sharedData, updateSharedData }) => {
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const anthropic = new Anthropic({
    apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || "",
    dangerouslyAllowBrowser: true,
  });

  // 处理System内容保存
  const handleSaveSystemContent = (content) => {
    updateSharedData({ systemContent: content });
    console.log("System内容已保存:", content);
  };

  // 处理Claude参数保存
  const handleSaveClaudeParams = (params) => {
    updateSharedData({ claudeParams: params });
    console.log("Claude参数已保存:", params);
  };

  // 发送Claude请求
  const handleSendRequest = async () => {
    if (!sharedData.claudeParams) {
      alert("请先填写Claude请求参数");
      return;
    }

    if (!process.env.NEXT_PUBLIC_CLAUDE_API_KEY) {
      alert("请在.env.local文件中配置NEXT_PUBLIC_CLAUDE_API_KEY");
      return;
    }

    setIsSendingRequest(true);
    try {
      const msg = await anthropic.messages.create({
        model: sharedData.claudeParams.model,
        max_tokens: sharedData.claudeParams.max_tokens,
        messages: sharedData.claudeParams.messages,
        temperature: sharedData.claudeParams.temperature,
        system: sharedData.claudeParams.system,
      });

      updateSharedData({ claudeResponse: msg });
      console.log("Claude响应:", msg);
      alert("邮件内容生成成功！");
    } catch (error) {
      console.error("Claude请求失败:", error);
      alert("请求失败，请检查参数配置");
    } finally {
      setIsSendingRequest(false);
    }
  };

  // 显示请求结果
  const handleShowResult = () => {
    if (!sharedData.claudeResponse) {
      alert("请先发送请求生成邮件内容");
      return;
    }
    setIsResultModalOpen(true);
  };

  // 导出Claude参数和结果
  const handleExport = () => {
    if (!sharedData.claudeParams && !sharedData.claudeResponse) {
      alert("没有可导出的数据");
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      step: "步骤3 - 生成邮件内容",
      claudeParams: sharedData.claudeParams,
      claudeResponse: sharedData.claudeResponse,
      systemContent: sharedData.systemContent,
      userInputData: {
        companyName: sharedData.companyName,
        emailPurpose: sharedData.emailPurpose,
        link: sharedData.link,
        scenarioDescription: sharedData.scenarioDescription,
      },
    };

    // 创建并下载JSON文件
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `email-content-step3-${new Date()
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
        stepNumber={3}
        title="生成邮件内容"
        description="基于提取的信息生成邮件正文内容"
        icon="✍️"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            <strong>内容生成：</strong>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>AI智能生成邮件正文</li>
            <li>根据链接内容定制文案</li>
            <li>优化邮件可读性和吸引力</li>
            <li>添加个性化元素</li>
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
              disabled={!sharedData.claudeParams || isSendingRequest}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.claudeParams || isSendingRequest
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              }`}
            >
              {isSendingRequest ? "发送中..." : "发送请求"}
            </button>

            <button
              onClick={handleShowResult}
              disabled={!sharedData.claudeResponse}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.claudeResponse
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              }`}
            >
              请求结果
            </button>

            <button
              onClick={handleExport}
              disabled={!sharedData.claudeParams && !sharedData.claudeResponse}
              className={`px-4 py-2 rounded-lg font-medium transition-colors col-span-2 ${
                !sharedData.claudeParams && !sharedData.claudeResponse
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              }`}
            >
              📥 导出当前参数和结果
            </button>
          </div>

          {/* 状态显示 */}
          <div className="space-y-2">
            {sharedData.systemContent && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">✅ System内容已设置</p>
              </div>
            )}

            {sharedData.claudeParams && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-700">✅ Claude参数已配置</p>
              </div>
            )}

            {sharedData.claudeResponse && (
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="text-sm text-purple-700">
                  ✅ 邮件内容已生成，点击&ldquo;请求结果&rdquo;查看详细内容
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
            <p className="text-sm text-purple-700">
              ✨ 利用AI技术生成高质量、个性化的邮件内容
            </p>
          </div>
        </div>
      </StepBase>

      {/* System内容编辑弹窗 */}
      <MarkdownEditorModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        initialContent={sharedData.systemContent}
        onSave={handleSaveSystemContent}
      />

      {/* Claude参数编辑弹窗 */}
      <ClaudeParamsModal
        isOpen={isParamsModalOpen}
        onClose={() => setIsParamsModalOpen(false)}
        systemContent={sharedData.systemContent}
        extractedData={sharedData.extractedData}
        sharedData={sharedData}
        onSave={handleSaveClaudeParams}
      />

      {/* 请求结果显示弹窗 */}
      <JsonResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={sharedData.claudeResponse}
        title="Claude响应结果"
      />
    </>
  );
};

export default EmailContentStep;
