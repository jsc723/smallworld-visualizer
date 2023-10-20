import os
import tempfile
import zipfile
import requests
import json
import re
from datetime import datetime
from google.cloud import storage  # If you want to store results in Google Cloud Storage
import functions_framework

def init_data_cn(cards):
    db = []
    for v in cards.values():
        card  = {}
        if "data" not in v:
            continue
        if v["data"]["race"] == 0 or re.search(r"同调|融合|超量|连接", v["text"]["types"]):
            continue
        card["Attack"] = v["data"]["atk"]
        card["Defense"] = v["data"]["def"]
        card["Attribute"] = v["data"]["attribute"]
        card["Level"] = int(v["data"]["level"]) % 16
        card["Type"] = v["data"]["race"]
        card["Name"] = ''
        card["MDName"] = v["md_name"] if "md_name" in v else ""
        if "cn_name" in v:
            card["Name"] = v["cn_name"]
        elif "cnocg_n" in v:
            card["Name"] = v["cnocg_n"]
        else:
            continue
        if card['Attack'] == -2:
            card['Attack'] = - v['cid']
        if card['Defense'] == -2:
            card['Defense'] = - v['cid']
        db.append(card)
    current_time = datetime.now()
    res = {
        'update_time': current_time.isoformat(),
        'db': db
    }
    return res

def init_data_jp(cards):
    db = []
    for v in cards.values():
        card  = {}
        if "data" not in v:
            continue
        if v["data"]["race"] == 0 or re.search(r"同调|融合|超量|连接", v["text"]["types"]):
            continue
        if "jp_name" not in v:
            continue
        card["Attack"] = v["data"]["atk"]
        card["Defense"] = v["data"]["def"]
        card["Attribute"] = v["data"]["attribute"]
        card["Level"] = int(v["data"]["level"]) % 16
        card["Type"] = v["data"]["race"]
        card["Ruby"] = v["jp_ruby"]
        card["Name"] = v["jp_name"]
        
        if card['Attack'] == -2:
            card['Attack'] = - v['cid']
        if card['Defense'] == -2:
            card['Defense'] = - v['cid']
        db.append(card)
    current_time = datetime.now()
    res = {
        'update_time': current_time.isoformat(),
        'db': db
    }
    return res


@functions_framework.http
def update_db(request):
    zip_url = "https://ygocdb.com/api/v0/cards.zip"  # Replace with your ZIP file URL

    # Step 1: Download the ZIP file
    response = requests.get(zip_url)
    if response.status_code != 200:
        return "Failed to download ZIP file"

    # Step 2: Create a temporary directory to extract the contents
    with tempfile.TemporaryDirectory() as temp_dir:
        zip_path = os.path.join(temp_dir, "downloaded.zip")
        with open(zip_path, "wb") as zip_file:
            zip_file.write(response.content)

        # Step 3: Unzip the ZIP file
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        # Step 4: Read the JSON file
        json_file_path = os.path.join(temp_dir, "cards.json")  # Adjust the path accordingly
        if not os.path.exists(json_file_path):
            return "JSON file not found in ZIP"

        # Step 5: Read the JSON content
        with open(json_file_path, "r", encoding="utf-8") as json_file:
            json_data = json.load(json_file)

    db_cn = init_data_cn(json_data)
    db_jp = init_data_jp(json_data)

    # Step 6: Process the JSON data or store it as needed
    # For example, if you want to store the JSON data in Google Cloud Storage
    storage_client = storage.Client()
    bucket = storage_client.bucket("ygo-small-world-tool-bucket")
    blob_cn = bucket.blob("cards-cn-v3.json")
    blob_cn.upload_from_string(json.dumps(db_cn, ensure_ascii=False), content_type="application/json")
    blob_jp = bucket.blob("cards-jp-v3.json")
    blob_jp.upload_from_string(json.dumps(db_jp, ensure_ascii=False), content_type="application/json")

    return 'ok'  # Return JSON content as a response

# Note: You may need to adjust the URL and paths to match your specific ZIP file structure.
