import proj4 from "proj4";
import { register } from "ol/proj/proj4";

proj4.defs(
  "EPSG:32719",
  "+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs"
);

register(proj4);