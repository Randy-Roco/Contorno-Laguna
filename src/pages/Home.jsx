import { useEffect, useMemo, useState } from "react";
import MapViewer from "../components/MapViewer";
import AttributePanel from "../components/AttributePanel";
import ExportPanel from "../components/ExportPanel";
import DateSelector from "../components/DateSelector";
import { cargarCatalogoFechas, cargarGeoJSON } from "../lib/catalog";

export default function Home() {
  const [fechas, setFechas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [contourGeoJSON, setContourGeoJSON] = useState(null);
  const [anchorGeoJSON, setAnchorGeoJSON] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(true);

  const [attributes, setAttributes] = useState({
    cota: "",
    area: 0,
    perimetro: 0,
    fecha: "",
    descriptor: "Contorno"
  });

  useEffect(() => {
    async function init() {
      try {
        const catalogo = await cargarCatalogoFechas();
        setFechas(catalogo);

        const fechaDefault =
          catalogo.find((x) => x.visiblePorDefecto)?.id ||
          catalogo[0]?.id ||
          "";

        setFechaSeleccionada(fechaDefault);

        try {
          const anchor = await cargarGeoJSON("/data/anclas/Mod_Ini_Cont.geojson");
          setAnchorGeoJSON(anchor);
        } catch (error) {
          console.warn("No se pudo cargar el ancla:", error.message);
          setAnchorGeoJSON(null);
        }
      } catch (error) {
        console.error("Error al inicializar la app:", error);
      }
    }

    init();
  }, []);

  const fechaActiva = useMemo(() => {
    return fechas.find((x) => x.id === fechaSeleccionada) || null;
  }, [fechas, fechaSeleccionada]);

  useEffect(() => {
    async function cargarContornoActivo() {
      if (!fechaActiva) return;

      setAttributes((prev) => ({
        ...prev,
        fecha: fechaActiva.fecha
      }));

      try {
        const poly = await cargarGeoJSON(fechaActiva.poligono);
        setContourGeoJSON(poly);
      } catch (error) {
        console.warn("No se pudo cargar polígono para esta fecha:", error.message);
        setContourGeoJSON(null);
      }
    }

    cargarContornoActivo();
  }, [fechaActiva]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Contorno Laguna</h1>
        <p className="muted">
          Visualización, edición y exportación de contornos multifecha.
        </p>

        <section className="panel">
          <h2>Modo</h2>
          <button
            className="button"
            onClick={() => setModoEdicion((prev) => !prev)}
          >
            {modoEdicion ? "Modo edición activo" : "Modo cliente activo"}
          </button>
        </section>

        <DateSelector
          fechas={fechas}
          fechaSeleccionada={fechaSeleccionada}
          onChange={setFechaSeleccionada}
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
          contourData={contourGeoJSON}
          anchorData={anchorGeoJSON}
          setContourGeoJSON={setContourGeoJSON}
          setAttributes={setAttributes}
          modoEdicion={modoEdicion}
        />
      </main>
    </div>
  );
}