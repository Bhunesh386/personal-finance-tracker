import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SparklineChart({ data = [], color = '#4F46E5', height = 40, dataKey = 'value' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
