export default function DateSelector({ fechas, fechaSeleccionada, onChange }) {
  return (
    <section className="panel">
      <h2>Fecha</h2>

      <select
        className="input"
        value={fechaSeleccionada || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {fechas.map((item) => (
          <option key={item.id} value={item.id}>
            {item.fecha}
          </option>
        ))}
      </select>
    </section>
  );
}