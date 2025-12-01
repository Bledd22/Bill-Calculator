import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsChartProps {
  billAmount: number;
  tipAmount: number;
  taxAmount: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Amber

const ResultsChart: React.FC<ResultsChartProps> = ({ billAmount, tipAmount, taxAmount }) => {
  // We want to visualize the components: Net Bill (Bill - Tax), Tax, and Tip.
  // Ideally, the 'Bill Amount' input usually includes Tax for simple users, but we have a tax field.
  // Strategy: If Tax > 0, assume Bill Amount includes Tax. Net = Bill - Tax.
  // If Tax == 0, Net = Bill.
  
  const netBill = Math.max(0, billAmount - taxAmount);
  
  const data = [
    { name: 'Subtotal', value: netBill },
    { name: 'Tax', value: taxAmount },
    { name: 'Tip', value: tipAmount },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p>Enter amount to see breakdown</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;