import { useMemo, useState } from "react";
import MapViewer from "../components/MapViewer";
import AttributePanel from "../components/AttributePanel";
import ExportPanel from "../components/ExportPanel";
import DateSelector from "../components/DateSelector";

const FECHAS_INICIALES = [
  {
    id: "laguna_2025_11_03",
    fecha: "2025-11-03",
    preview: null
  },
  {
    id: "laguna_2025_10_25",
    fecha: "2025-10-25",
    preview: null
  },
  {
    id: "laguna_2025_10_06",
    fecha: "2025-10-06",
    preview: null
  }
];

export default function Home() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(FECHAS_INICIALES[0].id);
  const [contourGeoJSON, setContourGeoJSON] = useState(null);
  const [attributes, setAttributes] = useState({
    cota: "",
    area: 0,
    perimetro: 0,
    fecha: "2025-11-03",
    descriptor: "Contorno"
  });

  const fechaActiva = useMemo(
    () => FECHAS_INICIALES.find((f) => f.id === fechaSeleccionada) ?? FECHAS_INICIALES[0],
    [fechaSeleccionada]
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Contorno Laguna</h1>
        <p className="muted">
          Plataforma base para visualización, edición y exportación de contornos.
        </p>

        <DateSelector
          fechas={FECHAS_INICIALES}
          fechaSeleccionada={fechaSeleccionada}
          onChange={(value) => {
            setFechaSeleccionada(value);
            const f = FECHAS_INICIALES.find((x) => x.id === value);
            if (f) {
              setAttributes((prev) => ({
                ...prev,
                fecha: f.fecha
              }));
            }
          }}
        />

        <AttributePanel
          attributes={attributes}
          setAttributes={setAttributes}
        />

        <ExportPanel
          contourGeoJSON={contourGeoJSON}
          attributes={attributes}
        />
      </aside>

      <main className="map-section">
        <MapViewer
          fechaActiva={fechaActiva}
          setContourGeoJSON={setContourGeoJSON}
          setAttributes={setAttributes}
        />
      </main>
    </div>
  );
}