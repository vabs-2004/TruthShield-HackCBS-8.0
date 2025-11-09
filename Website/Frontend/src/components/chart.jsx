import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DonutChart = ({ text, data }) => {
  // Properly swap Real News <-> Fake News values + labels
  const swappedData = data.map((item) => {
    if (item.name.toLowerCase() === "real news") {
      const fake = data.find((d) => d.name.toLowerCase() === "fake news");
      return { ...item, name: "Fake News", value: fake?.value || item.value };
    }
    if (item.name.toLowerCase() === "fake news") {
      const real = data.find((d) => d.name.toLowerCase() === "real news");
      return { ...item, name: "Real News", value: real?.value || item.value };
    }
    return item;
  });

  return (
    <div style={{ width: 250, height: 250, position: "relative", margin: "auto" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={swappedData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            label={({ name }) => name}
          >
            {swappedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default DonutChart;
