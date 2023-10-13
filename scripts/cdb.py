import json
from os import system
import re


def getScore(card, comparison):
    score = 0
    for key in card:
        if card[key] == comparison[key]:
            score = score + 1
    return score



def init_data():
    db = []
    cards = None
    with open("ygocdb.com.cards/cards.json", "r", encoding="UTF-8") as f:
        cards = json.load(f)
    for v in cards.values():
        card  = {}
        if "data" not in v:
            continue
        if v["data"]["race"] == 0 or re.search(r"同调|融合|超量|链接", v["text"]["types"]):
            continue
        card["Attack"] = v["data"]["atk"]
        card["Defense"] = v["data"]["def"]
        card["Attribute"] = v["data"]["attribute"]
        card["Level"] = v["data"]["level"]
        card["Type"] = v["data"]["race"]
        card["Name"] = ''
        if "cn_name" in v:
            card["Name"] = v["cn_name"]
        elif "cnocg_n" in v:
            card["Name"] = v["cnocg_n"]
        elif "jp_name" in v:
            card["Name"] = v["jp_name"]
        elif "en_name" in v:
            card["Name"].append(v["en_name"])
        else:
            continue
        if card['Attack'] == -2:
            card['Attack'] = - v['cid']
        if card['Defense'] == -2:
            card['Defense'] = - v['cid']
        db.append(card)
    return db

def db_to_json(db):
    with open("../src/constants/cards-cn.json", "w", encoding='utf8') as outfile: 
        json.dump(db, outfile, ensure_ascii=False)
        print('done')

cards_db = init_data()

def main():
    db_to_json(cards_db)



if __name__ == "__main__":
    main()
