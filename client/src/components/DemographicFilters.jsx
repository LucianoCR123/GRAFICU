import { GENDERS, AGE_BRACKETS } from "../constants";
import { COUNTRIES } from "../countries";

export default function DemographicFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filters-row">
      <select value={filters.country} onChange={(e) => update("country", e.target.value)}>
        <option value="">Todos los países</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <select value={filters.gender} onChange={(e) => update("gender", e.target.value)}>
        <option value="">Todos los géneros</option>
        {GENDERS.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
      <select value={filters.ageBracket} onChange={(e) => update("ageBracket", e.target.value)}>
        <option value="">Todas las edades</option>
        {AGE_BRACKETS.map((b) => (
          <option key={b} value={b}>
            {b} años
          </option>
        ))}
      </select>
      {(filters.country || filters.gender || filters.ageBracket) && (
        <button className="link" onClick={() => onChange({ country: "", gender: "", ageBracket: "" })}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
