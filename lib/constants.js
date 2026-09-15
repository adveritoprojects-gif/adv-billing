export const CONSULT_FEE = 300;

export const XRAY_TYPES = [
  { type: "Chest PA", part: "Chest", cost: 35 },
  { type: "Chest Lateral", part: "Chest", cost: 35 },
  { type: "Cervical Spine", part: "Spine", cost: 45 },
  { type: "Lumbar Spine", part: "Spine", cost: 50 },
  { type: "Skull AP/Lateral", part: "Skull", cost: 40 },
  { type: "Abdomen", part: "Abdomen", cost: 40 },
  { type: "Hand / Wrist", part: "Limb", cost: 30 },
  { type: "Leg / Knee", part: "Limb", cost: 32 },
  { type: "Pelvis", part: "Pelvis", cost: 38 },
  { type: "Dental OPG", part: "Dental", cost: 28 },
];

export const VIEWS = ["AP", "PA", "Lateral", "Oblique", "Both"];
export const PAY_MODES = ["Cash", "Card", "UPI", "Insurance"];

export const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const today = () => new Date().toISOString().slice(0, 10);
