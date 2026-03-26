import { useEffect, useRef } from "react";
import "../lib/projections";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Draw, Modify, Snap } from "ol/interaction";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import { transform } from "ol/proj";
import { getArea, getLength } from "ol/sphere";

const ESCONDIDA_UTM19S = [486209.679, 7302665.235];
const ESCONDIDA_CENTER = transform(
  ESCONDIDA_UTM19S,
  "EPSG:32719",
  "EPSG:3857"
);

export default function MapViewer({
  contourData,
  anchorData,
  setContourGeoJSON,
  setAttributes,
  modoEdicion = true
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const contourSourceRef = useRef(null);
  const anchorSourceRef = useRef(null);
  const drawRef = useRef(null);
  const modifyRef = useRef(null);
  const snapRef = useRef(null);

  function actualizarMetricas(feature) {
    const geometry = feature.getGeometry();
    const format = new GeoJSON();

    const geojsonFeature = format.writeFeatureObject(feature, {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:32719"
    });

    const area = getArea(geometry);

    let perimetro = 0;
    const rings = geometry.getCoordinates();
    if (rings?.length > 0) {
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

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const contourSource = new VectorSource();
    const anchorSource = new VectorSource();

    contourSourceRef.current = contourSource;
    anchorSourceRef.current = anchorSource;

    const contourLayer = new VectorLayer({
      source: contourSource,
      style: new Style({
        fill: new Fill({ color: "rgba(0, 136, 255, 0.18)" }),
        stroke: new Stroke({ color: "#00c8ff", width: 2 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "#00c8ff" }),
          stroke: new Stroke({ color: "#ffffff", width: 1 })
        })
      })
    });

    const anchorLayer = new VectorLayer({
      source: anchorSource,
      style: new Style({
        stroke: new Stroke({
          color: "#ffcc00",
          width: 3,
          lineDash: [8, 6]
        }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: "#ffcc00" }),
          stroke: new Stroke({ color: "#111827", width: 2 })
        })
      })
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        contourLayer,
        anchorLayer
      ],
      view: new View({
        center: ESCONDIDA_CENTER,
        zoom: 13
      })
    });

    const draw = new Draw({
      source: contourSource,
      type: "Polygon"
    });

    const modify = new Modify({
      source: contourSource
    });

    const snap = new Snap({
      source: contourSource
    });

    draw.on("drawend", (event) => {
      setTimeout(() => {
        const features = contourSource.getFeatures();
        if (features.length > 1) {
          const ultima = features[features.length - 1];
          contourSource.clear();
          contourSource.addFeature(ultima);
        }
        actualizarMetricas(event.feature);
      }, 0);
    });

    modify.on("modifyend", (event) => {
      const feature = event.features.item(0);
      if (feature) actualizarMetricas(feature);
    });

    drawRef.current = draw;
    modifyRef.current = modify;
    snapRef.current = snap;

    if (modoEdicion) {
      map.addInteraction(draw);
      map.addInteraction(modify);
      map.addInteraction(snap);
    }

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [modoEdicion, setAttributes, setContourGeoJSON]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const contourSource = contourSourceRef.current;
    if (!map || !contourSource) return;

    contourSource.clear();

    if (!contourData) {
      map.getView().animate({
        center: ESCONDIDA_CENTER,
        zoom: 13,
        duration: 500
      });
      return;
    }

    const format = new GeoJSON();
    const features = format.readFeatures(contourData, {
      dataProjection: "EPSG:32719",
      featureProjection: "EPSG:3857"
    });

    contourSource.addFeatures(features);

    if (features.length > 0) {
      map.getView().fit(contourSource.getExtent(), {
        padding: [40, 40, 40, 40],
        maxZoom: 18,
        duration: 500
      });

      actualizarMetricas(features[0]);
    }
  }, [contourData, setAttributes, setContourGeoJSON]);

  useEffect(() => {
    const anchorSource = anchorSourceRef.current;
    if (!anchorSource) return;

    anchorSource.clear();

    if (!anchorData) return;

    const format = new GeoJSON();
    const features = format.readFeatures(anchorData, {
      dataProjection: "EPSG:32719",
      featureProjection: "EPSG:3857"
    });

    anchorSource.addFeatures(features);
  }, [anchorData]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !drawRef.current || !modifyRef.current || !snapRef.current) return;

    map.removeInteraction(drawRef.current);
    map.removeInteraction(modifyRef.current);
    map.removeInteraction(snapRef.current);

    if (modoEdicion) {
      map.addInteraction(drawRef.current);
      map.addInteraction(modifyRef.current);
      map.addInteraction(snapRef.current);
    }
  }, [modoEdicion]);

  return <div ref={mapRef} className="map" />;
}