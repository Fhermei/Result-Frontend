import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'A': '#10b981',
  'B': '#3b82f6',
  'C': '#f59e0b',
  'D': '#ef4444',
  'E': '#8b5cf6',
  'F': '#6b7280'
};

const GradePieChart = ({ data, title = "Grade Distribution" }) => {
  const processData = () => {
    const gradeCount = {};
    data.forEach(item => {
      const grade = item.grade;
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });
    
    return Object.entries(gradeCount).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name] || '#6b7280'
    }));
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-800">Grade {payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
          <p className="text-sm text-gray-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradePieChart;