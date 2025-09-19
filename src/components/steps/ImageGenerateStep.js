"use client";

import React, { useState } from "react";
import StepBase from "./StepBase";
import JimengParamsModal from "../JimengParamsModal";
import JsonResultModal from "../JsonResultModal";

const ImageGenerateStep = ({ sharedData, updateSharedData }) => {
  const [isParamsModalOpen, setIsParamsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");

  // 处理即梦参数保存
  const handleSaveJimengParams = (params) => {
    updateSharedData({ jimengParams: params });
    console.log("即梦参数已保存:", params);
  };

  // 生成UTC时间戳
  const getUTCTimestamp = () => {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  };

  // 生成短日期
  const getShortDate = (timestamp) => {
    return timestamp.substring(0, 8);
  };

  // HMAC-SHA256签名 - 支持字符串和Uint8Array作为key
  const hmacSHA256 = async (key, message) => {
    const encoder = new TextEncoder();
    const keyData = typeof key === "string" ? encoder.encode(key) : key;
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    return new Uint8Array(signature);
  };

  // 将字节数组转换为十六进制字符串
  const bytesToHex = (bytes) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // 生成签名 - 按照火山引擎标准流程
  const generateSignature = async (
    method,
    uri,
    query,
    headers,
    body,
    secretKey,
    timestamp,
    shortDate
  ) => {
    // 1. 计算请求体哈希
    const bodyHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(body))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );

    // 2. 构建规范化请求
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key]}`)
      .join("\n");

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";");

    const canonicalRequest = [
      method,
      uri,
      query,
      canonicalHeaders,
      "",
      signedHeaders,
      bodyHash,
    ].join("\n");

    console.log("规范化请求:", canonicalRequest);

    // 3. 计算规范化请求哈希
    const canonicalRequestHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(canonicalRequest))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );

    // 4. 构建待签名字符串
    const credentialScope = `${shortDate}/cn-north-1/cv/request`;
    const stringToSign = [
      "HMAC-SHA256",
      timestamp,
      credentialScope,
      canonicalRequestHash,
    ].join("\n");

    console.log("待签名字符串:", stringToSign);

    // 5. 计算签名密钥（逐步派生）
    const kDate = await hmacSHA256(secretKey, shortDate);
    const kRegion = await hmacSHA256(kDate, "cn-north-1");
    const kService = await hmacSHA256(kRegion, "cv");
    const kSigning = await hmacSHA256(kService, "request");

    // 6. 计算最终签名
    const signatureBytes = await hmacSHA256(kSigning, stringToSign);
    const signature = bytesToHex(signatureBytes);

    console.log("最终签名:", signature);
    return signature;
  };

  // 查询任务结果
  const queryTaskResult = async (taskId, accessKeyId, secretKey) => {
    try {
      const timestamp = getUTCTimestamp();
      const shortDate = getShortDate(timestamp);

      // 构建请求体
      const requestBody = JSON.stringify({
        req_key: "jimeng_t2i_v31",
        task_id: taskId,
        req_json: JSON.stringify({ return_url: true }),
      });

      // 构建headers
      const contentSHA256 = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(requestBody))
        .then((hash) =>
          Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        );

      const headers = {
        "Content-Type": "application/json",
        Host: "visual.volcengineapi.com",
        "X-Content-Sha256": contentSHA256,
        "X-Date": timestamp,
      };

      // 生成签名
      const signature = await generateSignature(
        "POST",
        "/",
        "Action=CVSync2AsyncGetResult&Version=2022-08-31",
        headers,
        requestBody,
        secretKey,
        timestamp,
        shortDate
      );

      // 构建Authorization header
      const credentialScope = `${shortDate}/cn-north-1/cv/request`;
      const signedHeaders = "content-type;host;x-content-sha256;x-date";
      const authorization = `HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      headers["Authorization"] = authorization;

      // 发送查询请求
      const response = await fetch(
        "https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31",
        {
          method: "POST",
          headers: headers,
          body: requestBody,
        }
      );

      return await response.json();
    } catch (error) {
      console.error("查询任务结果失败:", error);
      throw error;
    }
  };

  // 轮询查询结果
  const pollTaskResult = async (taskId, accessKeyId, secretKey) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 30; // 最多轮询30次
    const pollInterval = 2000; // 每2秒查询一次

    const poll = async () => {
      attempts++;
      setPollingStatus(`正在查询结果... (${attempts}/${maxAttempts})`);

      try {
        const result = await queryTaskResult(taskId, accessKeyId, secretKey);
        console.log(`查询结果 (第${attempts}次):`, result);

        // 检查任务是否完成 - 修正响应结构检查
        if (result.code === 10000 && result.data) {
          // 检查任务状态
          if (
            result.data.status === "done" ||
            result.data.status === "success"
          ) {
            setPollingStatus("图片生成完成！");
            setIsPolling(false);
            // 更新响应数据，包含生成的图片信息
            updateSharedData({
              jimengResponse: result,
              generatedImageUrl: result.data.binary_data_base64
                ? `data:image/png;base64,${result.data.binary_data_base64}`
                : result.data.image_urls && result.data.image_urls.length > 0
                ? result.data.image_urls[0]
                : null,
            });
            alert("图片生成完成！请查看结果。");
            return;
          }

          // 检查是否失败
          if (
            result.data.status === "failed" ||
            result.data.status === "error"
          ) {
            setPollingStatus("图片生成失败");
            setIsPolling(false);
            updateSharedData({ jimengResponse: result });
            alert("图片生成失败，请查看错误信息。");
            return;
          }

          // 任务仍在处理中，继续轮询
          if (
            result.data.status === "running" ||
            result.data.status === "pending"
          ) {
            setPollingStatus(
              `图片生成中... 状态: ${result.data.status} (${attempts}/${maxAttempts})`
            );
          }
        }

        // 继续轮询
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setPollingStatus("查询超时，请手动检查结果");
          setIsPolling(false);
          alert("查询超时，任务可能仍在处理中。");
        }
      } catch (error) {
        console.error("轮询查询失败:", error);
        setPollingStatus("查询失败");
        setIsPolling(false);
        alert("查询失败: " + error.message);
      }
    };

    // 开始轮询
    setTimeout(poll, 1000); // 1秒后开始第一次查询
  };

  // 发送即梦请求
  const handleSendRequest = async () => {
    if (!sharedData.jimengParams) {
      alert("请先填写即梦参数");
      return;
    }

    const accessKeyId = process.env.NEXT_PUBLIC_VOLCENGINE_ACCESS_KEY_ID || "";
    const secretKey = process.env.NEXT_PUBLIC_VOLCENGINE_SECRET_KEY || "";

    if (!accessKeyId || !secretKey) {
      alert(
        "请在.env.local文件中配置火山引擎API密钥：NEXT_PUBLIC_VOLCENGINE_ACCESS_KEY_ID 和 NEXT_PUBLIC_VOLCENGINE_SECRET_KEY"
      );
      return;
    }

    setIsSendingRequest(true);
    try {
      const timestamp = getUTCTimestamp();
      const shortDate = getShortDate(timestamp);

      // 构建请求体
      const requestBody = JSON.stringify({
        ...sharedData.jimengParams,
      });

      // 构建headers
      const contentSHA256 = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(requestBody))
        .then((hash) =>
          Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        );

      const headers = {
        "Content-Type": "application/json",
        Host: "visual.volcengineapi.com",
        "X-Content-Sha256": contentSHA256,
        "X-Date": timestamp,
      };

      // 生成签名
      const signature = await generateSignature(
        "POST",
        "/",
        "Action=CVSync2AsyncSubmitTask&Version=2022-08-31",
        headers,
        requestBody,
        secretKey,
        timestamp,
        shortDate
      );

      // 构建Authorization header
      const credentialScope = `${shortDate}/cn-north-1/cv/request`;
      const signedHeaders = "content-type;host;x-content-sha256;x-date";
      const authorization = `HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      headers["Authorization"] = authorization;

      console.log("请求Headers:", headers);
      console.log("请求Body:", requestBody);

      // 发送请求
      const response = await fetch(
        "https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31",
        {
          method: "POST",
          headers: headers,
          body: requestBody,
        }
      );

      const result = await response.json();
      console.log("提交任务响应:", result);

      // 检查任务是否提交成功 - 修正响应结构检查
      if (result.code === 10000 && result.data && result.data.task_id) {
        const taskId = result.data.task_id;
        updateSharedData({ jimengResponse: result });
        alert("图片生成任务已提交！开始查询结果...");

        // 开始轮询查询结果
        await pollTaskResult(taskId, accessKeyId, secretKey);
      } else {
        alert(`任务提交失败: ${result.message || "未知错误"}`);
        updateSharedData({ jimengResponse: result });
      }
    } catch (error) {
      console.error("即梦请求失败:", error);
      alert("请求失败，请检查参数配置: " + error.message);
    } finally {
      setIsSendingRequest(false);
    }
  };

  // 显示请求结果
  const handleShowResult = () => {
    if (!sharedData.jimengResponse) {
      alert("请先发送请求生成图片");
      return;
    }
    setIsResultModalOpen(true);
  };

  // 插入图片到HTML
  const handleInsertToHtml = () => {
    if (!sharedData.generatedImageUrl) {
      alert("请先生成图片");
      return;
    }

    if (!sharedData.extractedHtml) {
      alert("未找到HTML内容");
      return;
    }

    // 匹配所有img标签并替换src属性
    const imgPattern = /<img\s+[^>]*>/gi;
    let updatedHtml = sharedData.extractedHtml;
    let replacementCount = 0;

    updatedHtml = updatedHtml.replace(imgPattern, (match) => {
      replacementCount++;
      // 替换img标签中的src属性为生成的图片URL
      return match.replace(
        /src\s*=\s*["'][^"']*["']/i,
        `src="${sharedData.generatedImageUrl}"`
      );
    });

    // 如果没找到img标签，查找图片标记并插入新的img标签
    if (replacementCount === 0) {
      const imageMarkPattern = /\[Image: (.+?) - ([^\]]+)\]/g;
      let imageMarkReplacements = 0;

      updatedHtml = updatedHtml.replace(
        imageMarkPattern,
        (match, description, dimensions) => {
          imageMarkReplacements++;
          // 解析尺寸
          const dimensionMatch = dimensions.match(/(\d+)x(\d+)/);
          const width = dimensionMatch ? dimensionMatch[1] : "600";
          const height = dimensionMatch ? dimensionMatch[2] : "280";

          // 创建新的img标签
          return `<img src="${
            sharedData.generatedImageUrl
          }" alt="${description.trim()}" style="width: 100%; height: 280px; max-width: 600px; display: block;object-fit:cover">`;
        }
      );

      if (imageMarkReplacements === 0) {
        alert("未找到img标签或图片标记");
        return;
      }

      // 更新HTML内容
      updateSharedData({ extractedHtml: updatedHtml });
      alert(
        `图片已成功插入到HTML中！创建了${imageMarkReplacements}个新的img标签`
      );
      console.log("HTML已更新，图片标记已转换为img标签:", updatedHtml);
    } else {
      // 更新HTML内容
      updateSharedData({ extractedHtml: updatedHtml });
      alert(
        `图片已成功插入到HTML中！替换了${replacementCount}个img标签的src属性`
      );
      console.log("HTML已更新，img标签src已替换:", updatedHtml);
    }
  };

  return (
    <>
      <StepBase
        stepNumber={5}
        title="生成图片"
        description="生成或处理邮件中需要的图片资源"
        icon="🖼️"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            <strong>图片处理：</strong>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>AI生成相关主题图片</li>
            <li>优化图片尺寸和质量</li>
            <li>处理图片格式转换</li>
            <li>添加水印或品牌元素</li>
          </ul>

          {/* 按钮组 */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setIsParamsModalOpen(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors font-medium"
            >
              填写即梦参数
            </button>

            <button
              onClick={handleSendRequest}
              disabled={
                !sharedData.jimengParams || isSendingRequest || isPolling
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.jimengParams || isSendingRequest || isPolling
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              }`}
            >
              {isSendingRequest
                ? "提交中..."
                : isPolling
                ? "查询中..."
                : "发送请求"}
            </button>

            <button
              onClick={handleShowResult}
              disabled={!sharedData.jimengResponse}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.jimengResponse
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              }`}
            >
              请求结果
            </button>

            <button
              onClick={handleInsertToHtml}
              disabled={
                !sharedData.generatedImageUrl || !sharedData.extractedHtml
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !sharedData.generatedImageUrl || !sharedData.extractedHtml
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              插入到HTML
            </button>
          </div>

          {/* 显示从步骤4提取的图片参数 */}
          {sharedData.extractedImages &&
          sharedData.extractedImages.length > 0 ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📸 从邮件模板中提取的图片需求：
              </h4>
              <div className="space-y-2">
                {sharedData.extractedImages.map((image, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">
                        图片 {index + 1}:
                      </p>
                      <p className="text-gray-600 mt-1">
                        <strong>描述:</strong> {image.description}
                      </p>
                      <p className="text-gray-600">
                        <strong>尺寸:</strong> {image.dimensions}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-1 rounded">
                        {image.fullText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sharedData.templateClaudeResponse ? (
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-700">
                ⚠️ 未从邮件模板中检测到图片需求
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <p className="text-sm text-gray-600">
                💡 请先完成步骤4生成邮件模板，图片需求将自动显示在这里
              </p>
            </div>
          )}

          {/* 状态显示 */}
          <div className="space-y-2">
            {sharedData.jimengParams && (
              <div className="p-3 bg-pink-50 rounded-lg border-l-4 border-pink-400">
                <p className="text-sm text-pink-700">✅ 即梦参数已配置</p>
              </div>
            )}

            {isPolling && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">🔄 {pollingStatus}</p>
              </div>
            )}

            {sharedData.jimengResponse && !isPolling && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-700">
                  ✅ 图片生成请求已完成，点击&ldquo;请求结果&rdquo;查看详细信息
                </p>
              </div>
            )}
          </div>

          {/* 显示生成的图片 */}
          {sharedData.generatedImageUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="text-sm font-semibold text-green-800 mb-3">
                🎨 生成的图片：
              </h4>
              <div className="bg-white p-3 rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sharedData.generatedImageUrl}
                  alt="生成的图片"
                  className="max-w-full h-auto rounded shadow-md"
                  style={{ maxHeight: "300px" }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p>
                    图片已生成完成，可以点击&ldquo;插入到HTML&rdquo;按钮将图片插入到邮件模板中
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 p-3 bg-pink-50 rounded border-l-4 border-pink-400">
            <p className="text-sm text-pink-700">
              🎨 智能生成和优化图片资源，提升邮件视觉效果
            </p>
          </div>
        </div>
      </StepBase>

      {/* 即梦参数编辑弹窗 */}
      <JimengParamsModal
        isOpen={isParamsModalOpen}
        onClose={() => setIsParamsModalOpen(false)}
        sharedData={sharedData}
        onSave={handleSaveJimengParams}
      />

      {/* 请求结果显示弹窗 */}
      <JsonResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={sharedData.jimengResponse}
        title="即梦图片生成结果"
      />
    </>
  );
};

export default ImageGenerateStep;
