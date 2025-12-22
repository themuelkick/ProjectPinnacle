// src/pages/Session/components/MetricsTab.jsx

export default function MetricsTab({ metrics }) {
  if (!metrics || !metrics.length) return <div className="p-4 text-gray-500 italic">No metrics recorded.</div>;

  // Helper to find metric value by name from the nested list
  const getM = (row, name) => row.metrics.find(m => m.metric_name === name)?.metric_value || "-";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-800 text-white">
          <tr className="divide-x divide-gray-700">
            <th className="px-3 py-2 text-left font-bold uppercase tracking-wider">Pitch Type</th>
            <th className="px-2 py-2 text-center">Velo</th>
            <th className="px-2 py-2 text-center bg-indigo-900">Max V</th>
            <th className="px-2 py-2 text-center">Spin</th>
            <th className="px-2 py-2 text-center bg-indigo-900">Max S</th>
            <th className="px-2 py-2 text-center">VB (Spin)</th>
            <th className="px-2 py-2 text-center">HB (Traj)</th>
            <th className="px-2 py-2 text-center">Spin Eff</th>
            <th className="px-2 py-2 text-center">Spin Dir</th>
            <th className="px-2 py-2 text-center">Gyro</th>
            <th className="px-2 py-2 text-center">R Ang</th>
            <th className="px-2 py-2 text-center">R Ht</th>
            <th className="px-2 py-2 text-center">H Ang</th>
            <th className="px-2 py-2 text-center">R Side</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((group, idx) => (
            <tr key={idx} className="hover:bg-gray-50 divide-x divide-gray-100">
              <td className="px-3 py-2 font-bold text-gray-900 bg-gray-50">{group.pitch_type}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Velocity")}</td>
              <td className="px-2 py-2 text-center font-semibold text-indigo-700">{getM(group, "Max Velocity")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Total Spin")}</td>
              <td className="px-2 py-2 text-center font-semibold text-indigo-700">{getM(group, "Max Total Spin")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "VB (spin)")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "HB (trajectory)")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Spin Efficiency (release)")}</td>
              <td className="px-2 py-2 text-center font-mono">{getM(group, "Spin Direction")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Gyro Degree (deg)")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Release Angle")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Release Height")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Horizontal Angle")}</td>
              <td className="px-2 py-2 text-center">{getM(group, "Release Side")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}