// src/utils/sessionMetrics.js

const PITCH_MAP = {
  Fastball: "FB",
  "Four-Seam": "FB",
  TwoSeamFastball: "2S",
  "Two-Seam": "2S",
  "2-Seam": "2S",
  Cutter: "CT",
  Curveball: "CB",
  Slider: "SL",
  Changeup: "CH",
  Splitter: "SP"
};


const METRIC_MAP = {
  "Velocity": "velo",
  "Max Velocity": "max_velo",
  "Total Spin": "rpm",
  "Max Spin": "max_rpm",
  "VB (spin)": "v_break",
  "HB (trajectory)": "h_break",
  "Spin Efficiency": "spin_eff",
  "Gyro Degree": "gyro",
  "Spin Direction": "spin_dir",
  "Release Angle": "r_angle",
  "Horizontal Angle": "h_angle",
  "Release Height": "r_height",
  "Release Side": "r_side"
};

const toClock = (val) => {
  if (val === null || val === undefined) return "";
  const totalMinutes = Math.round(val * 5);
  const h = Math.floor(totalMinutes / 60) % 12 || 12;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function transformSessionMetrics(groups = []) {
  return groups.map((group) => {
    const row = {
      pitch_type: PITCH_MAP[group.pitch_type] || group.pitch_type
    };

    group.metrics.forEach(({ metric_name, metric_value }) => {
      const key = METRIC_MAP[metric_name];
      if (!key) return;

      if (key === "spin_dir") {
        row[key] = toClock(parseFloat(metric_value));
      } else {
        row[key] = parseFloat(metric_value);
      }
    });

    return row;
  });
}
