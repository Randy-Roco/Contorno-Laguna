export async function cargarCatalogoFechas() {
  const response = await fetch("/data/catalogo_fechas.json");

  if (!response.ok) {
    throw new Error("No se pudo cargar catalogo_fechas.json");
  }

  const data = await response.json();

  return data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export async function cargarGeoJSON(url) {
  if (!url) return null;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el GeoJSON: ${url}`);
  }

  return await response.json();
}