'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
  status: string;
  count: number;
}

interface StatusBreakdownChartProps {
  data: StatusData[];
}

const COLORS = {
  'Recruiting': '#10b981',      // green
  'Active': '#3b82f6',           // blue
  'Completed': '#6b7280',        // gray
  'Terminated': '#ef4444',       // red
  'Suspended': '#f59e0b',        // amber
  'Withdrawn': '#ec4899',        // pink
  'Unknown': '#94a3b8'           // slate
};

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const getColor = (status: string): string => {
    return COLORS[status as keyof typeof COLORS] || '#94a3b8';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        Trial Status Breakdown
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Current status distribution of all trials
      </p>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((item) => (
          <div 
            key={item.status} 
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getColor(item.status) }}
            />
            <div>
              <div className="text-sm font-semibold text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-600">{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

