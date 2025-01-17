const ee = require('@google/earthengine');
const utils = require('./utils');
const sensors = require('./sensors');
const fs = require('fs');
const path = require('path');
const { start } = require('repl');

let globalData;
const path_gee_catalog = path.join(__dirname, '../..', '/data/gee_catalog_full.json');

// Load data from JSON file
fs.readFile(path_gee_catalog, 'utf8', (err, data) => {
  if (err) {
      console.error('Error al cargar el archivo JSON:', err);
      return;
  }
  globalData = JSON.parse(data);
});

////////////////////////////////////////////////////////////////
// Get default value if value is null
const getDefault = (value, defaultValue) => {
    return (!value || value == "null") ? defaultValue : value;
};

// AddBandsS2
function addBandsS2(img) {
    var nbr = img.normalizedDifference(['B8', 'B12']).rename(['NBR']);
    var ndvi = img.normalizedDifference(['B8', 'B4']).rename(['NDVI']);
    var ndmi = img.normalizedDifference(['B8', 'B11']).rename(['NDMI']);
    var gndvi = img.normalizedDifference(['B8', 'B3']).rename(['GNDVI']);
    var ndwi = img.normalizedDifference(['B3', 'B8']).rename(['NDWI']);
    
    var L = 0.5; // Factor de ajuste del suelo para SAVI
    var savi = img.expression(
      '(1 + L) * (NIR - Red) / (NIR + Red + L)', {
        'NIR': img.select('B8'),
        'Red': img.select('B4'),
        'L': L
      }).rename(['SAVI']);
  
    var evi = img.expression(
      '2.5 * (NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1)', {
        'NIR': img.select('B8').divide(10000),
        'Red': img.select('B4').divide(10000),
        'Blue': img.select('B2').divide(10000)
      }).rename(['EVI']);
  
    return img.addBands(ee.Image.cat(nbr, ndvi, ndmi, ndwi, gndvi, savi, evi));
}

////////////////////////////////////////////////////////////////

// Get mapid for image or image collection from GEE
const get_mapid = async(id, geometry_s, indices_s, gee_type, scale_s, start_date_s, end_date_s, vis_s, cloud_cover_s) => {
    try {
        let geometry, indices, scale, start_date, end_date, cloud_cover, vis;
        const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];

        const applyCloudMask = (image) => {
            if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
                return utils.maskClouds(image, 'QA60', [(1 << 10), (1 << 11)]);
            } else if (id.includes('LANDSAT')) {
                return utils.maskClouds(image, 'pixel_qa', [(1 << 5), (1 << 7), (1 << 3)], true);
            } 
            return image;
        };
        
        const applyCloudCoverageFilter = (collection) => {
            if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
                return collection.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover);
            } else if (id.includes('LANDSAT')) {
                return collection.filterMetadata('CLOUD_COVER', 'less_than', cloud_cover);
            }
            return collection;
        };
      
        geometry = getDefault(ee.Geometry.Polygon(JSON.parse(geometry_s)), ee.Geometry.Polygon(geom_default));
        indices = getDefault(indices_s.split(",").filter(band => band !== ""), []);
        scale = Number(getDefault(scale_s, 1));
        start_date = new Date(getDefault(start_date_s, '2020-01-01'));
        end_date = new Date(getDefault(end_date_s, '2022-01-01'));
        cloud_cover = Number(getDefault(cloud_cover_s, 100));
        vis = getDefault(JSON.parse(vis_s), {});
        console.log("vis default")
        console.log(vis)
        console.log(indices_s)
        console.log(indices)
        if (indices.length > 0) {
            vis = sensors.sensorInfo["Sentinel-2"]["rgb"][indices[0]]
            console.log("vis rgb")
            console.log(vis)
        }

        let map_sr;
        if (gee_type === "image") {
            map_sr = ee.Image(id)
                .clip(geometry)
                .getMap(vis);
            return map_sr;
        } 
        else if (gee_type === "image_collection") {
            // If id includes users o projects, start_date and end_date are not needed
            if (id.includes('users') || id.includes('projects')) {
                map_sr = ee.ImageCollection(id)
            } else {
                map_sr = ee.ImageCollection(id)
                    .filterBounds(geometry)
                    .filterDate(start_date, end_date)
                map_sr = applyCloudCoverageFilter(map_sr);
                // map_sr = map_sr.map(applyCloudMask)
                if (id.includes('S2')) {
                    map_sr = map_sr.map(addBandsS2)
                }
            }
            if (geometry_s !== "null") {
                map_sr = map_sr
                    .mean()
                    .clip(geometry);
                map_sr = map_sr.getMap(vis);//.multiply(scale)
                return map_sr;
            } 
            else {
                map_sr = map_sr.mosaic().getMap(vis);//.multiply(scale)
                return map_sr;
            }
        }
        else if (gee_type === "table" || gee_type === "table_collection") {
            map_sr = ee.FeatureCollection(id)
                .filterBounds(geometry)
                .getMap();
            return map_sr;
        }

    } catch (error) {
        console.log(error);
    }
}

// Post mapid for image or image collection from GEE
const post_mapid = async(id, geometry_s, indices_s, gee_type, scale_s, start_date_s, end_date_s, vis_s, cloud_cover_s) => {
    try {
        let geometry, indices, scale, start_date, end_date, cloud_cover, vis;
        const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];

        const applyCloudMask = (image) => {
            if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
                return utils.maskClouds(image, 'QA60', [(1 << 10), (1 << 11)]);
            } else if (id.includes('LANDSAT')) {
                return utils.maskClouds(image, 'pixel_qa', [(1 << 5), (1 << 7), (1 << 3)], true);
            } 
            return image;
        };
        
        const applyCloudCoverageFilter = (collection) => {
            if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
                return collection.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover);
            } else if (id.includes('LANDSAT')) {
                return collection.filterMetadata('CLOUD_COVER', 'less_than', cloud_cover);
            }
            return collection;
        };

        geometry = getDefault(ee.Geometry.Polygon(JSON.parse(geometry_s)), ee.Geometry.Polygon(geom_default));
        indices = getDefault(indices_s.split(",").filter(band => band !== ""), []);
        scale = Number(getDefault(scale_s, 1));
        start_date = new Date(getDefault(start_date_s, '2020-01-01'));
        end_date = new Date(getDefault(end_date_s, '2022-01-01'));
        cloud_cover = Number(getDefault(cloud_cover_s, 100));
        vis = getDefault(JSON.parse(vis_s), {});
        console.log("vis default")
        console.log(vis)
        console.log(indices_s)
        console.log(indices)
        if (indices.length > 0) {
            vis = sensors.sensorInfo["Sentinel-2"]["rgb"][indices[0]]
            console.log("vis rgb")
            console.log(vis)
        }

        let map_sr;
        if (gee_type === "image") {
            map_sr = ee.Image(id)
                .clip(geometry)
                .getMap(vis);
            return map_sr;
        } 
        else if (gee_type === "image_collection") {
            // If id includes users o projects, start_date and end_date are not needed
            if (id.includes('users') || id.includes('projects')) {
                map_sr = ee.ImageCollection(id)
            } else {
                map_sr = ee.ImageCollection(id)
                    .filterBounds(geometry)
                    .filterDate(start_date, end_date)
                map_sr = applyCloudCoverageFilter(map_sr);
                // map_sr = map_sr.map(applyCloudMask)
                if (id.includes('S2')) {
                    map_sr = map_sr.map(addBandsS2)
                }
            }
            if (geometry_s !== "null") {
                map_sr = map_sr
                    .mean()
                    .clip(geometry);
                map_sr = map_sr.getMap(vis)
                console.log(map_sr)
                return map_sr;
            } 
            else {
                map_sr = map_sr.mosaic().getMap(vis);//.multiply(scale)
                return map_sr;
            }
        }
        else if (gee_type === "table" || ype === "table_collection") {
            map_sr = ee.FeatureCollection(id)
                .filterBounds(geometry)
                .getMap();
            return map_sr;
        }
    } catch (error) {
        console.log(error);
    }
}


// Get available dates for image collection
const get_available_dates = async(id, geometry_s, cloud_cover_s) => {
    try {
        let geometry, cloud_cover, start_date, end_date;

        // Geometry
        const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];
        const parsedGeometry = geometry_s ? JSON.parse(geometry_s) : null;

        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") { 
            geometry = ee.Geometry.Polygon(geom_default);
        } else if (Array.isArray(parsedGeometry) && parsedGeometry.length === 2) { 
            geometry = ee.Geometry.Point(parsedGeometry);
        } else { 
            geometry = ee.Geometry.Polygon(parsedGeometry);
        }


        if (!cloud_cover_s || cloud_cover_s == "null") { cloud_cover = 100 } else { cloud_cover = Number(cloud_cover_s) }
        start_date = new Date();
        end_date = new Date();
        start_date.setFullYear(start_date.getFullYear() - 5);

        // Filtros básicos
        let collection;
        if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
            collection = ee.ImageCollection(id).filterBounds(geometry)
                .filterDate(start_date, end_date)
                .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover)
        } else if (id.includes('LANDSAT')) {
            collection = ee.ImageCollection(id)
                .filterBounds(geometry)
                .filterDate(start_date, end_date)
                .filterMetadata('CLOUD_COVER', 'less_than', cloud_cover);
        } else {
            collection = ee.ImageCollection(id)
            .filterBounds(geometry)
            .filterDate(start_date, end_date)
        }

        // Función para obtener las fechas
        var getDatesList = function(imageCollection) {
            var featureCollection = imageCollection.map(function(image) {
            var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');;
            return ee.Feature(null, {'date': date});
            });
            var datesList = featureCollection.aggregate_array('date');
            return datesList.distinct();
        };
        // if length of collection is 0, return []
        if (collection.size().getInfo() == 0) {
            return [];
        }else{
            return getDatesList(collection).getInfo();
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

const get_hillshade = async(geometry_s) => {
    try {
      let area;
      const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];

      if (!geometry_s || geometry_s == "null" || geometry_s == "undefined") { area = ee.Geometry.Polygon(geom_default) } else { area = ee.Geometry.Polygon(JSON.parse(geometry_s)) }
      const hillshade = ee.Terrain.hillshade(ee.Image("USGS/SRTMGL1_003"), 315, 35).clip(area);
      console.log(hillshade)
      return hillshade.getMap();
    } catch (error) {
        console.log(error);
    }
}

const get_hotspot = async (geometry_s, start_date_s, end_date_s) => {
    try {
        let point;
        let area;
        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") {
            point = ee.Geometry.Point(-4.8163, 40.4411);
            area = point.buffer({'distance': 30000});
        } else {
            area = ee.Geometry.Polygon(JSON.parse(geometry_s));
        }

        const image = ee.ImageCollection('LANDSAT/LC08/C02/T1_RT_TOA')
            .filterBounds(area)
            .filterDate(start_date_s, end_date_s)
            .mosaic();

        const umbral_temperatura6 = 0.7;
        const umbral_temperatura7 = 0.6;
        const umbral_temperatura10 = 320;

        const hotspotB6 = image.select('B6').gt(umbral_temperatura6);
        const hotspotB7 = image.select('B7').gt(umbral_temperatura7);
        const hotspotB10 = image.select('B10').gt(umbral_temperatura10);

        const hotspot = (hotspotB6.or(hotspotB7)).and(hotspotB10);
        const maskedHostpot = hotspot.updateMask(hotspot);

        const hotspotVectors = maskedHostpot.reduceToVectors({
            geometry: area,
            scale: 30,
            maxPixels: 5e8,
            bestEffort: true
        });
        
        // Añadir el cálculo de área y temperatura media a cada Feature
        const hotspot_area_temp = hotspotVectors.map((feature) => {
            const geom = feature.geometry();
            const areaM2 = geom.area({maxError: 1});
            const meanTemp = image.select('B10').reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: geom,
                scale: 30
            }).get('B10');
            // Pasar la temperatura de Kelvin a Celsius
            const meanTempC = ee.Number(meanTemp).subtract(273.15);
            return feature.set('area_m2', areaM2, 'mean_temperature', meanTempC);
        });

        vector_url = hotspot_area_temp.getDownloadURL(
            filetype = 'kml',
            selectors = ['area_m2', 'mean_temperature'],
            filename = "hotspot"
            )
        console.log(vector_url)
        return {"url_data": vector_url, "url_xyz": hotspotVectors.getMap()};

    } catch (error) {
        console.log(error);
        throw error;
    }
}


const get_time_series = async(id, geometry_s, indices_s, reducer_s, scale_s, start_date_s, end_date_s, cloud_cover_s) => {
    try {
        let geometry, indices, scale, start_date, end_date, reducer, cloud_cover;

        // Geometry
        const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];
        const parsedGeometry = geometry_s ? JSON.parse(geometry_s) : null;

        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") { 
            geometry = ee.Geometry.Polygon(geom_default);
        } else if (Array.isArray(parsedGeometry) && parsedGeometry.length === 2) { 
            geometry = ee.Geometry.Point(parsedGeometry);
        } else { 
            geometry = ee.Geometry.Polygon(parsedGeometry);
        }
        
        // if (!geometry_s || geometry_s == "null" || geometry_s == "undefined") { area = ee.Geometry.Polygon(geom_default) } else { area = ee.Geometry.Polygon(JSON.parse(geometry_s)) }
        if (!indices_s || indices_s == "null") { indices = [] } else { indices = indices_s.split(",") }
        if (!scale_s || scale_s == "null") { scale = 1 } else { scale = Number(scale_s) }
        if (!start_date_s || start_date_s == "null") { start_date = new Date('2019-01-01') }else { start_date = new Date(start_date_s) }
        if (!end_date_s || end_date_s == "null") { end_date = new Date('2020-01-01') }else { end_date = new Date(end_date_s) }
        if (!cloud_cover_s || cloud_cover_s == "null") { cloud_cover = 100 } else { cloud_cover = Number(cloud_cover_s) }
        indices = indices.filter(idx => idx !== "");

        reducer = ee.Reducer.mean();

        function clipArea(image) {
            return image.clip(geometry);
        }

        function reduce_region(image){
            mean_val = image.reduceRegion(reducer=ee.Reducer.mean(), geometry=geometry, scale=30)
            return image.set(mean_val)
        }
        
        function reduce_region_big(image){
            mean_val = image.reduceRegion(reducer=ee.Reducer.mean(), geometry=geometry, scale=1000)
            return image.set(mean_val)
        }

        console.log({
            "id": id,
            "geometry": geometry,
            "indices": indices,
            "reducer": reducer,
            "scale": scale,
            "start_date": start_date,
            "end_date": end_date,
            "cloud_cover": cloud_cover
        })

        if (id.includes('S2')) {
            var map_sr = ee.ImageCollection(id)
                        .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover)
                        .filterBounds(geometry)
                        .filterDate(start_date, end_date);
            map_sr = map_sr.map(addBandsS2);
            map_sr = map_sr.map(clipArea).map(reduce_region);
            map_sr = map_sr.select(indices)
        }else{
            var map_sr = ee.ImageCollection(id)
                        .filterBounds(geometry)
                        .filterDate(start_date, end_date)
                        .select(indices)
            map_sr = map_sr.map(clipArea).map(reduce_region_big);
        }
        return map_sr.getInfo();

        } catch (error) {
            console.log(error);
        }
}

const post_time_series = async(id, geometry_s, indices_s, reducer_s, scale_s, start_date_s, end_date_s, cloud_cover_s) => {
    try {
        let geometry, indices, scale, start_date, end_date, reducer, cloud_cover;

        // Geometry
        const geom_default = [[-10,35], [4,35], [4,44], [-10,44], [-10,35]];
        const parsedGeometry = geometry_s ? JSON.parse(geometry_s) : null;

        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") { 
            geometry = ee.Geometry.Polygon(geom_default);
        } else if (Array.isArray(parsedGeometry) && parsedGeometry.length === 2) { 
            geometry = ee.Geometry.Point(parsedGeometry);
        } else { 
            geometry = ee.Geometry.Polygon(parsedGeometry);
        }
        
        // if (!geometry_s || geometry_s == "null" || geometry_s == "undefined") { area = ee.Geometry.Polygon(geom_default) } else { area = ee.Geometry.Polygon(JSON.parse(geometry_s)) }
        if (!indices_s || indices_s == "null") { indices = [] } else { indices = indices_s.split(",") }
        if (!scale_s || scale_s == "null") { scale = 1 } else { scale = Number(scale_s) }
        if (!start_date_s || start_date_s == "null") { start_date = new Date('2019-01-01') }else { start_date = new Date(start_date_s) }
        if (!end_date_s || end_date_s == "null") { end_date = new Date('2020-01-01') }else { end_date = new Date(end_date_s) }
        if (!cloud_cover_s || cloud_cover_s == "null") { cloud_cover = 100 } else { cloud_cover = Number(cloud_cover_s) }
        indices = indices.filter(idx => idx !== "");

        // reducer = ee.Reducer.mean();

        reducer = ee.Reducer.mean().combine({
            reducer2: ee.Reducer.max(),
            sharedInputs: true
        }).combine({
            reducer2: ee.Reducer.min(),
            sharedInputs: true
        });

        function clipArea(image) {
            return image.clip(geometry);
        }

        function reduce_region(image){
            mean_val = image.reduceRegion(reducer=reducer, geometry=geometry, scale=30)
            return image.set(mean_val)
        }
        
        function reduce_region_big(image){
            mean_val = image.reduceRegion(reducer=reducer, geometry=geometry, scale=1000)
            return image.set(mean_val)
        }

        console.log({
            "id": id,
            "geometry": geometry,
            "indices": indices,
            "reducer": reducer,
            "scale": scale,
            "start_date": start_date,
            "end_date": end_date,
            "cloud_cover": cloud_cover
        })

        if (id.includes('S2')) {
            var map_sr = ee.ImageCollection(id)
                        .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover)
                        .filterBounds(geometry)
                        .filterDate(start_date, end_date);
            map_sr = map_sr.map(addBandsS2);
            map_sr = map_sr.map(clipArea).map(reduce_region);
            map_sr = map_sr.select(indices)
        }else{
            var map_sr = ee.ImageCollection(id)
                        .filterBounds(geometry)
                        .filterDate(start_date, end_date)
                        .select(indices)
            map_sr = map_sr.map(clipArea).map(reduce_region_big);
        }
        map_sr = map_sr.select(indices)
        var time_series = map_sr.getInfo()

        var new_ts = {}
        new_ts["dates"] = time_series["features"].map(x => x["properties"]["system:time_start"])

        for(var i = 0; i < indices.length; i++){
            var indice_max = indices[i] + "_max"
            var indice_min = indices[i] + "_min"
            var indice_mean = indices[i] + "_mean"

            new_ts[indice_max] = time_series["features"].map(x => x["properties"][indice_max])
            new_ts[indice_min] = time_series["features"].map(x => x["properties"][indice_min])
            new_ts[indice_mean] = time_series["features"].map(x => x["properties"][indice_mean])
        }
        return new_ts
        }
    catch (error) {
        console.log(error);
    }
}

const display_img = async(id, geometry_s, indices_s, scale_s, start_date_s, end_date_s, cloud_cover_s) => {
    try {
        let geometry, indices, scale, start_date, end_date, cloud_cover;

        console.log({
            "id": id,
            "geometry_s": geometry_s,
            "indices_s": indices_s,
            "scale_s": scale_s,
            "start_date_s": start_date_s,
            "end_date_s": end_date_s,
            "cloud_cover_s": cloud_cover_s
        })

        const applyCloudCoverageFilter = (collection) => {
            if (id.includes('COPERNICUS/S2_SR_HARMONIZED')) {
                return collection.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', cloud_cover);
            } else if (id.includes('LANDSAT')) {
                return collection.filterMetadata('CLOUD_COVER', 'less_than', cloud_cover);
            }
            return collection;
        };

        const centralPoint = geometry_s;
        id = getDefault(id, 'COPERNICUS/S2_SR_HARMONIZED');
        geometry = JSON.parse(centralPoint);//getDefault(JSON.parse(centralPoint), centralPoint);
        indices = getDefault(indices_s.split(",").filter(idx => idx !== ""), []);
        scale = Number(getDefault(scale_s, 1));
        start_date = new Date(getDefault(start_date_s, '2023-01-01'));
        end_date = new Date(getDefault(end_date_s, '2024-01-01'));
        cloud_cover = Number(getDefault(cloud_cover_s, 100));

        var aoiBox = ee.Geometry.Rectangle([
            geometry[0] - 0.01, geometry[1] - 0.01, // Esquina inferior izquierda
            geometry[0] + 0.01, geometry[1] + 0.01  // Esquina superior derecha
        ]);
        var aoiCircle = ee.Geometry.Point(geometry).buffer(200); // Buffer de 1000 metros
        var col = ee.ImageCollection(id)
                    .filterDate(start_date, end_date)
                    .filterBounds(aoiCircle);
        col = applyCloudCoverageFilter(col);
        col = col.map(addBandsS2);

        // Función para obtener las fechas
        var getDatesList = function(ic) {
            var datesList = ic.map(function(image) {
                var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');
                return ee.Feature(null, {'date': date});
            }).aggregate_array('date');
            return datesList;
        };

        // Obtener y procesar las fechas
        var datesList = getDatesList(col);

        // Asegurar que col tiene la propiedad 'date'
        col = col.map(function(image) {
            return image.set('date', ee.Date(image.get('system:time_start')).format('YYYY-MM-dd'));
        });

        let dates = datesList.getInfo()
        console.log(dates)
        const urlsList = [];

        console.log(indices)
        for(let i = 0; i < indices.length; i++){
            vis = sensors.sensorInfo["Sentinel-2"]["rgb"][indices[i]];
            const urlPromises = dates.map(date => {
            return new Promise((resolve) => {
                var img = col.filter(ee.Filter.eq('date', date)).first();
                var aoiImg = ee.Image().byte()
                .paint(ee.FeatureCollection(ee.Feature(aoiCircle)), 1, 2)
                .visualize({palette: 'ffffff'});
        
                var image = img.visualize(vis).blend(aoiImg);
                image.getDownloadURL({
                region: aoiBox,
                dimensions: '200',
                crs: 'EPSG:3857',
                format: 'png'
                }, function(url) {
                if (url) {
                    resolve({indice: indices[i], date, url});
                } else {
                    console.log("Failed to get URL for date: " + date);
                    resolve({indice: indices[i], date, url: null});
                }
                });
            });
            });
        
            const url_indice = await Promise.all(urlPromises);
            urlsList.push(url_indice);
        }
        const flattenedUrlsList = urlsList.flat();
        return flattenedUrlsList;

    } catch (error) {
        console.log(error);
    }
}

const get_flood = async(geometry_s, start_date_s, end_date_s) => {
    try {
        let area, start_date, end_date;
        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") {
            area = ee.Geometry.Polygon([[-10,35], [4,35], [4,44], [-10,44], [-10,35]]);
        } else {
            area = ee.Geometry.Polygon(JSON.parse(geometry_s));
        }

        const id = 'COPERNICUS/S1_GRD';
        start_date = new ee.Date(getDefault(start_date_s, '2019-09-03'));
        end_date = new ee.Date(getDefault(end_date_s, '2019-09-15'));

        // Parametros
        var polarization = "VH"
        var pass_direction = "DESCENDING"

        // Geometry3
        var aoi = ee.FeatureCollection(area)

        // Load and filter Sentinel-1 GRD data by predefined parameters 
        var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
            .filter(ee.Filter.eq('orbitProperties_pass', pass_direction)) 
            .filter(ee.Filter.eq('resolution_meters', 10))
            .filterBounds(aoi)
            .select(polarization);
        
        // Select images by predefined dates
        var before_collection = collection.filterDate(start_date.advance(-5, 'day'), start_date)
        var after_collection = collection.filterDate(end_date, end_date.advance(5, 'day'))

        // Creating mosaic of selected tiles and clip to study area
        var before = before_collection.mosaic().clip(aoi)
        var after = after_collection.mosaic().clip(aoi)

        // Apply reduce the radar speckle by smoothing  
        var smoothing_radius = 50;
        var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
        var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');

        // Calculate the difference between the before and after images
        var difference = after_filtered.divide(before_filtered);

        // Define thresholds
        var thresholds = [1.25, 1.20, 1.15];
        var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
        var swater_mask = swater.gte(10).updateMask(swater.gte(10));
        var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
        var terrain = ee.Algorithms.Terrain(DEM);
        var slope = terrain.select('slope');

        // Function to apply flood masking and threshold
        function applyFloodMask(threshold) {
            var difference_binary = difference.gt(threshold);
            var flooded_mask = difference_binary.where(swater_mask, 0);
            var flooded = flooded_mask.updateMask(flooded_mask);
            
            var connections = flooded.connectedPixelCount();
            flooded = flooded.updateMask(connections.gte(8));
            flooded = flooded.updateMask(slope.lt(5));
            
            return flooded;
        }
  
        var flooded_layer_0 = applyFloodMask(thresholds[2]).visualize({palette: 'D6E0F5', forceRgbOutput: true});
        var flooded_layer_1 = applyFloodMask(thresholds[1]).visualize({palette: '92a8d1', forceRgbOutput: true});
        var flooded_layer_2 = applyFloodMask(thresholds[0]).visualize({palette: '0000FF', forceRgbOutput: true});

        var flooded_colored = flooded_layer_0.blend(flooded_layer_1).blend(flooded_layer_2)

        var swater = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select('seasonality')
        var swater_mask = swater.gte(10).updateMask(swater.gte(10));
        var flooded = flooded_colored.updateMask(swater_mask.unmask().not())
        
        return {"url_xyz": flooded.getMap()};

    } catch (error) {
        console.log(error);
        throw error;
    }
}


const get_burned = async (geometry_s, start_date_s, end_date_s) => {
    try {
        let area, start_date, end_date;
        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") {
            area = ee.Geometry.Polygon([[-10,35], [4,35], [4,44], [-10,44], [-10,35]]);
        } else {
            area = ee.Geometry.Polygon(JSON.parse(geometry_s));
        }

        const id = 'COPERNICUS/S2_SR';
        start_date = new ee.Date(getDefault(start_date_s, '2021-08-05'));
        end_date = new ee.Date(getDefault(end_date_s, '2021-08-18'));

        //----------------------- Select imagery by time and location -----------------------
        var prefireImCol = ee.ImageCollection(id)
            .filterDate(start_date, start_date.advance(5, 'day'))
            .filterBounds(area);
            
        var postfireImCol = ee.ImageCollection(id)
            .filterDate(end_date, end_date.advance(5, 'day'))
            .filterBounds(area);

        //------------------------------- Apply a cloud and snow mask -------------------------------
        // Function to mask clouds from the pixel quality band of Sentinel-2 SR data.
        function maskS2sr(image) {
            var cloudBitMask = ee.Number(2).pow(10).int();
            var cirrusBitMask = ee.Number(2).pow(11).int();
            // Get the pixel QA band.
            var qa = image.select('QA60');
            // All flags should be set to zero, indicating clear conditions.
            var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
                .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
            // Return the masked image, scaled to TOA reflectance, without the QA bands.
            return image.updateMask(mask).copyProperties(image, ["system:time_start"]);
        }

        // Apply platform-specific cloud mask
        var prefire_CM_ImCol = prefireImCol.map(maskS2sr);
        var postfire_CM_ImCol = postfireImCol.map(maskS2sr);
        
        //----------------------- Mosaic and clip images to study area -----------------------------
        var pre_cm_mos = prefire_CM_ImCol.mosaic().clip(area);
        var post_cm_mos = postfire_CM_ImCol.mosaic().clip(area);

        //------------------ Calculate NBR for pre- and post-fire images ---------------------------
        // Apply platform-specific NBR = (NIR-SWIR2) / (NIR+SWIR2)
        var preNBR = pre_cm_mos.normalizedDifference(['B8', 'B12']);
        var postNBR = post_cm_mos.normalizedDifference(['B8', 'B12']);

        //------------------ Calculate difference between pre- and post-fire images ----------------
        var dNBR_unscaled = preNBR.subtract(postNBR);
        var dNBR = dNBR_unscaled.multiply(1000);

        // Seperate result into 8 burn severity classes
        var thresholds = ee.Image([-1000, -251, -101, 99, 269, 439, 659, 2000]);
        var classified = dNBR.lt(thresholds).reduce('sum').toInt();

        //==========================================================================================
        //                                  PREPARE FILE EXPORT
        var burnedAreas = dNBR.gte(110).updateMask(dNBR.gte(110));

        var vectors = burnedAreas.reduceToVectors({
            geometry: area,
            scale: 100,
            geometryType: 'polygon',
            eightConnected: false,
            labelProperty: 'zone',
            reducer: ee.Reducer.countEvery(),
            maxPixels: 1e9
        });

        // Map.addLayer(vectors, {}, 'Vector Quema', false);
        var polygonsWithArea = vectors.map(function(feature) {
            return feature.set('area', feature.geometry().area({maxError: 1}));
        });

        // Filtrar para obtener el polígono más grande
        var vectors1 = ee.FeatureCollection([polygonsWithArea.sort('area', false).first()]);

        return {"url_xyz": vectors1.getMap()};

    } catch (error) {
        console.log(error);
        throw error;
    }
}

const fire_risk = async (geometry_s, date_eval_s) => {
    try {
        let area, area2, start_date;
        if (!geometry_s || geometry_s === "null" || geometry_s === "undefined") {
            area = ee.Geometry.Polygon([[-10,35], [4,35], [4,44], [-10,44], [-10,35]]);
        } else {
            area = ee.Geometry.Polygon(JSON.parse(geometry_s));
        }
        area2 = area.bounds().buffer(200);
        ////////////////////////////////
        var clipImage = function(image){
            return image.clip(area2)
        }
        ////////////////////////////////
  
        start_date = new ee.Date(getDefault(date_eval_s, '2021-08-09'));
        var end_date = start_date.advance(7, 'day');

        // Use Cloud Score to filter S2 images
        var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

        // Get LST
        var lst = ee.ImageCollection("MODIS/061/MOD11A1")
            .filterDate(start_date, start_date.advance(7, 'day'))
            .filterBounds(area2)
            .select('LST_Day_1km')
            .max();
        
        var lst = lst.multiply(0.02).subtract(273.15).rename('lst');

        // Calculate NDMI and NDVI
        var s2Col = s2.filterBounds(area2)
                    .filterDate(start_date, end_date)
                    .map(clipImage)
                    .median()

        var ndmi = s2Col.normalizedDifference(['B8A','B11']).rename('ndmi');
        var ndvi = s2Col.normalizedDifference(['B8','B4']).rename('ndvi');
        var ndwi = s2Col.normalizedDifference(['B3','B8']).rename('ndwi');
        var nbr = s2Col.normalizedDifference(['B8','B12']).rename('nbr');

        // Get elevation, slope and aspect
        var elevation = ee.Image("NASA/NASADEM_HGT/001").clip(area2).select("elevation");
        var slope = ee.Terrain.slope(elevation); 
        var percentage = slope.divide(180).multiply(Math.PI).tan().rename('percentage');
        var aspect = ee.Terrain.aspect(elevation).rename('aspect');

        // Get Corine Land Cover
        var corine = ee.Image('COPERNICUS/CORINE/V20/100m/2012');
        //URBAN SURFACE
        var corine = corine.where(corine.gte (111).and (corine.lte (133)), 0.0) //green urban areas
                           .where(corine.gte (141).and (corine.lte (142)), 0.01) //Non-irrigated arable land
                           .where(corine.eq(211),0.1) //irrigated land
                           .where(corine.gte (212).and (corine.lte (213)), 0.0) //wody groves
                           .where(corine.gte (221).and (corine.lte (223)), 0.07) //pastures
                           .where(corine.eq (231), 0.4) //associated annual with permanent crops
                           .where(corine.gte (241).and (corine.lte (242)), 0.08) //agriculture with natural vegetation
                           .where(corine.gte (243).and (corine.lte (244)), 0.4) //broad-leaved and mixed forest
                           .where(corine.gte (311).and (corine.lte (313)), 0.8) //coniferous forest
                           .where(corine.eq (312), 0.7) //natural grassland and sclerophyllous vegetation
                           .where(corine.eq (321), 0.4) //moors and heathland
                           .where(corine.eq (322), 1) //natural grassland and sclerophyllous vegetation
                           .where(corine.eq (323), 0.6) //transitional woodland-scrub
                           .where(corine.eq (324), 0.9) //sparsely vetated and burnt areas
                           .where(corine.gte (331).and (corine.lte (334)),0.3) //wetlands and water bodies
                           .where(corine.gte (411).and (corine.lte (523)),0);
        
        // Distance from settlements
        var settlements = ee.Image('DLR/WSF/WSF2015/v1').unmask(0).clip(area2);
        var euclideanKernel = ee.Kernel.euclidean({radius:(512/2)-1, units:'pixels'});
        var dist = settlements.select('WSF').distance({kernel:euclideanKernel});
        var dist = dist.rename('eucdist_settlements');

        var landCover = corine.rename('corine');

        // Land Cover
        var lc = ee.ImageCollection("ESA/WorldCover/v200").first();
        var flc = lc.where(lc.eq(10), 1)
                    .where(lc.eq(20), 0.7)
                    .where(lc.eq(30), 0.5)
                    .where(lc.eq(40), 0)
                    .where(lc.eq(50), 0)
                    .where(lc.eq(60), 0)
                    .where(lc.eq(70), 0)
                    .where(lc.eq(80), 0)
                    .where(lc.eq(90), 0)
                    .where(lc.eq(95), 0)
                    .where(lc.eq(100), 0)
        var flc = flc.rename('lc_veg');

        var percentage = percentage.where(percentage.gte (0).and (percentage.lt (0.05)), 0.1)
                        .where(percentage.gte (0.05).and (percentage.lt (0.30)), 0.3)
                        .where(percentage.gte (0.30).and (percentage.lt (0.55)), 0.6)
                        .where(percentage.gte (0.55), 1);
        
        var aspect = aspect.where(aspect.gte (0).and (aspect.lt (90)), 0.1)
                        .where(aspect.gte (90).and (aspect.lt (180)), 0.4)
                        .where(aspect.gte (180).and (aspect.lt (270)), 0.4)
                        .where(aspect.gte (270).and (aspect.lt (360)), 0.1);
                        
        var lst = lst.where( lst.lt (20), 0.1)
                        .where(lst.gte (20).and (lst.lt (30)), 0.3)
                        .where(lst.gte (30).and (lst.lt (40)), 0.6)
                        .where(lst.gte (40), 1);
                        
        var ndmi = ndmi.where(ndmi.gte (-1).and (ndmi.lt (-0.20)), 1)
                        .where(ndmi.gte (-0.20).and (ndmi.lt (-0.10)), 0.6)
                        .where(ndmi.gte (-0.10).and (ndmi.lt (0.1)), 0.3)
                        .where(ndmi.gte (0.1).and (ndmi.lt (1)), 0.1);
                    
        
        var nbr = nbr.where(nbr.gte (-1).and (nbr.lt (0.07)), 0.1)
                        .where(nbr.gte (0.07).and (nbr.lt (0.14)), 0.3)
                        .where(nbr.gte (0.14).and (nbr.lt (0.22)), 0.6)
                        .where(nbr.gte (0.22).and (nbr.lt (1)), 1); 
                    
        var ndwi = ndwi.where(ndwi.gte (-1).and (ndwi.lt (-0.01)), 1)
                        .where(ndwi.gte (-0.01).and (ndwi.lt (1)), 0);
        
        var ndvi = ndvi.where(ndvi.gte (-1).and (ndvi.lt (0.12)), 0.1)
                        .where(ndvi.gte (0.12).and (ndvi.lt (0.20)), 0.3)
                        .where(ndvi.gte (0.20).and (ndvi.lt (0.35)), 0.6)
                        .where(ndvi.gte (0.35).and (ndvi.lt (1)), 1);
        
        var dist = dist.where(dist.gte(0).and (dist.lt (5)), 1)
                        .where(dist.gte(5).and (dist.lt (10)), 0.6)
                        .where(dist.gte(10).and (dist.lt (40)), 0.3)
                        .where(dist.gte(40), 0.1);
        
        var image = lst.addBands(ndmi).addBands(ndvi)
                    .addBands(percentage).addBands(dist).addBands(flc)
                    .addBands(ndwi).addBands(nbr)
                    .addBands(aspect).addBands(landCover);
        
        var overlay = image.expression(
            '0.1 *ndmi + 0.05*nbr + 0.1 *ndwi + 0.05*ndvi + 0.15 *percentage + 0.05 *aspect +'
            + '0.05 * lst + 0.35 * corine + 0.05 * lc_veg + 0.05 * eucdist_settlements', {
                'lst':image.select('lst'),
                'lc_veg':image.select('lc_veg'),
                'corine':image.select('corine'),
                'eucdist_settlements':image.select('eucdist_settlements'),
                'percentage':image.select('percentage'),
                'ndvi':image.select('ndvi'),
                'ndmi':image.select('ndmi'),
                'ndwi': image.select('ndwi'),
                'nbr': image.select('nbr'),
                'aspect': image.select('aspect')
            }).rename('fire_risk');
        
        var crs = overlay.projection().crs();
        
        // Normalize to 0 - 1
        var minMax = overlay.reduceRegion({
            reducer: ee.Reducer.minMax(),
            geometry: area2,
            scale: 100,
            maxPixels: 1e9
        });
        
        var min = ee.Number(minMax.get('fire_risk_min'));
        var max = ee.Number(minMax.get('fire_risk_max'));

        var overlay_norm = overlay.subtract(min).divide(max.subtract(min));
        var overlay_norm = overlay_norm.rename('FR');

        var visParams = {
            min: 0,
            max: 1,
            palette: ['green', 'yellow', 'orange', 'red']
        };
        
        // Aplicar resampling con 'nearest' (nearest neighbor)
        var overlay_resampled = overlay_norm.resample('bicubic')
                                            .reproject({
                                                crs: overlay_norm.projection(), 
                                                scale: 100
                                            });

        var overlay_resampled = overlay_resampled.resample('bicubic')
                                            .reproject({
                                                crs: overlay_resampled.projection(), 
                                                scale: 10
                                            });

        // Calcular los percentiles
        var percentiles = overlay_resampled.reduceRegion({
            reducer: ee.Reducer.percentile([50, 80]),
            geometry: area2,
            scale: 100,
            maxPixels: 1e9
        });

        // Extraer los valores de percentiles
        var p50 = ee.Number(percentiles.get('FR_p50'));
        var p80 = ee.Number(percentiles.get('FR_p80'));

        // Create a classified image based on percentiles
        var classified = overlay_resampled.expression(
            '(FR <= p50) ? 1 : ' + // Low Risk
            '(FR <= p80) ? 2 : 3', // High Risk
            {
            'FR': overlay_resampled,
            'p50': p50,
            'p80': p80
            }).rename('fire_risk_class');
        
        // Define visualization parameters
        var visParamsClass = {
            min: 1,
            max: 3,
            palette: ['green', 'orange', 'red']
        };

        return {
            "url_xyz": overlay_norm.getMap(visParams)["urlFormat"],
            "url_class_xyz": classified.clip(area).getMap(visParamsClass)["urlFormat"]
        };
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}


const post_statistics = async (id, geometry_s, indices_s, gee_type, start_date_s, end_date_s) => {
    try {
        let geometry, indices, start_date, end_date;
        const geom_default = [[-4.7,40.65], [-4.674,40.65], [-4.674,40.66], [-4.7,40.66], [-4.7,40.65]];

        geometry = getDefault(ee.Geometry.Polygon(JSON.parse(geometry_s)), ee.Geometry.Polygon(geom_default));
        indices = getDefault(indices_s.split(",").filter(band => band !== ""), []);
        start_date = new Date(getDefault(start_date_s, '2024-01-01'));
        end_date = new Date(getDefault(end_date_s, '2024-03-01'));

        var area = ee.Geometry(geometry).area(1).divide(1000000).getInfo();
        console.log(area)
        if (area < 4500){
            scale_val = 30;
        }else if (area > 4500 && area < 50000){
            scale_val = 100;
        }else if (area >= 50000){
            scale_val = 300;
        }

        if (gee_type === "image") {
            var image = ee.Image(id).clip(geometry).select(indices);

            var stats = image.reduceRegion({
                reducer: ee.Reducer.minMax().combine({
                    reducer2: ee.Reducer.mean(),
                    sharedInputs: true
                }),
                geometry: geometry,
                scale: scale_val
            });

            return stats.getInfo();
            
        } else if (gee_type === "image_collection") {
            var image = ee.ImageCollection(id)
                        .filterBounds(geometry)
                        .filterDate(start_date, end_date)
                        .mean()
                        .clip(geometry);
            
            if (id.includes("S2")){
                var image = addBandsS2(image)
            }

            var image = image.select(indices)

            var stats = image.reduceRegion({
                reducer: ee.Reducer.minMax().combine({
                    reducer2: ee.Reducer.mean(),
                    sharedInputs: true
                }),
                geometry: geometry,
                scale: scale_val
            });

            return stats.getInfo();
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const post_carbon = async (geometry_s) => {
    try{
        let geometry, start_date, end_date;
        const geom_default = [[-4.7,40.65], [-4.674,40.65], [-4.674,40.66], [-4.7,40.66], [-4.7,40.65]];

        geometry = getDefault(ee.Geometry.Polygon(JSON.parse(geometry_s)), ee.Geometry.Polygon(geom_default));
        //Importacion datos
        var imageCollection = ee.ImageCollection("WCMC/biomass_carbon_density/v1_0"), //Contiene datos de densidad de biomasa y carbono global.
        imageCollection2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED"), //Imágenes Sentinel-2 (armonizadas)
        imageCollection3 = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1"); //Datos de Dynamic World de cobertura del suelo (incluyendo árboles)

        // Carga de la imagen de carbono
        var carbon = imageCollection.first(); //Selecciona la primera imagen de la colección de carbono y la recorta a la ROI
        Map.addLayer(carbon.clip(roi), [], 'carbon', false); //La capa se agrega al mapa con el nombre 'carbon'

        //Procesamiento de imágenes Sentinel-2
        var sen2 = imageCollection2
            .select('B.*') // Selecciona todas las bandas espectrales.
            .filterBounds(roi) // Filtra imágenes dentro del ROI.
            .filterDate('2020', '2021') // Filtra por fechas.
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)) // Menos del 10% de nubes.
            .median() // Se calcula una imagen promedio (mediana)
            .multiply(0.0001); // Normaliza valores para escalar la imagen.

        //Calculo indice NDVI
        var ndvi = sen2.normalizedDifference(['B8','B4']).rename('NDVI');

        // Visualizar el NDVI
        var paleta_ndvi = ['CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901', '66A000', 
                    '529400', '3E8601', '207401', '056201', '004C00', '023B01', '012E01', 
                    '011D01', '011301'];
        var ndviParametros = {min: 0, max: 1, palette: paleta_ndvi};
        Map.addLayer(ndvi.clip(roi), ndviParametros, 'NDVI', false);

        //Clasificación de cobertura del suelo
        var dw = imageCollection3 
        .select('label')
        .filterDate('2020', '2021')
        .filterBounds(roi)
        .mode() //Obtiene el valor más común (moda)
        .eq(1); //Filtra las imágenes de cobertura del suelo y selecciona los píxeles clasificados como árboles (valor = 1)

        //Combinación de predictores  
        //Combina un conjunto de capas predictoras: Una constante (bias), las bandas de sen2 y el indice NDVI
        //Se enmascaran los píxeles no clasificados como arboles.
        var predictors = ee.Image.constant(1)
        .addBands(sen2) //// Bandas espectrales de Sen2
        .addBands(ndvi) // NDVI como predictor
        .updateMask(dw);// Máscara de árboles para limitar los datos a zonas arboladas
        Map.addLayer(predictors.clip(roi), [], 'predictors', false);

        //Combinar predictores y carbono
        //Se crea un dataset que contiene tanto los predictores como la capa de carbono para realizar el modelo de regresión
        var dataset = predictors.addBands(carbon);

        //Construir Modelo de Regresión Robusta

        //Aplica un modelo de regresión robusta lineal para estimar la relación entre los predictores y el carbono
        //Parametros: 14-> Número de predictores y 1-> Número de variables dependientes.
        var model = dataset.reduceRegion({
        reducer: ee.Reducer.robustLinearRegression(14, 1), geometry: roi, scale: 250, bestEffort: true
        });

        //Aplicación del modelo para generar el mapa de carbono
        var coef = ee.Array(model.get('coefficients')).project([0]).toList(); //Obtiene los coeficientes del modelo
        var sen2_carbon = predictors.multiply(ee.Image.constant(coef))
        .reduce(ee.Reducer.sum()) // Suma ponderada de predictores.
        .clip(roi)
        .rename('Carbono_Estimado'); //Calcula un mapa de carbono estimado multiplicando los predictores por los coeficientes
        Map.addLayer(sen2_carbon, {min: 0, max: 100, palette: ['blue', 'green', 'yellow', 'red']}, 'Carbono Estimado'); //Visualiza el resultado

        //Cálculo del error RMSE
        //Se calcula el error cuadrático medio (RMSE) entre la capa de carbono original y el modelo de carbobo estimado
        var dif = carbon.subtract(sen2_carbon);
        var pow = dif.pow(2);
        var rmse = ee.Number(pow.reduceRegion({
        reducer: ee.Reducer.mean(), geometry: roi, scale: 250
        }).values().get(0)).sqrt();
        print('El error rmse es:', rmse);

        //Calculo de Estadísticas Descriptivas del Carbono estimado
        var stats = sen2_carbon.reduceRegion({
        reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), '', true).combine(ee.Reducer.stdDev(), '', true).combine(ee.Reducer.sum(), '', true),
        geometry: roi,
        scale: 100,
        maxPixels: 1e13
        });
        print('Estadísticas del Carbono Estimado:', stats);


    }catch (error){
        console.log(error);
        throw error;
    }


}

module.exports = {
    get_mapid,
    post_mapid,
    get_available_dates,
    get_time_series,
    post_time_series,
    get_hillshade,
    get_flood,
    get_hotspot,
    get_burned,
    display_img,
    post_statistics,
    fire_risk,
    post_carbon
}
