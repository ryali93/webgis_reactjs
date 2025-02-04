import os
import cubo
import tempfile
import numpy as np
from datetime import datetime, timedelta
from typing import List
from fastapi import HTTPException
from skimage import exposure
import matplotlib.pyplot as plt
import io
import base64
import nest_asyncio

nest_asyncio.apply()

async def get_sentinel2(
        lat: float,
        lon: float,
        bands: List[str],
        fechas: str,
        edge_size: int,
        path: str
    ):
    try:
        fechas = fechas.split(" || ")
        print(fechas)

        # tempfile.tempdir = "src/public/outputs"
        path = tempfile.mkdtemp()

        for fecha in fechas:
            days_delay = 10
            print(f"Parámetros recibidos: lat={lat}, lon={lon}, fecha={fecha}")
            fecha = datetime.strptime(fecha, "%Y-%m-%d")
            start_date = (fecha - timedelta(days=days_delay)).strftime("%Y-%m-%d")
            end_date = (fecha + timedelta(days=days_delay)).strftime("%Y-%m-%d")

            da = cubo.create(
                lat=lat,
                lon=lon,
                collection="sentinel-2-l2a",
                bands=bands,
                start_date=start_date,
                end_date=end_date,
                edge_size=edge_size,
                units="px",
                resolution=10,
                query={"eo:cloud_cover": {"lt": 50}}
            )

            dates = da.time.values.astype("datetime64[D]").astype(str).tolist()
            
            for i in range(len(dates)):
                path_image = f"{path}/image_{dates[i]}.npy"
                data = da[i].to_numpy()
                np.save(path_image, data)

        return path
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error procesando Sentinel-2: {e}")

async def get_sr(folder: str, model):
    """Realiza super-resolución en las imágenes Sentinel-2 con el modelo ONNX cargado."""
    path_list = [folder + "/" + x for x in os.listdir(folder) if x.startswith("image")]
    path_list_sr = []

    for path_i in path_list:
        date_eval = path_i.split("/")[-1].split("_")[1].split(".")[0]
        lr = np.load(path_i)
        lr = lr[0:3] / 10000

        # Añadir padding
        lr = np.pad(lr, ((0, 0), (16, 16), (16, 16)), mode="edge").astype(np.float32)

        # Inferencia con ONNX
        input_name = model.get_inputs()[0].name
        sr_img = model.run(None, {input_name: lr[None]})[0].squeeze()

        # Remover padding
        super_img = sr_img[:, 64:-64, 64:-64]

        path_sr = f"{folder}/sr_{date_eval}_onnx.npy"
        path_list_sr.append(path_sr)
        np.save(path_sr, super_img)

    return path_list_sr

def preprocess_image_for_inference(image_path, normalize=False, mean=None, std=None):
    image = np.load(image_path).squeeze()
    image = np.moveaxis(image, 0, -1).astype(np.float32)

    if normalize and mean is not None and std is not None:
        image = (image - mean) / std

    image = np.transpose(image, (2, 0, 1)).astype(np.float32)
    return image

def inference_building(path_to_image, model, threshold=0.5):
    mean = np.array([0.2108307, 0.1849077, 0.15864254], dtype=np.float32)
    std = np.array([0.05045007, 0.0406715, 0.03748639], dtype=np.float32)

    image = preprocess_image_for_inference(path_to_image, normalize=True, mean=mean, std=std)

    input_name = model.get_inputs()[0].name
    output = model.run(None, {input_name: image[None]})[0]

    output = (output > threshold).astype(np.float32).squeeze()
    return output

async def get_buildings(folder: str, model):
    """Realiza segmentación de edificios usando el modelo ONNX ya cargado."""
    path_list = [folder + "/" + x for x in os.listdir(folder) if "sr" in x]
    path_buildings = []

    for path_i in path_list:
        try:
            date_eval = path_i.split("/")[-1].split("_")[1].split(".")[0]
            print(f"Procesando: {date_eval}")

            pred_np_buildings = inference_building(path_i, model)

            path_sr = f"{folder}/build_{date_eval}_onnx.npy"
            np.save(path_sr, pred_np_buildings)
            path_buildings.append(path_sr)
        except Exception as e:
            print(f"Error en {path_i}: {e}")
            continue
    
    return path_buildings

async def get_visualization(folder: str):
    # i = 0
    images = ["{}/{}".format(folder, x) for x in os.listdir(folder) if x.startswith("image")]
    srs = ["{}/{}".format(folder, x) for x in os.listdir(folder) if x.startswith("sr")]
    builds = ["{}/{}".format(folder, x) for x in os.listdir(folder) if x.startswith("build")]
    results = []

    for i in range(len(images)):
        date_eval = images[i].split("_")[-1].split(".")[0]
        date_folder = os.path.join(folder, date_eval)
        
        # Crear carpetas por fecha si no existen
        os.makedirs(date_folder, exist_ok=True)

        # Procesar imagen Sentinel-2
        img_np = np.moveaxis(np.load(images[i]), 0, -1)
        img_np = (img_np / 10000 * 3).clip(0, 1)
        img_np_equalized = exposure.equalize_hist(img_np)
        s2_img_b64 = save_image_to_base64(img_np_equalized[:, :, [0, 1, 2]], os.path.join(date_folder, f"s2_{date_eval}.png"))

        # Procesar imagen de superresolución
        sr_np = np.moveaxis(np.load(srs[i]), 0, -1)
        sr_np = (sr_np * 3).clip(0, 1)
        sr_np_equalized = exposure.equalize_hist(sr_np)
        sr_img_b64 = save_image_to_base64(sr_np_equalized[:, :, [0, 1, 2]], os.path.join(date_folder, f"sr_{date_eval}.png"))

        # Procesar imagen de edificaciones
        build_np = np.load(builds[i]).clip(0, 1)
        build_img_b64 = save_image_to_base64(build_np, os.path.join(date_folder, f"build_{date_eval}.png"), cmap="gray")

        # Agregar resultados al listado
        results.append({
            "date": date_eval,
            "s2_image": s2_img_b64,
            "sr_image": sr_img_b64,
            "build_image": build_img_b64
        })

    return results

# Función auxiliar para guardar y convertir imágenes a Base64
def save_image_to_base64(image_array, save_path, cmap=None):
    plt.imshow(image_array, cmap=cmap)
    plt.axis("off")

    # Guardar imagen en disco
    plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    # Convertir imagen a Base64
    buf = io.BytesIO()
    plt.imsave(buf, image_array, cmap=cmap, format='png')
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_b64
