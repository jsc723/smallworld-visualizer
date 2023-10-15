import json
from os import system
import re


def getScore(card, comparison):
    score = 0
    for key in card:
        if card[key] == comparison[key]:
            score = score + 1
    return score



def init_data_cn():
    db = []
    cards = None
    with open("ygocdb.com.cards/cards.json", "r", encoding="UTF-8") as f:
        cards = json.load(f)
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
    return db

def init_data_jp():
    db = []
    cards = None
    with open("ygocdb.com.cards/cards.json", "r", encoding="UTF-8") as f:
        cards = json.load(f)
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
    return db

def db_to_json(db, out_path):
    with open(out_path, "w", encoding='utf8') as outfile: 
        outfile.write("var db = ")
        json.dump(db, outfile, ensure_ascii=False)
        print('write to', out_path)


def main():
    db_to_json(init_data_cn(), "../src/constants/cards-cn.js")
    db_to_json(init_data_jp(), "../src/constants/cards-jp.js")



if __name__ == "__main__":
    main()
