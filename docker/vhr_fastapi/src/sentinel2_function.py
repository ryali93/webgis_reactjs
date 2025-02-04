import logging
from fastapi import APIRouter, HTTPException
from src.methods import get_sentinel2, get_sr, get_buildings, get_visualization
from src.models import onnx_sr_model, onnx_segmentation_model  # Importar desde `models.py`
from src.basemodels import SearchRequestS2, SuperResolution

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/download_s2")
async def download_s2(request: SearchRequestS2):
    try:
        logger.info(f"[download_s2] Request received: {request}")
        return await get_sentinel2(**request.model_dump())
    except Exception as e:
        logger.error(f"[download_s2] Error in download_s2: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sr_s2")
async def sr_s2(request: SuperResolution):
    try:
        logger.info(f"[sr_s2] Request received: {request}")
        return await get_sr(request.folder, onnx_sr_model)
    except Exception as e:
        logger.error(f"[sr_s2] Error in sr_s2: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_builds")
async def get_builds(request: SuperResolution):
    try:
        logger.info(f"[get_builds] Request received: {request}")
        return await get_buildings(request.folder, onnx_segmentation_model)
    except Exception as e:
        logger.error(f"[get_builds] Error in get_builds: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# GET VISUALIZATION
@router.post("/get_vis")
async def get_vis(request: SuperResolution):
    try:
        logger.info(f"Request received: {request}")
        return await get_visualization(**request.model_dump())
    except Exception as e:
        logger.error(f"Error in get_vis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    