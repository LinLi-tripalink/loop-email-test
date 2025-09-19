"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";

const HtmlAssemblyStep = ({ sharedData, updateSharedData }) => {
  const [showPreview, setShowPreview] = useState(false);

  const copyToClipboard = async () => {
    if (sharedData.extractedHtml) {
      try {
        await navigator.clipboard.writeText(sharedData.extractedHtml);
        alert("HTML代码已复制到剪贴板！");
      } catch (err) {
        console.error("复制失败:", err);
        alert("复制失败，请手动选择复制");
      }
    }
  };

  return (
    <StepBase
      stepNumber={6}
      title="组装最终HTML"
      description="将所有元素组装成完整的邮件HTML"
      icon="🔧"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-700">
          <strong>最终输出：</strong>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>整合所有生成的内容和资源</li>
          <li>优化HTML代码结构</li>
          <li>确保邮件兼容性</li>
          <li>生成可直接使用的邮件HTML</li>
        </ul>

        {/* 显示HTML内容 */}
        {sharedData.extractedHtml ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-green-800">
                ✅ 最终邮件HTML已生成
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {showPreview ? "隐藏预览" : "显示预览"}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  复制HTML
                </button>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg border-l-4 border-green-400 p-4">
              <div className="text-sm text-green-700 mb-2">
                <strong>HTML长度:</strong> {sharedData.extractedHtml.length}{" "}
                字符
              </div>

              {showPreview && (
                <div className="mt-3">
                  <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs whitespace-pre-wrap">
                      {sharedData.extractedHtml}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* HTML预览 */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">
                📧 邮件预览效果：
              </h5>
              <div className="border rounded-lg p-4 bg-white max-h-[max-content] min-w-[800px] overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{ __html: sharedData.extractedHtml }}
                  className="email-preview"
                />
              </div>
            </div>
          </div>
        ) : sharedData.templateClaudeResponse ? (
          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-700">
              ⚠️ 未从步骤4的结果中检测到HTML代码块
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
            <p className="text-sm text-gray-600">
              💡 请先完成步骤4生成邮件模板，HTML内容将自动显示在这里
            </p>
          </div>
        )}

        <div className="mt-3 p-3 bg-indigo-50 rounded border-l-4 border-indigo-400">
          <p className="text-sm text-indigo-700">
            🚀 完成最终组装，输出可直接发送的完整邮件HTML
          </p>
        </div>
      </div>
    </StepBase>
  );
};

export default HtmlAssemblyStep;
