import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const GPALineChart = ({ data, title = "GPA Progression" }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-primary-600">
            GPA: {payload[0].value}
          </p>
          {payload[0].payload.class_degree && (
            <p className="text-sm text-gray-500">
              Class: {payload[0].payload.class_degree}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 5]} 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ 
              value: 'GPA', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={4.5} stroke="#10b981" strokeDasharray="3 3" label="First Class" />
          <ReferenceLine y={3.5} stroke="#3b82f6" strokeDasharray="3 3" label="Second Class Upper" />
          <ReferenceLine y={2.4} stroke="#f59e0b" strokeDasharray="3 3" label="Second Class Lower" />
          <Line
            type="monotone"
            dataKey="gpa"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 8 }}
            name="Semester GPA"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GPALineChart;