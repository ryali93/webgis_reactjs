import { transform } from 'ol/proj'

const GeometryValidation = (geometry) => {
    let coordinates;
    console.log('[utils] Geometry:', geometry);
    if (geometry) {
        if (geometry.getType() === 'Point') {
                return transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        } else {
            coordinates = geometry.getCoordinates()[0].map(coord => {
                return transform(coord, 'EPSG:3857', 'EPSG:4326');
            });
        }
    } else {
        coordinates = null;
    }
    return coordinates;
  };

export { GeometryValidation };