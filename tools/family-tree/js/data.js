/**
 * FamilyTree Studio — Core Application Controller
 */

// Presets
const OGASAWARA_ACTUAL_DATA = {
  "title": "小笠原家 系譜図",
  "subtitle": "令和八年 吉日 調製（小笠原更一 家系・両家四代系譜）",
  "theme": "japanese",
  "layoutMode": "ancestry",
  "focusPersonId": "p_koichi",
  "persons": [
    {
      "id": "p_oga_gp_f",
      "name": "小笠原家 祖父（名前不詳）",
      "kana": "おがさわらけ そふ",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "父方祖父",
      "note": "小笠原家。子供7人（湊の実父）。",
      "spouses": [
        "p_oga_gp_m"
      ],
      "parents": [],
      "children": [
        "p_oga_sib_1",
        "p_oga_sib_3",
        "p_oga_sib_4",
        "p_oga_sib_5",
        "p_oga_sib_6",
        "p_oga_sib_7",
        "p_minato"
      ]
    },
    {
      "id": "p_oga_gp_m",
      "name": "小笠原家 祖母（名前不詳）",
      "kana": "おがさわらけ そぼ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "父方祖母",
      "note": "小笠原家。子供7人（湊の実母）。",
      "spouses": [
        "p_oga_gp_f"
      ],
      "parents": [],
      "children": [
        "p_oga_sib_1",
        "p_oga_sib_3",
        "p_oga_sib_4",
        "p_oga_sib_5",
        "p_oga_sib_6",
        "p_oga_sib_7",
        "p_minato"
      ]
    },
    {
      "id": "p_taizo_imai",
      "name": "今井 退蔵",
      "kana": "いまい たいぞう",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "母方祖父",
      "note": "今井家 当主。ゑみ子の実父。",
      "spouses": [
        "p_tane_imai"
      ],
      "parents": [],
      "children": [
        "p_emiko",
        "p_imai_chihei",
        "p_imai_yoko"
      ]
    },
    {
      "id": "p_tane_imai",
      "name": "今井 たね",
      "kana": "いまい たね",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "母方祖母",
      "note": "退蔵 妻。ゑみ子の実母。",
      "spouses": [
        "p_taizo_imai"
      ],
      "parents": [],
      "children": [
        "p_emiko",
        "p_imai_chihei",
        "p_imai_yoko"
      ]
    },
    {
      "id": "p_matsuda_gp_f",
      "name": "松田家 祖父（名前不詳）",
      "kana": "まつだけ そふ",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の父方祖父",
      "note": "松田家。子供11人（一郎の実父）。",
      "spouses": [
        "p_matsuda_gp_m"
      ],
      "parents": [],
      "children": [
        "p_matsuda_sib_1",
        "p_matsuda_sib_2",
        "p_matsuda_sib_3",
        "p_matsuda_sib_4",
        "p_matsuda_sib_5",
        "p_matsuda_sib_6",
        "p_matsuda_sib_7",
        "p_matsuda_sib_8",
        "p_matsuda_sib_9",
        "p_matsuda_sib_10",
        "p_ichiro_matsuda"
      ]
    },
    {
      "id": "p_matsuda_gp_m",
      "name": "松田家 祖母（名前不詳）",
      "kana": "まつだけ そぼ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の父方祖母",
      "note": "松田家。子供11人（一郎の実母）。",
      "spouses": [
        "p_matsuda_gp_f"
      ],
      "parents": [],
      "children": [
        "p_matsuda_sib_1",
        "p_matsuda_sib_2",
        "p_matsuda_sib_3",
        "p_matsuda_sib_4",
        "p_matsuda_sib_5",
        "p_matsuda_sib_6",
        "p_matsuda_sib_7",
        "p_matsuda_sib_8",
        "p_matsuda_sib_9",
        "p_matsuda_sib_10",
        "p_ichiro_matsuda"
      ]
    },
    {
      "id": "p_sadae_husband",
      "name": "祖父（貞江の夫・名前不詳）",
      "kana": "そふ（さだえのおっと）",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の母方祖父",
      "note": "貞江 夫。仁子の実父。",
      "spouses": [
        "p_sadae"
      ],
      "parents": [],
      "children": [
        "p_satoko_matsuda"
      ]
    },
    {
      "id": "p_sadae",
      "name": "貞江",
      "kana": "さだえ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の母方祖母",
      "note": "子供は1人（仁子のみ）。陽子の母方祖母。",
      "spouses": [
        "p_sadae_husband"
      ],
      "parents": [],
      "children": [
        "p_satoko_matsuda"
      ]
    },
    {
      "id": "p_oga_sib_1",
      "name": "長男（名前不詳）",
      "kana": "ちょうなん",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯父（長男）",
      "note": "小笠原家 7人兄弟の長男。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_oga_sib_3",
      "name": "三子（名前不詳）",
      "kana": "三し",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯叔父母（三子）",
      "note": "小笠原家 7人兄弟の三子。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_oga_sib_4",
      "name": "四子（名前不詳）",
      "kana": "四し",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯叔父母（四子）",
      "note": "小笠原家 7人兄弟の四子。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_oga_sib_5",
      "name": "五子（名前不詳）",
      "kana": "五し",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯叔父母（五子）",
      "note": "小笠原家 7人兄弟の五子。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_oga_sib_6",
      "name": "六子（名前不詳）",
      "kana": "六し",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯叔父母（六子）",
      "note": "小笠原家 7人兄弟の六子。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_oga_sib_7",
      "name": "七子（名前不詳）",
      "kana": "七し",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "伯叔父母（七子）",
      "note": "小笠原家 7人兄弟の七子。",
      "spouses": [],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_minato",
      "name": "小笠原 湊",
      "kana": "おがさわら みなと",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "実父（次男）",
      "note": "小笠原家7人兄弟の次男。更一の実父。",
      "spouses": [
        "p_emiko"
      ],
      "parents": [
        "p_oga_gp_f",
        "p_oga_gp_m"
      ],
      "children": [
        "p_yoko_sister",
        "p_koichi"
      ]
    },
    {
      "id": "p_emiko",
      "name": "小笠原 ゑみ子",
      "kana": "おがさわら えみこ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "実母（次女）",
      "note": "旧姓：今井。退蔵・たねの娘。更一の実母。",
      "spouses": [
        "p_minato"
      ],
      "parents": [
        "p_taizo_imai",
        "p_tane_imai"
      ],
      "children": [
        "p_yoko_sister",
        "p_koichi"
      ]
    },
    {
      "id": "p_imai_chihei",
      "name": "今井 地平",
      "kana": "いまい ちへい",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "伯父（長男）",
      "note": "今井 退蔵・たねの子。",
      "spouses": [],
      "parents": [
        "p_taizo_imai",
        "p_tane_imai"
      ],
      "children": []
    },
    {
      "id": "p_imai_yoko",
      "name": "今井 洋子",
      "kana": "いまい ようこ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "伯母（長女）",
      "note": "今井 退蔵・たねの子。",
      "spouses": [],
      "parents": [
        "p_taizo_imai",
        "p_tane_imai"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_1",
      "name": "兄弟姉妹 一（名前不詳）",
      "kana": "きょうだい 一",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（一）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_2",
      "name": "兄弟姉妹 二（名前不詳）",
      "kana": "きょうだい 二",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（二）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_3",
      "name": "兄弟姉妹 三（名前不詳）",
      "kana": "きょうだい 三",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（三）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_4",
      "name": "兄弟姉妹 四（名前不詳）",
      "kana": "きょうだい 四",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（四）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_5",
      "name": "兄弟姉妹 五（名前不詳）",
      "kana": "きょうだい 五",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（五）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_6",
      "name": "兄弟姉妹 六（名前不詳）",
      "kana": "きょうだい 六",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（六）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_7",
      "name": "兄弟姉妹 七（名前不詳）",
      "kana": "きょうだい 七",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（七）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_8",
      "name": "兄弟姉妹 八（名前不詳）",
      "kana": "きょうだい 八",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（八）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_9",
      "name": "兄弟姉妹 九（名前不詳）",
      "kana": "きょうだい 九",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（九）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_matsuda_sib_10",
      "name": "兄弟姉妹 十（名前不詳）",
      "kana": "きょうだい 十",
      "gender": "other",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "妻の伯叔父母（十）",
      "note": "松田家 11人兄弟姉妹のひとり。",
      "spouses": [],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": []
    },
    {
      "id": "p_ichiro_matsuda",
      "name": "松田 一郎",
      "kana": "まつだ いちろう",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": false,
      "relation": "義父（実父）",
      "note": "松田家11人兄弟のひとり。陽子の実父。",
      "spouses": [
        "p_satoko_matsuda"
      ],
      "parents": [
        "p_matsuda_gp_f",
        "p_matsuda_gp_m"
      ],
      "children": [
        "p_yoko_matsuda",
        "p_kentaro_matsuda"
      ]
    },
    {
      "id": "p_satoko_matsuda",
      "name": "松田 仁子",
      "kana": "まつだ ひとこ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "義母（実母）",
      "note": "貞江の一人娘。一郎 妻。陽子の実母。",
      "spouses": [
        "p_ichiro_matsuda"
      ],
      "parents": [
        "p_sadae_husband",
        "p_sadae"
      ],
      "children": [
        "p_yoko_matsuda",
        "p_kentaro_matsuda"
      ]
    },
    {
      "id": "p_yoko_sister",
      "name": "洋子",
      "kana": "ようこ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "妹（長女）",
      "note": "小笠原 湊・ゑみ子 長女（更一の妹）。",
      "spouses": [],
      "parents": [
        "p_minato",
        "p_emiko"
      ],
      "children": []
    },
    {
      "id": "p_koichi",
      "name": "小笠原 更一",
      "kana": "おがさわら こういち",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "ご本人（当主）",
      "note": "小笠原家 当主（湊・ゑみ子 長男）。",
      "spouses": [
        "p_yoko_matsuda"
      ],
      "parents": [
        "p_minato",
        "p_emiko"
      ],
      "children": [
        "p_riku",
        "p_kokoro"
      ]
    },
    {
      "id": "p_yoko_matsuda",
      "name": "小笠原 陽子",
      "kana": "おがさわら ようこ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "妻（長女）",
      "note": "更一 妻（旧姓：松田）。松田 一郎・仁子 長女。",
      "spouses": [
        "p_koichi"
      ],
      "parents": [
        "p_ichiro_matsuda",
        "p_satoko_matsuda"
      ],
      "children": [
        "p_riku",
        "p_kokoro"
      ]
    },
    {
      "id": "p_kentaro_matsuda",
      "name": "松田 健太郎",
      "kana": "まつだ けんたろう",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "義兄弟（兄）",
      "note": "松田 一郎・仁子の子（陽子の兄弟）。",
      "spouses": [],
      "parents": [
        "p_ichiro_matsuda",
        "p_satoko_matsuda"
      ],
      "children": []
    },
    {
      "id": "p_riku",
      "name": "小笠原 陸",
      "kana": "おがさわら りく",
      "gender": "male",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "長男",
      "note": "小笠原 更一・陽子 長男。",
      "spouses": [],
      "parents": [
        "p_koichi",
        "p_yoko_matsuda"
      ],
      "children": []
    },
    {
      "id": "p_kokoro",
      "name": "小笠原 こころ",
      "kana": "おがさわら こころ",
      "gender": "female",
      "birth": "",
      "death": "",
      "isAlive": true,
      "relation": "長女",
      "note": "小笠原 更一・陽子 長女。",
      "spouses": [],
      "parents": [
        "p_koichi",
        "p_yoko_matsuda"
      ],
      "children": []
    }
  ]
};

const YAMADA_3GEN_DATA = {
  "title": "山田家 系譜図",
  "subtitle": "令和八年 秋 吉日 作成",
  "theme": "japanese",
  "persons": [
    {
      "id": "p1",
      "name": "山田 勘兵衛",
      "kana": "やまだ かんべえ",
      "gender": "male",
      "birth": "1932",
      "death": "2018",
      "isAlive": false,
      "relation": "祖父（先代当主）",
      "note": "地域農業の近代化を牽引。勲六等瑞宝章。",
      "spouses": [
        "p2"
      ],
      "parents": [],
      "children": [
        "p3",
        "p5",
        "p7"
      ]
    },
    {
      "id": "p2",
      "name": "山田 まつ",
      "kana": "やまだ まつ",
      "gender": "female",
      "birth": "1935",
      "death": "",
      "isAlive": true,
      "relation": "祖母",
      "note": "旧姓：佐藤。伝統工芸・茶道教授。",
      "spouses": [
        "p1"
      ],
      "parents": [],
      "children": [
        "p3",
        "p5",
        "p7"
      ]
    },
    {
      "id": "p3",
      "name": "山田 太郎",
      "kana": "やまだ たろう",
      "gender": "male",
      "birth": "1960",
      "death": "",
      "isAlive": true,
      "relation": "長男（現当主）",
      "note": "精密機械製造会社を創業。現代表取締役。",
      "spouses": [
        "p4"
      ],
      "parents": [
        "p1",
        "p2"
      ],
      "children": [
        "p8",
        "p9"
      ]
    },
    {
      "id": "p4",
      "name": "山田 花子",
      "kana": "やまだ はなこ",
      "gender": "female",
      "birth": "1963",
      "death": "",
      "isAlive": true,
      "relation": "妻",
      "note": "旧姓：田中。植物園ボランティア代表。",
      "spouses": [
        "p3"
      ],
      "parents": [],
      "children": [
        "p8",
        "p9"
      ]
    },
    {
      "id": "p5",
      "name": "木村 恵美",
      "kana": "きむら えみ",
      "gender": "female",
      "birth": "1964",
      "death": "",
      "isAlive": true,
      "relation": "長女",
      "note": "木村家へ嫁ぐ。大学教授（近代文学）。",
      "spouses": [
        "p6"
      ],
      "parents": [
        "p1",
        "p2"
      ],
      "children": [
        "p10"
      ]
    },
    {
      "id": "p6",
      "name": "木村 誠一郎",
      "kana": "きむら せいいちろう",
      "gender": "male",
      "birth": "1962",
      "death": "",
      "isAlive": true,
      "relation": "義弟",
      "note": "建築家・一級建築士事務所主宰。",
      "spouses": [
        "p5"
      ],
      "parents": [],
      "children": [
        "p10"
      ]
    },
    {
      "id": "p7",
      "name": "山田 次郎",
      "kana": "やまだ じろう",
      "gender": "male",
      "birth": "1968",
      "death": "",
      "isAlive": true,
      "relation": "次男",
      "note": "海外赴任（シンガポール）。国際金融アナリスト。",
      "spouses": [],
      "parents": [
        "p1",
        "p2"
      ],
      "children": []
    },
    {
      "id": "p8",
      "name": "山田 一樹",
      "kana": "やまだ かずき",
      "gender": "male",
      "birth": "1992",
      "death": "",
      "isAlive": true,
      "relation": "孫（太郎長男・次期当主）",
      "note": "AI・ソフトウェアエンジニア。後継者。",
      "spouses": [
        "p11"
      ],
      "parents": [
        "p3",
        "p4"
      ],
      "children": [
        "p12"
      ]
    },
    {
      "id": "p11",
      "name": "山田 葵",
      "kana": "やまだ あおい",
      "gender": "female",
      "birth": "1994",
      "death": "",
      "isAlive": true,
      "relation": "一樹 妻",
      "note": "旧姓：高橋。グラフィックデザイナー。",
      "spouses": [
        "p8"
      ],
      "parents": [],
      "children": [
        "p12"
      ]
    },
    {
      "id": "p9",
      "name": "山田 遥",
      "kana": "やまだ はるか",
      "gender": "female",
      "birth": "1996",
      "death": "",
      "isAlive": true,
      "relation": "孫（太郎長女）",
      "note": "医師（小児科専門医）。",
      "spouses": [],
      "parents": [
        "p3",
        "p4"
      ],
      "children": []
    },
    {
      "id": "p10",
      "name": "木村 翔太",
      "kana": "きむら しょうた",
      "gender": "male",
      "birth": "1998",
      "death": "",
      "isAlive": true,
      "relation": "甥（恵美 長男）",
      "note": "大学院生（航空宇宙工学専攻）。",
      "spouses": [],
      "parents": [
        "p5",
        "p6"
      ],
      "children": []
    },
    {
      "id": "p12",
      "name": "山田 蓮",
      "kana": "やまだ れん",
      "gender": "male",
      "birth": "2024",
      "death": "",
      "isAlive": true,
      "relation": "曾孫（一樹 長男）",
      "note": "令和六年 生まれ。",
      "spouses": [],
      "parents": [
        "p8",
        "p11"
      ],
      "children": []
    }
  ]
};

// Global Application State
let appData = null;
let currentZoom = 1.0;
let panX = 60;
let panY = 60;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Dimensions & Spacing Constants
const CARD_WIDTH = 70;
const CARD_HEIGHT = 220;
const SPOUSE_GAP = 24;
const SIBLING_GAP = 20;
const GENERATION_GAP = 96;
