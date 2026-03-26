import { saveAs } from "file-saver";

export default function ExportPanel({ contourGeoJSON, attributes }) {
  function exportGeoJSON() {
    if (!contourGeoJSON) {
      alert("Primero debes dibujar un contorno.");
      return;
    }

    const featureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: contourGeoJSON.geometry,
          properties: {
            Cota: Number(attributes.cota || 0),
            Area: Number(attributes.area || 0),
            Perimetro: Number(attributes.perimetro || 0),
            Fecha: attributes.fecha,
            Descriptor: attributes.descriptor
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: "application/geo+json"
    });

    saveAs(blob, `Cont_Lag_Poly_${attributes.fecha.replaceAll("-", "_")}.geojson`);
  }

  return (
    <section className="panel">
      <h2>Exportación</h2>

      <button className="button" onClick={exportGeoJSON}>
        Exportar GeoJSON
      </button>

      <button
        className="button button-secondary"
        onClick={() => alert("SHP vendrá en la siguiente capa.")}
      >
        Exportar SHP
      </button>

      <button
        className="button button-secondary"
        onClick={() => alert("KMZ vendrá en la siguiente capa.")}
      >
        Exportar KMZ
      </button>
    </section>
  );
}