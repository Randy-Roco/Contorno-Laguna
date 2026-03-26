export default function AttributePanel({ attributes, setAttributes }) {
  return (
    <section className="panel">
      <h2>Atributos</h2>

      <label className="label">Cota</label>
      <input
        className="input"
        type="number"
        step="0.01"
        value={attributes.cota}
        onChange={(e) =>
          setAttributes((prev) => ({
            ...prev,
            cota: e.target.value
          }))
        }
      />

      <label className="label">Área (m²)</label>
      <input
        className="input"
        type="text"
        value={Number(attributes.area || 0).toFixed(2)}
        readOnly
      />

      <label className="label">Perímetro (m)</label>
      <input
        className="input"
        type="text"
        value={Number(attributes.perimetro || 0).toFixed(2)}
        readOnly
      />

      <label className="label">Fecha</label>
      <input className="input" type="text" value={attributes.fecha} readOnly />

      <label className="label">Descriptor</label>
      <input
        className="input"
        type="text"
        value={attributes.descriptor}
        readOnly
      />
    </section>
  );
}