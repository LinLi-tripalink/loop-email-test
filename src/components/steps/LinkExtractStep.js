"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";
import JsonResultModal from "../JsonResultModal";

const LinkExtractStep = ({ sharedData, updateSharedData }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleExtractData = async () => {
    if (!sharedData.link) {
      alert("请先在第一步填写链接");
      return;
    }

    setIsExtracting(true);
    try {
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(
        sharedData.link
      )}&meta=true&palette=true&logo=true`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      setExtractedData(data);
      updateSharedData({ extractedData: data });
      console.log("提取的数据:", data);
    } catch (error) {
      console.error("提取数据失败:", error);
      alert("提取数据失败，请检查链接是否有效");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleShowResult = () => {
    if (!extractedData && !sharedData.extractedData) {
      alert("请先提取数据");
      return;
    }
    setIsResultModalOpen(true);
  };

  const currentExtractedData = extractedData || sharedData.extractedData;

  return (
    <>
      <StepBase
        stepNumber={2}
        title="提取Link信息"
        description="解析和提取链接中的关键信息"
        icon="🔗"
      >
        <div className="space-y-4">
          {/* 显示当前链接 */}
          {sharedData.link ? (
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="text-sm text-blue-700">
                <strong>当前链接:</strong>
              </div>
              <div className="text-sm text-blue-600 break-all mt-1">
                {sharedData.link}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <p className="text-sm text-gray-600">⚠️ 请先在第一步填写链接</p>
            </div>
          )}

          <div className="text-sm text-gray-700">
            <strong>处理内容：</strong>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>解析URL结构和参数</li>
            <li>提取页面标题和描述</li>
            <li>获取页面关键元数据</li>
            <li>识别logo</li>
          </ul>

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleExtractData}
              disabled={!sharedData.link || isExtracting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.link || isExtracting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              {isExtracting ? "提取中..." : "提取数据"}
            </button>

            <button
              onClick={handleShowResult}
              disabled={!currentExtractedData}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !currentExtractedData
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              }`}
            >
              请求结果
            </button>
          </div>

          {/* 显示提取状态 */}
          {currentExtractedData && (
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-green-700">
                ✅ 数据已成功提取，点击&ldquo;请求结果&rdquo;查看详细信息
              </p>
            </div>
          )}

          <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
            <p className="text-sm text-green-700">
              🔍 智能分析链接内容，提取有价值的信息用于后续处理
            </p>
          </div>
        </div>
      </StepBase>

      {/* JSON结果弹窗 */}
      <JsonResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={currentExtractedData}
        title="链接提取结果"
      />
    </>
  );
};

export default LinkExtractStep;
