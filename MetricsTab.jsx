export default function MetricsTab({ metrics }) {
  if (!metrics.length) return <div>No metrics yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th>Pitch</th>
            <th>Velo</th>
            <th>Max</th>
            <th>RPM</th>
            <th>Max</th>
            <th>V-Break</th>
            <th>H-Break</th>
            <th>Spin Eff</th>
            <th>Gyro</th>
            <th>Spin Dir</th>
            <th>R Ang</th>
            <th>H Ang</th>
            <th>R Ht</th>
            <th>R Side</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <tr key={i} className="text-center">
              <td>{m.pitch_type}</td>
              <td>{m.velo}</td>
              <td>{m.max_velo}</td>
              <td>{m.rpm}</td>
              <td>{m.max_rpm}</td>
              <td>{m.v_break}</td>
              <td>{m.h_break}</td>
              <td>{m.spin_eff}</td>
              <td>{m.gyro}</td>
              <td>{m.spin_dir}</td>
              <td>{m.r_angle}</td>
              <td>{m.h_angle}</td>
              <td>{m.r_height}</td>
              <td>{m.r_side}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
