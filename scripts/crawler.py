import re
import json
import requests
from bs4 import BeautifulSoup

num_pages = 3
data = []

def search_regex_all(text, regex):
    return re.findall(regex, text)

def simplify_name(name):
    name = re.sub(r'&Omega;', 'Ω', name)
    name = re.sub(r'&Xi;', 'Ξ', name)
    name = re.sub(r'&alpha;', 'α', name)
    name = re.sub(r'&beta;', 'β', name)
    name = re.sub(r'&delta;', 'δ', name)
    name = re.sub(r'&epsilon;', 'ε', name)
    name = re.sub(r'&forall;', '∀', name)
    name = re.sub(r'&gamma;', 'γ', name)
    name = re.sub(r'&infin;', '∞', name)
    name = re.sub(r'&ldquo;', '“', name)
    name = re.sub(r'&rdquo;', '”', name)
    name = re.sub(r'&times;', '×', name)
    name = re.sub(r'&zeta;', 'ζ', name)
    return name

def simplify_ruby(ruby):
    ruby = re.sub(r'[　・－-]|&.*?;', '', ruby)
    ruby = re.sub(r'う゛', 'ゔ', ruby)
    return ruby

def crawl():
    global data
    for n in range(1, num_pages + 1):
        print('page: ', n)
        url = f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&ctype=1&rp=100&jogai=2&jogai=9&jogai=10&jogai=17&page={n}&request_locale=ja"
        response = requests.get(url)
        print(response.status_code)
        if response.status_code == 200:
            content = response.text
            content = content.replace("\n", "").replace("\t", "").replace(" ", "")
            cards_raw = search_regex_all(content, r'<divclass="t_rowc_normal">(.*?)<!--\.t_rowc_normal-->')
            cards_extracted = []
            for card_raw in cards_raw:
                card_ruby = search_regex_all(card_raw, r'card_ruby">(.*?)<')
                card_name = search_regex_all(card_raw, r'card_name">(.*?)<')
                card_attr = search_regex_all(card_raw, r'title="(.)属性"')
                card_level = search_regex_all(card_raw, r'<span>レベル(.*?)<')
                card_type = search_regex_all(card_raw, r'【(.*?)族')
                card_attack = search_regex_all(card_raw, r'<span>攻撃力(.*?)</span>')
                card_defense = search_regex_all(card_raw, r'<span>守備力(.*?)</span>')
                card_ruby = simplify_ruby("".join(card_ruby))
                card_name = simplify_name("".join(card_name))
                cards_extracted.append({
                    "Ruby": card_ruby,
                    "Name": card_name,
                    "Attribute": card_attr[0] if card_attr else None,
                    "Level": card_level[0] if card_level else None,
                    "Type": card_type[0] if card_type else None,
                    "Attack": card_attack[0] if card_attack else None,
                    "Defense": card_defense[0] if card_defense else None
                })
            data += cards_extracted

    with open("../src/constants/cards.json", "w", encoding="utf-8") as outfile:
        json.dump(data, outfile, ensure_ascii=False)

# To run the web scraping:
crawl()

# To read the JSON data:
# with open("cards.json", "r") as infile:
#     data = json.load(infile)
