import Group from 'ol/layer/Group';
import TileLayer from 'ol/layer/WebGLTile';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlSourceXYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

var ip_server = 'localhost';
var port_geoserver = 8085;

const baseLayers = new Group({
    title: 'Basemaps',
    openInLayerSwitcher: true,
    noSwitcherDelete: true,
    layers: [
        new TileLayer({
            id: 'Planet',
            title: 'Planet',
            source: new OlSourceXYZ({
                url: 'https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2024_02_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAKe989a4955bb2438989b94eda796179f3',
                tileSize: 512
            }),
            queryable: false,
            noSwitcherDelete: true,
            displayInLayerSwitcher : true,
            visible: false
        }),
        new OlLayerTile({
            id: 'ortho',
            title: "Orthoimage",
            name: 'ortho',
            source: new TileWMS({
                url: 'http://'+ip_server+':'+port_geoserver+'/geoserver/apimov/wms', //url_proxy + 
                params: {
                    LAYERS: 'apimov:OI_OrthoimageCoverage', 
                    VERSION: '1.1.1', 
                    TILED: true
                },
            transition: 0
            }),
            noSwitcherDelete: true,
            displayInLayerSwitcher : true,
            visible: false,
            queryable: true,
            icon: 'fa-solid fa-circle point'
        }),
        new OlLayerTile({
            source: new OlSourceOsm(),
            title: 'OpenStreetMap',
            type: 'base',
            visible: true,
        }),
        new OlLayerTile({
            source: new OlSourceXYZ({
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                }),
                title: 'Satellite',
                type: 'base',
                visible: false,
        }),
    ],
  });


var ortho_east_view = new TileLayer({
    id: 'ortho_east_view',
    title: "Horizontal deformation",
    name: 'ortho_east_view',
    source: new TileWMS({
        url: 'http://'+ip_server+':'+port_geoserver+'/geoserver/apimov/wms', //url_proxy + 
        params: {
            LAYERS: 'ortho_east_view', 
            VERSION: '1.1.1', 
            TILED: true
        },
        // projection: projection,
        // tileLoadFunction: tileLoadFunction,
        // tileGrid: tileGrid512,
        transition: 0
    }),
    noSwitcherDelete: true,
    displayInLayerSwitcher : true,
    visible: false,
    queryable: true,
    icon: 'fa-solid fa-circle point_east'
});

var ortho_up_view = new TileLayer({
    id: 'ortho_up_view',
    title: "Vertical deformation",
    name: 'ortho_up_view',
    source: new TileWMS({
        url: 'http://'+ip_server+':'+port_geoserver+'/geoserver/apimov/wms', //url_proxy + 
        params: {
            LAYERS: 'ortho_up_view', 
            VERSION: '1.1.1', 
            TILED: true
        },
        transition: 0
    }),
    noSwitcherDelete: true,
    displayInLayerSwitcher : true,
    visible: true,
    queryable: true,
    icon: 'fa-solid fa-circle point_up'
});

var tramos = new TileLayer({
    id: 'buffer',
    title: "Tramos",
    name: 'buffer',
    source: new TileWMS({
        url: 'http://'+ip_server+':'+port_geoserver+'/geoserver/ows?', //url_proxy + 
        params: {
            LAYERS: 'apimov:buffer', 
            VERSION: '1.1.1', 
            TILED: true
        },
        transition: 0
      }),
      noSwitcherDelete: true,
      displayInLayerSwitcher : true,
      visible: true,
      queryable: true,
      icon: 'fa-solid fa-square buffer'
    })


var egmsLayers = new Group({
    id: 'egms',
    title: 'EGMS',
    openInLayerSwitcher: true,
    noSwitcherDelete: true,
    layers:
      [
        tramos,
        ortho_east_view,
        ortho_up_view
      ]
  });

export {baseLayers, egmsLayers};