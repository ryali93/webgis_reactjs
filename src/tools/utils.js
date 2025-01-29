import { transform } from 'ol/proj'

const GeometryValidation = (geometry) => {
    let coords;
    console.log('[utils] Geometry:', geometry);
    if (geometry) {
        console.log('[utils] geometry:', geometry)
        if (geometry.getType() === 'Point') {
            coords = transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
            return coords;
            // return transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        } else {
            coords = geometry.getCoordinates()[0].map(coord => {
            return transform(coord, 'EPSG:3857', 'EPSG:4326');
            });
        }
    } else {
        coords = null;
    }
    return coords;
  };

export { GeometryValidation };