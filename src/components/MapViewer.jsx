import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw, Modify, Snap } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import { fromLonLat } from "ol/proj";
import { getArea, getLength } from "ol/sphere";

export default function MapViewer({ fechaActiva, setContourGeoJSON, setAttributes }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const vectorSource = new VectorSource();
    sourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 136, 255, 0.18)"
        }),
        stroke: new Stroke({
          color: "#00c8ff",
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "#00c8ff" }),
          stroke: new Stroke({ color: "#ffffff", width: 1 })
        })
      })
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([-70.4, -23.65]),
        zoom: 12
      })
    });

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon"
    });

    const modify = new Modify({
      source: vectorSource
    });

    const snap = new Snap({
      source: vectorSource
    });

    function updateGeometry(feature) {
      const geometry = feature.getGeometry();
      const format = new GeoJSON();
      const geojsonFeature = format.writeFeatureObject(feature);

      const area = getArea(geometry);
      let perimetro = 0;

      const rings = geometry.getCoordinates();
      if (rings.length > 0) {
        const ringCoords = rings[0];
        const lineStringLike = {
          getType: () => "LineString",
          getCoordinates: () => ringCoords
        };
        perimetro = getLength(lineStringLike);
      }

      setContourGeoJSON(geojsonFeature);
      setAttributes((prev) => ({
        ...prev,
        area,
        perimetro
      }));
    }

    draw.on("drawend", (event) => {
      setTimeout(() => {
        const features = vectorSource.getFeatures();
        if (features.length > 1) {
          const first = features[0];
          vectorSource.clear();
          vectorSource.addFeature(first);
        }
        updateGeometry(event.feature);
      }, 0);
    });

    modify.on("modifyend", (event) => {
      const feature = event.features.item(0);
      if (feature) updateGeometry(feature);
    });

    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(snap);

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [setAttributes, setContourGeoJSON]);

  useEffect(() => {
    console.log("Fecha activa:", fechaActiva);
  }, [fechaActiva]);

  return <div ref={mapRef} className="map" />;
}