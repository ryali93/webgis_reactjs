import logging
import onnxruntime as ort

logger = logging.getLogger("uvicorn")

def load_onnx_models():
    logger.info("Cargando modelos ONNX...")
    sr_model = ort.InferenceSession("src/weights/han_sr.onnx")
    seg_model = ort.InferenceSession("src/weights/building_segmentation.onnx")
    logger.info("Modelos ONNX cargados correctamente.")
    return sr_model, seg_model

# Cargar modelos solo una vez
onnx_sr_model, onnx_segmentation_model = load_onnx_models()
