const ee = require('@google/earthengine');


var sensorInfo = {
    'Sentinel-2': {
      id: 'COPERNICUS/S2_SR_HARMONIZED',
      scale: 10,
      aoiRadius: 30,
      index: {
        NBR: 'NBR',
        NDVI: 'NDVI',
        NDMI: 'NDMI',
        NDWI: 'NDWI',
        GNDVI: 'GNDVI',
        EVI: 'EVI',
        SAVI: 'SAVI',
        Blue: 'B2',
        Green: 'B3',
        Red: 'B4',
        NIR: 'B8',
        SWIR1: 'B11',
        SWIR2: 'B12'
      },
      rgb: {
        'SWIR1/NIR/GREEN': {
          bands: ['B11', 'B8', 'B3'],
          min: [100, 151 , 50],
          max: [4500, 4951, 2500],
          gamma: [1, 1, 1]
        },
        'RED/GREEN/BLUE': {
          bands: ['B4', 'B3', 'B2'],
          min: [0, 50, 50],
          max: [2500, 2500, 2500],
          gamma: [1.2, 1.2, 1.2]
        },
        'NIR/RED/GREEN': {
          bands: ['B8', 'B4', 'B3'],
          min: [151, 0, 50],
          max: [4951, 2500, 2500],
          gamma: [1, 1, 1]
        },
        'NIR/SWIR1/RED': {
          bands: ['B8', 'B11', 'B3'],
          min: [151, 100, 50],
          max: [4951, 4500, 2500],
          gamma: [1, 1, 1]
        },
        'NDVI': {
          bands: ['NDVI'],
          min: -0.4, max: 1,
          palette: ["0c0c0c","bfbfbf","dbdbdb","eaeaea","fff9cc","ede8b5","ddd89b","ccc682","bcb76b","afc160","a3cc59","91bf51","7fb247","70a33f","609635","4f892d","3f7c23","306d1c","216011","0f540a","004400"]
        },
        'NBR': {
          bands: ['NBR'],
          min: -0.5, max: 0,
          // palette: ['662506', '993404', 'cc4c02', 'ec7014', 'fe9929', 'fec44f', 'fee391', 'fff7bc', 'ffffe5']
          palette: ['662506', '993404', 'cc4c02', 'ec7014', 'fe9929', 'fec44f', 'fee391', 'fff7bc', 'ffffe5']
        },
        'NDMI': {
          bands: ['NDMI'],
          min: -0.8, max: 0.8,
          palette: ['800000', 'ff0000', 'ffff00', '00ffff', '0000ff', '000080']
        },
        'NDWI': {
          bands: ['NDWI'],
          min: -0.1, max: 0.15,
          palette: ['008000', 'FFFFFF', '0000CC'],
        },
        'SAVI': {
          bands: ['SAVI'],
          // min: 0, max: 0.8,
          // palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
          min: -0.4, max: 1,
          palette: ["0c0c0c","bfbfbf","dbdbdb","eaeaea","fff9cc","ede8b5","ddd89b","ccc682","bcb76b","afc160","a3cc59","91bf51","7fb247","70a33f","609635","4f892d","3f7c23","306d1c","216011","0f540a","004400"]
        },
        'EVI': {
          bands: ['EVI'],
          // min: 0, max: 0.8,
          // palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
          min: -0.4, max: 1,
          palette: ["0c0c0c","bfbfbf","dbdbdb","eaeaea","fff9cc","ede8b5","ddd89b","ccc682","bcb76b","afc160","a3cc59","91bf51","7fb247","70a33f","609635","4f892d","3f7c23","306d1c","216011","0f540a","004400"]
        },
        'GNDVI': {
          bands: ['GNDVI'],
          // min: 0, max: 0.8,
          // palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
          min: -0.4, max: 1,
          palette: ["0c0c0c","bfbfbf","dbdbdb","eaeaea","fff9cc","ede8b5","ddd89b","ccc682","bcb76b","afc160","a3cc59","91bf51","7fb247","70a33f","609635","4f892d","3f7c23","306d1c","216011","0f540a","004400"]
        }
      }
    }
  };
  
module.exports = {
    sensorInfo
}
