import { CATEGORIES } from "../constants";

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="chip-row">
      <button className={`chip ${!value ? "chip-active" : ""}`} onClick={() => onChange("")}>
        Todas
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          className={`chip ${value === c.value ? "chip-active" : ""}`}
          onClick={() => onChange(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
