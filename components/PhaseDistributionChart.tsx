'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PhaseData {
  phase: string;
  count: number;
}

interface PhaseDistributionChartProps {
  data: PhaseData[];
}

export function PhaseDistributionChart({ data }: PhaseDistributionChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        Trial Phase Distribution
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Breakdown of clinical trials by phase
      </p>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="phase" 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey="count" 
            fill="#3b82f6"
            name="Number of Trials"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.phase} className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{item.count}</div>
            <div className="text-sm text-gray-600">{item.phase}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

