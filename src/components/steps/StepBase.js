import React from "react";

const StepBase = ({ stepNumber, title, description, icon, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        {/* 步骤编号 */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
          {stepNumber}
        </div>

        {/* 图标 */}
        <div className="text-3xl">{icon}</div>

        {/* 内容 */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          {children && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">{children}</div>
          )}
        </div>

        {/* 状态指示器 */}
        <div className="flex-shrink-0">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default StepBase;
