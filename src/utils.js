var type_map  = {
    0x1: "TYPE_MONSTER",
    0x2: "TYPE_SPELL",
    0x4: "TYPE_TRAP",
    0x10: "TYPE_NORMAL",
    0x20: "TYPE_EFFECT",
    0x40: "TYPE_FUSION",
    0x80: "TYPE_RITUAL",
    0x100: "TYPE_TRAPMONSTER",
    0x200: "TYPE_SPIRIT",
    0x400: "TYPE_UNION",
    0x800: "TYPE_DUAL",
    0x1000: "TYPE_TUNER",
    0x2000: "TYPE_SYNCHRO",
    0x4000: "TYPE_TOKEN",
    0x10000: "TYPE_QUICKPLAY",
    0x20000: "TYPE_CONTINUOUS",
    0x40000: "TYPE_EQUIP",
    0x80000: "TYPE_FIELD",
    0x100000: "TYPE_COUNTER",
    0x200000: "TYPE_FLIP",
    0x400000: "TYPE_TOON",
    0x800000: "TYPE_XYZ",
    0x1000000: "TYPE_PENDULUM",
    0x2000000: "TYPE_SPSUMMON",
    0x4000000: "TYPE_LINK"
  }

var attribute_map_cn = {
    0x01: "地",
    0x02: "水",
    0x04: "炎",
    0x08: "风",
    0x10: "光",
    0x20: "暗",
    0x40: "神"
}

function map_cdb_attribute(attr) {
    let x = parseInt(attr);
    if (!isNaN(x) && attribute_map_cn.hasOwnProperty(x)) {
        return attribute_map_cn[x];
    } else {
        return attr;
    }
}

var race_map_cn = {
    0x1: "战士",
    0x2: "魔法使",
    0x4: "天使",
    0x8: "恶魔",
    0x10: "不死",
    0x20: "机械",
    0x40: "水族",
    0x80: "炎",
    0x100: "岩石",
    0x200: "鸟兽",
    0x400: "植物",
    0x800: "昆虫",
    0x1000: "雷",
    0x2000: "龙",
    0x4000: "兽",
    0x8000: "兽战士",
    0x10000: "恐龙",
    0x20000: "鱼",
    0x40000: "海龙",
    0x80000: "爬虫类",
    0x100000: "念动力",
    0x200000: "幻神兽",
    0x400000: "创造神",
    0x800000: "幻龙",
    0x1000000: "电子空间",
    0x2000000: "幻想魔"
}

function map_cdb_race(race) {
    let x = parseInt(race);
    if (!isNaN(x) && race_map_cn.hasOwnProperty(x)) {
        return race_map_cn[x];
    } else {
        return race;
    }
}
