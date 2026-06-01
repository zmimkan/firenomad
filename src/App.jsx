import { useState, useEffect, useRef } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  zh: {
    appName: "FIRENomad", appTag: "独立旅居图鉴", cities: "城市",
    aiLive: "AI · 实时", hint: "点击城市 · 滚轮缩放 · 拖拽",
    fitLegend: "适合度", great: "非常适合", ok: "勉强可行", poor: "不推荐",
    fireRange: { lean: "$1,500-2,000/月", regular: "$2,000-4,000/月", fat: "$4,000+/月", barista: "半退休+兼职", coast: "被动收入为主" },
    tabs: ["💰 财务", "📋 居留", "🏠 生活", "✨ 氛围", "💬 讨论"],
    sec: {
      cost: "成本明细", tips: "省钱贴士", tax: "税务规则",
      visa: "签证类型", family_visa: "家属附签", residency: "永居路径",
      health: "医疗体系", ins: "保险建议", education: "教育选择", safety: "安全状况", culture: "文化考量", family_summary: "家庭概览",
      vibe_overview: "氛围概览", vibe_detail: "推荐场所",
      community: "实时讨论"
    },
    vibeLabels: { yoga: "🧘 瑜伽/健身", performance: "🎭 演出/戏剧", art: "🎨 艺术展览", music: "🎵 现场音乐", food: "🍳 美食氛围", outdoor: "🌳 户外/自然" },
    ai: { title: "AI 个性化分析", askBtn: "请 AI 个性化分析", loading: "分析中", placeholder: "继续问 AI...（Enter 发送）", send: "发送", you: "你", aiLabel: "AI 分析", aiFollow: "AI 跟进", err: "错误", net: "网络问题，请稍后重试" },
    community: { refresh: "↻ 刷新", loading: "📡 AI 正在搜索 Reddit... 约需 10-20 秒", noResults: "AI 未找到相关帖子，请使用下方直链", hint: "AI 抓取真实讨论", openLink: "查看 ↗", directTitle: "或直接到论坛搜索：" },
    suggested: ["带家人一起来，签证怎么办？", "搬过去要带什么必需品？", "比较这个城市和其他热门 FIRE 城市哪个更适合我？"],
    cost: { Monthly: "月均总计", Housing: "住宿", Food: "餐饮", Transit: "交通", Leisure: "娱乐", Health: "医保", Education: "教育" },
    close: "✕",
    hh: "家庭规模", hhSection: "家庭规模",
    perPerson: "人均",
    vsBaseline: "对比单身",
    newCategory: "新增",
    multipliers: { Monthly:"×总倍数", Housing:"×住宿", Food:"×餐饮", Transit:"×交通", Leisure:"×娱乐", Health:"×医保" },
  },
  en: {
    appName: "FIRENomad", appTag: "Atlas of Independence", cities: "cities",
    aiLive: "AI · LIVE", hint: "Click city · Scroll to zoom · Drag",
    fitLegend: "Compatibility", great: "Highly Suitable", ok: "Marginal", poor: "Not Recommended",
    fireRange: { lean: "$1.5-2k/mo", regular: "$2-4k/mo", fat: "$4k+/mo", barista: "Semi-retire+Part-time", coast: "Mostly Passive" },
    tabs: ["💰 Finance", "📋 Residency", "🏠 Living", "✨ Vibe", "💬 Discussion"],
    sec: {
      cost: "Cost Breakdown", tips: "Insider Notes", tax: "Tax Rules",
      visa: "Visa Types", family_visa: "Family Visas", residency: "Path to PR",
      health: "Healthcare", ins: "Insurance", education: "Education", safety: "Safety", culture: "Culture", family_summary: "Family Overview",
      vibe_overview: "Vibe Overview", vibe_detail: "Curated Venues",
      community: "Live Discussions"
    },
    vibeLabels: { yoga: "🧘 Yoga/Fitness", performance: "🎭 Theater/Shows", art: "🎨 Art/Galleries", music: "🎵 Live Music", food: "🍳 Food Scene", outdoor: "🌳 Outdoor/Nature" },
    ai: { title: "AI Personal Analysis", askBtn: "Ask AI · Personal Analysis", loading: "Analyzing", placeholder: "Follow up... (Enter)", send: "Send", you: "You", aiLabel: "AI Analysis", aiFollow: "AI Follow-up", err: "Error", net: "Network issue" },
    community: { refresh: "↻ Refresh", loading: "📡 AI searching Reddit... 10-20s", noResults: "AI didn't find specific posts. Use direct links below", hint: "AI scrapes real discussions", openLink: "View ↗", directTitle: "Or search directly:" },
    suggested: ["What visa options for bringing family?", "What essentials to pack for moving?", "Compare this city with other popular FIRE destinations"],
    cost: { Monthly: "Monthly", Housing: "Housing", Food: "Food", Transit: "Transit", Leisure: "Leisure", Health: "Health", Education: "Education" },
    close: "✕",
    hh: "Household", hhSection: "Household Size",
    perPerson: "per person",
    vsBaseline: "vs single",
    newCategory: "new",
    multipliers: { Monthly:"×total", Housing:"×housing", Food:"×food", Transit:"×transit", Leisure:"×leisure", Health:"×health" },
  }
};

const FIRE_TYPES = {
  lean:    { label:"Lean",    icon:"🌱" },
  regular: { label:"Regular", icon:"🔥" },
  fat:     { label:"Fat",     icon:"💎" },
  barista: { label:"Barista", icon:"☕" },
  coast:   { label:"Coast",   icon:"🌊" },
};

const HOUSEHOLDS = {
  single: { emoji:"👤", label:{zh:"单身", en:"Single"}, desc:{zh:"1 人·基准 ×1.0", en:"1 person·baseline"} },
  couple: { emoji:"👫", label:{zh:"夫妻/情侣", en:"Couple"}, desc:{zh:"2 人·共住餐饮", en:"2 people·shared"} },
  family3: { emoji:"👨‍👩‍👧", label:{zh:"家庭 3 人", en:"Family of 3"}, desc:{zh:"2 大人 + 1 孩 · 含教育", en:"2 adults + 1 child"} },
  family4: { emoji:"👨‍👩‍👧‍👦", label:{zh:"家庭 4 人", en:"Family of 4"}, desc:{zh:"2 大人 + 2 孩 · 含教育", en:"2 adults + 2 children"} },
  retired: { emoji:"👴", label:{zh:"退休夫妇", en:"Retired Couple"}, desc:{zh:"2 长辈 · 含医疗加成", en:"2 elders · w/healthcare"} },
};

const MULTIPLIERS = {
  single:  { Monthly:1.0, Housing:1.0, Food:1.0, Transit:1.0, Leisure:1.0, Health:1.0, Education:0 },
  couple:  { Monthly:1.4, Housing:1.2, Food:1.8, Transit:1.5, Leisure:1.6, Health:2.0, Education:0 },
  family3: { Monthly:2.0, Housing:1.4, Food:2.4, Transit:2.3, Leisure:2.0, Health:2.4, Education:1 },
  family4: { Monthly:2.3, Housing:1.5, Food:2.9, Transit:2.7, Leisure:2.3, Health:2.7, Education:2 },
  retired: { Monthly:1.5, Housing:1.2, Food:1.7, Transit:1.3, Leisure:1.5, Health:3.0, Education:0 },
};

const FIT_CONFIG = {
  great: { color:"#7dd3a8", bg:"rgba(125,211,168,0.08)", border:"rgba(125,211,168,0.4)" },
  ok:    { color:"#7ba6d4", bg:"rgba(123,166,212,0.08)", border:"rgba(123,166,212,0.4)" },
  poor:  { color:"#c45c6e", bg:"rgba(196,92,110,0.08)", border:"rgba(196,92,110,0.4)" },
};

const TAG_STYLE = {
  green:  { background:"rgba(125,211,168,0.15)", color:"#7dd3a8", border:"rgba(125,211,168,0.3)" },
  yellow: { background:"rgba(212,175,55,0.15)",  color:"#d4af37", border:"rgba(212,175,55,0.3)" },
  red:    { background:"rgba(196,92,110,0.15)",  color:"#c45c6e", border:"rgba(196,92,110,0.3)" },
};

// ─── 40 CITIES ───────────────────────────────────────────────────────────────
const CITIES = [
  {
    "id": "chengdu",
    "name": {
      "zh": "成都",
      "en": "Chengdu"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 30.57,
    "lng": 104.07,
    "sub": {
      "zh": "悠闲生活之都·熊猫故乡",
      "en": "Laid-back life·Panda hometown"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "月均 $900 极舒适，国内 Lean FIRE 首选",
        "regular": "高品质生活，茶馆火锅文化丰富",
        "fat": "成本过低，资产闲置",
        "barista": "远程工作环境好",
        "coast": "$1,000/月被动收入即可"
      },
      "en": {
        "lean": "$900/mo very comfortable, top China Lean FIRE",
        "regular": "High quality life, teahouse culture",
        "fat": "Costs too low to use assets",
        "barista": "Great remote work env",
        "coast": "$1,000/mo passive enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$900",
        "src": "https://www.numbeo.com/cost-of-living/in/Chengdu"
      },
      {
        "key": "Housing",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Chengdu"
      },
      {
        "key": "Food",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Chengdu"
      },
      {
        "key": "Transit",
        "val": "$50",
        "src": "https://www.cdmetro.cn"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Chengdu"
      },
      {
        "key": "Health",
        "val": "$100",
        "src": "https://www.cnhealthcare.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "成都地铁线路最全，月票$20",
          "en": "Most metro lines in W. China, $20/mo"
        },
        "src": "https://www.cdmetro.cn"
      },
      {
        "t": {
          "zh": "市中心一居室$400-500",
          "en": "City center 1BR $400-500"
        },
        "src": "https://www.numbeo.com/cost-of-living/in/Chengdu"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "Q1 旅游签",
          "en": "Q1 Tourist Visa"
        },
        "d": {
          "zh": "可停 30-60 天，可延期",
          "en": "30-60 days, extendable"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 短期",
          "en": "✓ Short-term"
        },
        "src": "https://www.nia.gov.cn"
      },
      {
        "t": {
          "zh": "Q2 探亲签",
          "en": "Q2 Family Visa"
        },
        "d": {
          "zh": "探亲访友长期",
          "en": "Long-term family visit"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 需邀请",
          "en": "⚠ Need invite"
        },
        "src": "https://www.nia.gov.cn"
      },
      {
        "t": {
          "zh": "永居",
          "en": "D Visa"
        },
        "d": {
          "zh": "2024 起部分人才放宽",
          "en": "2024 expanded eligibility"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 门槛高",
          "en": "⚠ High bar"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "华西医院亚洲顶尖",
          "en": "West China Hospital, top in Asia"
        },
        "src": "https://www.wchscu.cn"
      },
      {
        "t": {
          "zh": "国际医保 $80-150/月",
          "en": "Intl insurance $80-150/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Cigna/MSH 国际医保",
          "en": "Cigna/MSH international"
        },
        "src": "https://www.cigna.com"
      },
      {
        "t": {
          "zh": "中国本地医保 $30-50/月",
          "en": "Local China health $30-50/mo"
        },
        "src": "https://www.gov.cn"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体非常安全",
          "en": "Overall very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Chengdu"
      },
      {
        "t": {
          "zh": "电诈是主要风险",
          "en": "Phone scams main risk"
        },
        "src": "https://www.gov.cn"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "茶馆文化日常生活",
          "en": "Teahouse culture daily"
        },
        "src": "https://en.chengdu.gov.cn"
      },
      {
        "t": {
          "zh": "川菜辣是默认",
          "en": "Sichuan cuisine default spicy"
        },
        "src": "https://en.chengdu.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 4,
        "music": 3,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "food",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "宽窄巷子小吃街",
          "name_en": "Kuanzhai Alley Food Street",
          "area_zh": "市中心",
          "area_en": "Downtown",
          "price": "$5-15/餐",
          "tags": [
            "美食",
            "传统"
          ],
          "src": "https://en.wikipedia.org/wiki/Kuanzhai_Alley"
        },
        {
          "emoji": "🐼",
          "name_zh": "大熊猫繁育研究基地",
          "name_en": "Panda Research Base",
          "area_zh": "北郊",
          "area_en": "North",
          "price": "¥58",
          "tags": [
            "自然",
            "户外"
          ],
          "src": "https://www.panda.org.cn"
        },
        {
          "emoji": "🎭",
          "name_zh": "锦江剧场川剧",
          "name_en": "Jinjiang Theatre Sichuan Opera",
          "area_zh": "市中心",
          "area_en": "Downtown",
          "price": "¥150-300",
          "tags": [
            "川剧",
            "传统"
          ],
          "src": "http://www.cdjjjj.com"
        },
        {
          "emoji": "🧘",
          "name_zh": "Y+ Yoga 工作室",
          "name_en": "Y+ Yoga Studio",
          "area_zh": "高新区",
          "area_en": "High-tech zone",
          "price": "¥150/次",
          "tags": [
            "瑜伽",
            "国际化"
          ],
          "src": "https://www.yplus.com.cn"
        },
        {
          "emoji": "🎨",
          "name_zh": "成都当代美术馆",
          "name_en": "Chengdu MOCA",
          "area_zh": "高新区",
          "area_en": "High-tech",
          "price": "¥30",
          "tags": [
            "当代艺术"
          ],
          "src": "https://www.cdmoca.org"
        },
        {
          "emoji": "🌳",
          "name_zh": "青城山徒步",
          "name_en": "Mt. Qingcheng Hiking",
          "area_zh": "郊区",
          "area_en": "Suburb",
          "price": "¥90",
          "tags": [
            "徒步",
            "道教文化"
          ],
          "src": "https://whc.unesco.org/en/list/1001"
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "成都国际学校充足，华西医院儿科顶级，物价低，适合中文环境家庭。配偶探亲签灵活。",
        "en": "Good intl school options, West China Hospital pediatrics top-tier, low cost. Ideal for Chinese-speaking families."
      },
      "schools": [
        {
          "zh_name": "成都美视国际学校",
          "en_name": "CIS Chengdu",
          "type": "intl_top",
          "price": "$22k-28k/年",
          "src": "https://www.cdcis.com.cn"
        },
        {
          "zh_name": "成都七中嘉祥国际",
          "en_name": "Chengdu QSI",
          "type": "intl_ib",
          "price": "$15k-20k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public school",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 800
  },
  {
    "id": "guangzhou",
    "name": {
      "zh": "广州",
      "en": "Guangzhou"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 23.13,
    "lng": 113.26,
    "sub": {
      "zh": "华南商都·美食天堂",
      "en": "Southern China hub·Food capital"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,500 接近上限",
        "regular": "国际都市理想选择",
        "fat": "商业枢纽便利",
        "barista": "远程工作便利",
        "coast": "勉强可行"
      },
      "en": {
        "lean": "$1,500 near limit",
        "regular": "Ideal intl metro",
        "fat": "Convenient business hub",
        "barista": "Convenient remote work",
        "coast": "Marginal"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Guangzhou"
      },
      {
        "key": "Housing",
        "val": "$700",
        "src": "https://www.numbeo.com/cost-of-living/in/Guangzhou"
      },
      {
        "key": "Food",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Guangzhou"
      },
      {
        "key": "Transit",
        "val": "$60",
        "src": "https://www.gzmtr.com"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Guangzhou"
      },
      {
        "key": "Health",
        "val": "$130",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "早茶文化精彩",
          "en": "Yum cha culture rich"
        },
        "src": "https://www.gz.gov.cn"
      },
      {
        "t": {
          "zh": "地铁四通八达",
          "en": "Metro extensive coverage"
        },
        "src": "https://www.gzmtr.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "30-60 天",
          "en": "30-60 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "中山医院亚洲一流",
          "en": "Zhongshan Hospital top tier"
        },
        "src": "https://www.gzsums.net"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Cigna 国际 $80-200/月",
          "en": "Cigna intl $80-200/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Guangzhou"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "粤语广东话主流",
          "en": "Cantonese mainstream"
        },
        "src": "https://www.gz.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "陶陶居早茶",
          "name_en": "Tao Tao Ju Yum Cha",
          "area_zh": "荔湾区",
          "area_en": "Liwan",
          "price": "¥80-150/人",
          "tags": [
            "早茶",
            "粤菜"
          ],
          "src": "https://en.wikipedia.org/wiki/Yum_cha"
        },
        {
          "emoji": "🎭",
          "name_zh": "广州大剧院",
          "name_en": "Guangzhou Opera House",
          "area_zh": "珠江新城",
          "area_en": "Zhujiang",
          "price": "¥80-680",
          "tags": [
            "歌剧",
            "扎哈设计"
          ],
          "src": "https://www.gzdjy.org"
        },
        {
          "emoji": "🎨",
          "name_zh": "广东美术馆",
          "name_en": "Guangdong Art Museum",
          "area_zh": "二沙岛",
          "area_en": "Ersha Island",
          "price": "免费",
          "tags": [
            "艺术",
            "免费"
          ],
          "src": "http://www.gdmoa.org"
        },
        {
          "emoji": "🧘",
          "name_zh": "卡瓦哈拉瑜伽",
          "name_en": "Karma Yoga Studio",
          "area_zh": "天河区",
          "area_en": "Tianhe",
          "price": "¥100-150/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "白云山",
          "name_en": "Baiyun Mountain",
          "area_zh": "白云区",
          "area_en": "Baiyun",
          "price": "¥5",
          "tags": [
            "徒步",
            "城市公园"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "TU 凸空间 Live House",
          "name_en": "TU Space Live House",
          "area_zh": "越秀区",
          "area_en": "Yuexiu",
          "price": "¥100-300",
          "tags": [
            "独立音乐"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择丰富（美侨/朝庸/英国学校），中山一院顶级儿科，宜居家庭。",
        "en": "Many intl school options (AISG, BSG, etc.), top pediatric care."
      },
      "schools": [
        {
          "zh_name": "广州美国人学校 (AISG)",
          "en_name": "AISG",
          "type": "intl_top",
          "price": "$30k-40k/年",
          "src": "https://www.aisgz.org"
        },
        {
          "zh_name": "广州英国学校 (BSG)",
          "en_name": "BSG",
          "type": "intl_ib",
          "price": "$25k-35k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "qingdao",
    "name": {
      "zh": "青岛",
      "en": "Qingdao"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 36.07,
    "lng": 120.38,
    "sub": {
      "zh": "海滨德式风情·啤酒之都",
      "en": "Coastal German charm·Beer capital"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,000 海滨生活舒适",
        "regular": "高品质海边生活",
        "fat": "成本偏低",
        "barista": "远程工作环境优",
        "coast": "$1,000 即可"
      },
      "en": {
        "lean": "$1,000 coastal comfortable",
        "regular": "High quality coastal life",
        "fat": "Costs low",
        "barista": "Excellent remote env",
        "coast": "$1,000 sufficient"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Qingdao"
      },
      {
        "key": "Housing",
        "val": "$400",
        "src": "https://www.numbeo.com/cost-of-living/in/Qingdao"
      },
      {
        "key": "Food",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Qingdao"
      },
      {
        "key": "Transit",
        "val": "$40",
        "src": "https://www.qd-metro.com"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Qingdao"
      },
      {
        "key": "Health",
        "val": "$140",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "海鲜啤酒夏天必享",
          "en": "Seafood + beer essential"
        },
        "src": "https://www.qd.gov.cn"
      },
      {
        "t": {
          "zh": "德式建筑老城区漂亮",
          "en": "German old town beautiful"
        },
        "src": "https://www.qd.gov.cn"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "30-60 天",
          "en": "30-60 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "青大附院全国顶尖",
          "en": "Qingdao Uni Hospital top"
        },
        "src": "https://www.qduh.cn"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保 $80-150/月",
          "en": "Intl insurance $80-150/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "中国最安全城市之一",
          "en": "Among China's safest"
        },
        "src": "https://www.numbeo.com/crime/in/Qingdao"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "海洋文化日常",
          "en": "Marine culture daily"
        },
        "src": "https://www.qd.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 2,
        "performance": 2,
        "art": 3,
        "music": 2,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🏖️",
          "name_zh": "第一海水浴场",
          "name_en": "No.1 Beach",
          "area_zh": "市南区",
          "area_en": "Shinan",
          "price": "免费",
          "tags": [
            "海滩",
            "免费"
          ],
          "src": ""
        },
        {
          "emoji": "🍺",
          "name_zh": "青岛啤酒博物馆",
          "name_en": "Tsingtao Beer Museum",
          "area_zh": "登州路",
          "area_en": "Dengzhou Rd",
          "price": "¥60",
          "tags": [
            "啤酒",
            "文化"
          ],
          "src": "https://www.tsingtaomuseum.com"
        },
        {
          "emoji": "🍳",
          "name_zh": "劈柴院海鲜",
          "name_en": "Pichaiyuan Seafood Street",
          "area_zh": "市南区",
          "area_en": "Shinan",
          "price": "¥80-200/人",
          "tags": [
            "海鲜"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "崂山徒步",
          "name_en": "Mt. Lao Hiking",
          "area_zh": "崂山区",
          "area_en": "Laoshan",
          "price": "¥130",
          "tags": [
            "徒步",
            "道教"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "青岛市美术馆",
          "name_en": "Qingdao Art Museum",
          "area_zh": "市北区",
          "area_en": "Shibei",
          "price": "免费",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "⛵",
          "name_zh": "奥帆中心",
          "name_en": "Olympic Sailing Center",
          "area_zh": "浮山湾",
          "area_en": "Fushan Bay",
          "price": "免费看",
          "tags": [
            "帆船",
            "海上"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校少但有 MTI；公立学校优质，海滨环境对孩子健康好。",
        "en": "Limited intl schools but MTI exists; good public schools, healthy coastal env."
      },
      "schools": [
        {
          "zh_name": "青岛 MTI 国际学校",
          "en_name": "MTI Qingdao",
          "type": "intl_ib",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 600
  },
  {
    "id": "dalian",
    "name": {
      "zh": "大连",
      "en": "Dalian"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 38.91,
    "lng": 121.61,
    "sub": {
      "zh": "海滨花园城市·退休理想",
      "en": "Coastal garden city·Retirement ideal"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "ok",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$900 退休族首选",
        "regular": "高品质海滨生活",
        "fat": "成本极低",
        "barista": "商业活力一般",
        "coast": "被动收入容易覆盖"
      },
      "en": {
        "lean": "$900 top retiree pick",
        "regular": "High quality coastal life",
        "fat": "Very low cost",
        "barista": "Moderate biz activity",
        "coast": "Easy passive coverage"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$900",
        "src": "https://www.numbeo.com/cost-of-living/in/Dalian"
      },
      {
        "key": "Housing",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Dalian"
      },
      {
        "key": "Food",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Dalian"
      },
      {
        "key": "Transit",
        "val": "$40",
        "src": "https://www.dlrt.com.cn"
      },
      {
        "key": "Leisure",
        "val": "$180",
        "src": "https://www.numbeo.com/cost-of-living/in/Dalian"
      },
      {
        "key": "Health",
        "val": "$130",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "退休生活理想，气候宜人",
          "en": "Ideal retirement climate"
        },
        "src": "https://www.dl.gov.cn"
      },
      {
        "t": {
          "zh": "海鲜便宜新鲜",
          "en": "Cheap fresh seafood"
        },
        "src": "https://www.dl.gov.cn"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "30-60 天",
          "en": "30-60 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "大连医科大学附院",
          "en": "Dalian Med Uni Hospital"
        },
        "src": "https://www.dy1y.dmu.edu.cn"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Cigna 国际医保",
          "en": "Cigna international"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "极安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Dalian"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "日韩文化交融",
          "en": "Japanese/Korean influence"
        },
        "src": "https://www.dl.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 2,
        "performance": 2,
        "art": 2,
        "music": 2,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🏖️",
          "name_zh": "金石滩",
          "name_en": "Golden Pebble Beach",
          "area_zh": "开发区",
          "area_en": "Dev Zone",
          "price": "免费",
          "tags": [
            "海滩",
            "地质公园"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "天津街海鲜",
          "name_en": "Tianjin St. Seafood",
          "area_zh": "市中心",
          "area_en": "Downtown",
          "price": "¥100-300/人",
          "tags": [
            "海鲜"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "老虎滩海洋公园",
          "name_en": "Laohutan Ocean Park",
          "area_zh": "中山区",
          "area_en": "Zhongshan",
          "price": "¥220",
          "tags": [
            "海洋",
            "家庭"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "大连人民文化俱乐部",
          "name_en": "Dalian Cultural Club",
          "area_zh": "中山广场",
          "area_en": "Zhongshan Sq",
          "price": "¥100-300",
          "tags": [
            "演出"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "星海广场散步",
          "name_en": "Xinghai Square Walk",
          "area_zh": "沙河口",
          "area_en": "Shahekou",
          "price": "免费",
          "tags": [
            "户外",
            "广场"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "大连现代博物馆",
          "name_en": "Dalian Modern Museum",
          "area_zh": "沙河口",
          "area_en": "Shahekou",
          "price": "免费",
          "tags": [
            "历史",
            "艺术"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择有限，公立学校教育质量高；适合中文环境家庭退休族。",
        "en": "Limited intl options; strong public schools. Best for Chinese-speaking retired families."
      },
      "schools": [
        {
          "zh_name": "大连枫叶国际学校",
          "en_name": "Maple Leaf Intl",
          "type": "intl_ib",
          "price": "$15k-20k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 500
  },
  {
    "id": "xiamen",
    "name": {
      "zh": "厦门",
      "en": "Xiamen"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 24.48,
    "lng": 118.09,
    "sub": {
      "zh": "鼓浪屿之畔·宜居海滨",
      "en": "Beside Gulangyu·Livable coast"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,000 海岛生活舒适",
        "regular": "高品质生活",
        "fat": "成本偏低",
        "barista": "远程工作环境好",
        "coast": "被动收入轻松覆盖"
      },
      "en": {
        "lean": "$1,000 island living comfortable",
        "regular": "High quality life",
        "fat": "Low cost",
        "barista": "Great remote work env",
        "coast": "Easy passive coverage"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Xiamen"
      },
      {
        "key": "Housing",
        "val": "$400",
        "src": "https://www.numbeo.com/cost-of-living/in/Xiamen"
      },
      {
        "key": "Food",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Xiamen"
      },
      {
        "key": "Transit",
        "val": "$40",
        "src": "https://www.xmgkjt.com"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Xiamen"
      },
      {
        "key": "Health",
        "val": "$140",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "鼓浪屿是必游",
          "en": "Gulangyu Island must-visit"
        },
        "src": "https://www.xm.gov.cn"
      },
      {
        "t": {
          "zh": "台湾元素浓厚",
          "en": "Strong Taiwan influence"
        },
        "src": "https://www.xm.gov.cn"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "30-60 天",
          "en": "30-60 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "第一医院国内一流",
          "en": "First Hospital top tier"
        },
        "src": "https://www.xmsdyyy.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保 $80-150/月",
          "en": "Intl insurance $80-150/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Xiamen"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "闽南文化、台菜美食",
          "en": "Hokkien culture, Taiwanese food"
        },
        "src": "https://www.xm.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 2,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🏝️",
          "name_zh": "鼓浪屿岛",
          "name_en": "Gulangyu Island",
          "area_zh": "思明区",
          "area_en": "Siming",
          "price": "¥50 船票",
          "tags": [
            "海岛",
            "历史"
          ],
          "src": "https://whc.unesco.org/en/list/1541"
        },
        {
          "emoji": "🍳",
          "name_zh": "沙坡尾艺术西区",
          "name_en": "Shapowei Art Zone",
          "area_zh": "思明区",
          "area_en": "Siming",
          "price": "¥30-100/人",
          "tags": [
            "小吃",
            "文艺"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "环岛路骑行",
          "name_en": "Round Island Cycling",
          "area_zh": "思明区",
          "area_en": "Siming",
          "price": "租车 ¥30/天",
          "tags": [
            "骑行",
            "海岸"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "厦门美术馆",
          "name_en": "Xiamen Art Museum",
          "area_zh": "思明区",
          "area_en": "Siming",
          "price": "免费",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽社区 (本地)",
          "name_en": "Local Yoga Community",
          "area_zh": "市内多家",
          "area_en": "Citywide",
          "price": "¥80-150/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "真Live House",
          "name_en": "Real Live House",
          "area_zh": "思明区",
          "area_en": "Siming",
          "price": "¥80-200",
          "tags": [
            "独立音乐"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "厦门美国人学校 + 公立质量优，海岛环境对孩子极佳。",
        "en": "XIS + strong public schools, island env great for kids."
      },
      "schools": [
        {
          "zh_name": "厦门美国国际学校 (XIS)",
          "en_name": "XIS",
          "type": "intl_top",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 700
  },
  {
    "id": "kunming",
    "name": {
      "zh": "昆明",
      "en": "Kunming"
    },
    "country": {
      "zh": "中国",
      "en": "China"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 25.04,
    "lng": 102.71,
    "sub": {
      "zh": "春城之春·气候完美",
      "en": "Spring city·Perfect climate"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$800/月退休族天堂",
        "regular": "高品质生活",
        "fat": "成本极低",
        "barista": "远程工作环境优",
        "coast": "$1,000 被动绝对够"
      },
      "en": {
        "lean": "$800/mo retiree heaven",
        "regular": "High quality life",
        "fat": "Very low cost",
        "barista": "Excellent remote env",
        "coast": "$1,000 passive plenty"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$800",
        "src": "https://www.numbeo.com/cost-of-living/in/Kunming"
      },
      {
        "key": "Housing",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Kunming"
      },
      {
        "key": "Food",
        "val": "$180",
        "src": "https://www.numbeo.com/cost-of-living/in/Kunming"
      },
      {
        "key": "Transit",
        "val": "$30",
        "src": "https://www.kmgdjt.com"
      },
      {
        "key": "Leisure",
        "val": "$170",
        "src": "https://www.numbeo.com/cost-of-living/in/Kunming"
      },
      {
        "key": "Health",
        "val": "$120",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "全年气温 15-25°C 春城",
          "en": "15-25°C year-round"
        },
        "src": "https://www.km.gov.cn"
      },
      {
        "t": {
          "zh": "退休族最爱目的地",
          "en": "Top retiree destination"
        },
        "src": "https://www.km.gov.cn"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "30-60 天",
          "en": "30-60 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.nia.gov.cn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "延安医院云南顶尖",
          "en": "Yan'an Hospital Yunnan top"
        },
        "src": "https://www.yanan.com.cn"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保 $80-150/月",
          "en": "Intl insurance $80-150/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "安全性高",
          "en": "High safety"
        },
        "src": "https://www.numbeo.com/crime/in/Kunming"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "少数民族文化多元",
          "en": "Diverse ethnic cultures"
        },
        "src": "https://www.km.gov.cn"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 2,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🌳",
          "name_zh": "翠湖公园",
          "name_en": "Cuihu Park",
          "area_zh": "市中心",
          "area_en": "Downtown",
          "price": "免费",
          "tags": [
            "公园",
            "红嘴鸥"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "昆明小吃街 / 米线",
          "name_en": "Kunming Mixian Streets",
          "area_zh": "五华区",
          "area_en": "Wuhua",
          "price": "¥10-30/餐",
          "tags": [
            "米线",
            "本地小吃"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "西山徒步",
          "name_en": "Western Hills Hiking",
          "area_zh": "西山区",
          "area_en": "Xishan",
          "price": "¥40",
          "tags": [
            "徒步",
            "滇池"
          ],
          "src": ""
        },
        {
          "emoji": "🌸",
          "name_zh": "斗南花市",
          "name_en": "Dounan Flower Market",
          "area_zh": "呈贡区",
          "area_en": "Chenggong",
          "price": "免费逛",
          "tags": [
            "鲜花",
            "亚洲最大"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "云南民族博物馆",
          "name_en": "Yunnan Nationalities Museum",
          "area_zh": "西山区",
          "area_en": "Xishan",
          "price": "免费",
          "tags": [
            "民族文化"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽工作室 (本地)",
          "name_en": "Local Yoga Studios",
          "area_zh": "五华区",
          "area_en": "Wuhua",
          "price": "¥80-150/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择有限但公立优质，气候温和最适合带孩子或养老父母。",
        "en": "Limited intl options but good public schools; mild climate best for kids/elderly."
      },
      "schools": [
        {
          "zh_name": "昆明世青国际学校",
          "en_name": "YCIS Kunming",
          "type": "intl_ib",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 400
  },
  {
    "id": "tokyo",
    "name": {
      "zh": "东京",
      "en": "Tokyo"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 35.68,
    "lng": 139.69,
    "sub": {
      "zh": "亚洲首都之都·世界级一切",
      "en": "Asia's capital·World-class everything"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,800 远超预算",
        "regular": "勉强可行，签证挑战大",
        "fat": "Fat FIRE 亚洲首选都市",
        "barista": "高度人才签需技能",
        "coast": "签证几乎无解"
      },
      "en": {
        "lean": "$2,800 far over budget",
        "regular": "Marginal, visa challenge",
        "fat": "Asia's top Fat FIRE metro",
        "barista": "Skilled visa needed",
        "coast": "Visa nearly impossible"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,800",
        "src": "https://www.numbeo.com/cost-of-living/in/Tokyo"
      },
      {
        "key": "Housing",
        "val": "$1,200",
        "src": "https://www.numbeo.com/cost-of-living/in/Tokyo"
      },
      {
        "key": "Food",
        "val": "$600",
        "src": "https://www.numbeo.com/cost-of-living/in/Tokyo"
      },
      {
        "key": "Transit",
        "val": "$180",
        "src": "https://www.tokyometro.jp"
      },
      {
        "key": "Leisure",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Tokyo"
      },
      {
        "key": "Health",
        "val": "$250",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "便利店文化日常神器",
          "en": "Convenience store daily essential"
        },
        "src": "https://www.jnto.go.jp"
      },
      {
        "t": {
          "zh": "住三鹰/吉祥寺通勤新宿",
          "en": "Mitaka/Kichijoji commute to Shinjuku"
        },
        "src": "https://www.jreast.co.jp"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期测试",
          "en": "Short test"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 免签",
          "en": "✓ Free"
        },
        "src": "https://www.mofa.go.jp"
      },
      {
        "t": {
          "zh": "经营管理签",
          "en": "Business Manager"
        },
        "d": {
          "zh": "500 万日元注册资本",
          "en": "¥5M registered capital"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 需公司",
          "en": "⚠ Need biz"
        },
        "src": "https://www.immi-moj.go.jp"
      },
      {
        "t": {
          "zh": "高度人才签",
          "en": "Highly Skilled"
        },
        "d": {
          "zh": "积分制专业人才",
          "en": "Point-based skill visa"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 技能门槛",
          "en": "⚠ Skill bar"
        },
        "src": "https://www.immi-moj.go.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "国民健保 $200-300/月",
          "en": "NHI $200-300/mo"
        },
        "src": "https://www.mhlw.go.jp"
      },
      {
        "t": {
          "zh": "圣路加国际医院顶级",
          "en": "St. Luke's Intl top"
        },
        "src": "https://hospital.luke.ac.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国民健保覆盖 70%",
          "en": "NHI covers 70%"
        },
        "src": "https://www.mhlw.go.jp"
      },
      {
        "t": {
          "zh": "过渡 SafetyWing $45/月",
          "en": "Transition SafetyWing $45/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "全球最安全大都市",
          "en": "World's safest metropolis"
        },
        "src": "https://www.numbeo.com/crime/in/Tokyo"
      },
      {
        "t": {
          "zh": "地震要懂应急",
          "en": "Earthquake preparedness needed"
        },
        "src": "https://www.jma.go.jp"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "公共场合保持安静",
          "en": "Public quiet expected"
        },
        "src": "https://www.jnto.go.jp"
      },
      {
        "t": {
          "zh": "垃圾分类极严",
          "en": "Strict recycling rules"
        },
        "src": "https://www.metro.tokyo.lg.jp"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 5,
        "art": 5,
        "music": 5,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "performance",
        "food",
        "art"
      ],
      "venues": [
        {
          "emoji": "🎨",
          "name_zh": "森美术馆",
          "name_en": "Mori Art Museum",
          "area_zh": "六本木",
          "area_en": "Roppongi",
          "price": "¥2,000",
          "tags": [
            "当代艺术",
            "城景"
          ],
          "src": "https://www.mori.art.museum/en"
        },
        {
          "emoji": "🎭",
          "name_zh": "歌舞伎座",
          "name_en": "Kabuki-za Theatre",
          "area_zh": "银座",
          "area_en": "Ginza",
          "price": "¥4,000-22,000",
          "tags": [
            "歌舞伎",
            "传统"
          ],
          "src": "https://www.kabuki-bito.jp/eng/"
        },
        {
          "emoji": "🍣",
          "name_zh": "筑地外市场 / Sushi Saito",
          "name_en": "Tsukiji Outer Market / Sushi Saito",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "¥1k-50k",
          "tags": [
            "寿司",
            "米其林"
          ],
          "src": "https://www.tsukiji.or.jp/english"
        },
        {
          "emoji": "🧘",
          "name_zh": "YogaWorks Tokyo",
          "name_en": "YogaWorks Tokyo",
          "area_zh": "六本木/惠比寿",
          "area_en": "Roppongi/Ebisu",
          "price": "¥3,500/次",
          "tags": [
            "瑜伽",
            "英文"
          ],
          "src": "https://yogaworks.jp"
        },
        {
          "emoji": "🎵",
          "name_zh": "Blue Note Tokyo",
          "name_en": "Blue Note Tokyo",
          "area_zh": "南青山",
          "area_en": "Minami-Aoyama",
          "price": "¥7,000-15,000",
          "tags": [
            "爵士",
            "国际艺人"
          ],
          "src": "https://www.bluenote.co.jp/jp/"
        },
        {
          "emoji": "🌳",
          "name_zh": "代代木公园 + 高尾山",
          "name_en": "Yoyogi Park + Mt. Takao",
          "area_zh": "涩谷/八王子",
          "area_en": "Shibuya/Hachioji",
          "price": "免费 / ¥1,000",
          "tags": [
            "公园",
            "徒步"
          ],
          "src": ""
        },
        {
          "emoji": "📚",
          "name_zh": "teamLab Planets",
          "name_en": "teamLab Planets",
          "area_zh": "丰洲",
          "area_en": "Toyosu",
          "price": "¥3,800",
          "tags": [
            "数字艺术",
            "沉浸式"
          ],
          "src": "https://planets.teamlab.art/tokyo/"
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校丰富但贵，治安全球第一，公共安全感对家庭无可比。配偶签复杂。",
        "en": "Many intl schools but expensive; safest globally for families. Spouse visa is complex."
      },
      "schools": [
        {
          "zh_name": "美国学校 ASIJ",
          "en_name": "ASIJ",
          "type": "intl_top",
          "price": "$33k-38k/年",
          "src": "https://www.asij.ac.jp"
        },
        {
          "zh_name": "英国学校 BST",
          "en_name": "BST Tokyo",
          "type": "intl_ib",
          "price": "$28k-33k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费 (需日语)",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "ok",
        "fat": "great",
        "barista": "poor",
        "coast": "poor"
      }
    },
    "eduPerKid": 2200
  },
  {
    "id": "osaka",
    "name": {
      "zh": "大阪",
      "en": "Osaka"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 34.69,
    "lng": 135.5,
    "sub": {
      "zh": "美食之都·性价比之选",
      "en": "Food capital·Best Japan value"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,300 超预算",
        "regular": "勉强可行，比东京便宜 30%",
        "fat": "理想 Fat FIRE 选择",
        "barista": "高度人才签",
        "coast": "签证挑战"
      },
      "en": {
        "lean": "$2,300 over budget",
        "regular": "Marginal, 30% cheaper than Tokyo",
        "fat": "Ideal Fat FIRE",
        "barista": "Skilled visa",
        "coast": "Visa challenge"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,300",
        "src": "https://www.numbeo.com/cost-of-living/in/Osaka"
      },
      {
        "key": "Housing",
        "val": "$900",
        "src": "https://www.numbeo.com/cost-of-living/in/Osaka"
      },
      {
        "key": "Food",
        "val": "$550",
        "src": "https://www.numbeo.com/cost-of-living/in/Osaka"
      },
      {
        "key": "Transit",
        "val": "$150",
        "src": "https://www.osakametro.co.jp/en"
      },
      {
        "key": "Leisure",
        "val": "$330",
        "src": "https://www.numbeo.com/cost-of-living/in/Osaka"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "比东京便宜 30-40%",
          "en": "30-40% cheaper than Tokyo"
        },
        "src": "https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Japan&city1=Osaka&country2=Japan&city2=Tokyo"
      },
      {
        "t": {
          "zh": "吃在大阪是真的",
          "en": "Osaka really is food capital"
        },
        "src": "https://www.osaka-info.jp"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期测试",
          "en": "Short test"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 免签",
          "en": "✓ Free"
        },
        "src": "https://www.mofa.go.jp"
      },
      {
        "t": {
          "zh": "无 FIRE 签",
          "en": "No FIRE visa"
        },
        "d": {
          "zh": "无被动收入/退休签",
          "en": "No passive/retirement visa"
        },
        "cl": "red",
        "l": {
          "zh": "✗ 长居挑战",
          "en": "✗ Long-stay"
        },
        "src": "https://www.immi-moj.go.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "国民健保 $100-200/月",
          "en": "NHI $100-200/mo"
        },
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "过渡期 SafetyWing $45/月",
          "en": "Transition SafetyWing $45/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "全球最安全国家之一",
          "en": "Among world's safest"
        },
        "src": "https://www.numbeo.com/crime/in/Osaka"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "垃圾分类极严，公共安静",
          "en": "Strict recycling, public quiet"
        },
        "src": "https://www.jnto.go.jp"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 4,
        "art": 4,
        "music": 4,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "道顿堀 + 黑门市场",
          "name_en": "Dotonbori + Kuromon Market",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "¥500-3,000/餐",
          "tags": [
            "美食",
            "章鱼烧"
          ],
          "src": "https://kuromon.com"
        },
        {
          "emoji": "🎭",
          "name_zh": "国立文乐剧场",
          "name_en": "National Bunraku Theatre",
          "area_zh": "日本桥",
          "area_en": "Nipponbashi",
          "price": "¥2,400-6,500",
          "tags": [
            "文乐",
            "木偶剧"
          ],
          "src": "https://www.ntj.jac.go.jp/bunraku.html"
        },
        {
          "emoji": "🎨",
          "name_zh": "国立国际美术馆",
          "name_en": "National Museum of Art Osaka",
          "area_zh": "中之岛",
          "area_en": "Nakanoshima",
          "price": "¥430",
          "tags": [
            "当代艺术"
          ],
          "src": "https://www.nmao.go.jp"
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Studio Osaka",
          "name_en": "Yoga Studio Osaka",
          "area_zh": "梅田",
          "area_en": "Umeda",
          "price": "¥2,500/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Billboard Live Osaka",
          "name_en": "Billboard Live Osaka",
          "area_zh": "北区",
          "area_en": "Kita",
          "price": "¥6,000-12,000",
          "tags": [
            "现场音乐"
          ],
          "src": "https://www.billboard-live.com"
        },
        {
          "emoji": "🌳",
          "name_zh": "大阪城公园",
          "name_en": "Osaka Castle Park",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "免费 / ¥600 城堡",
          "tags": [
            "公园",
            "历史"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "比东京便宜 30%，国际学校少但治安顶级，配偶签需经营或工作。",
        "en": "30% cheaper than Tokyo, fewer intl schools, top safety. Spouse visa needs work/biz."
      },
      "schools": [
        {
          "zh_name": "大阪 YMCA 国际",
          "en_name": "Osaka YMCA Intl",
          "type": "intl_ib",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1800
  },
  {
    "id": "fukuoka",
    "name": {
      "zh": "福冈",
      "en": "Fukuoka"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 33.59,
    "lng": 130.4,
    "sub": {
      "zh": "九州门户·年轻创业之城",
      "en": "Kyushu gateway·Young startup hub"
    },
    "fit": {
      "lean": "poor",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,900 略超预算",
        "regular": "Regular FIRE 日本最佳",
        "fat": "高品质精致生活",
        "barista": "创业签证友好",
        "coast": "勉强够"
      },
      "en": {
        "lean": "$1,900 slightly over",
        "regular": "Best Japan Regular FIRE",
        "fat": "High quality refined life",
        "barista": "Startup visa friendly",
        "coast": "Marginal"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,900",
        "src": "https://www.numbeo.com/cost-of-living/in/Fukuoka"
      },
      {
        "key": "Housing",
        "val": "$700",
        "src": "https://www.numbeo.com/cost-of-living/in/Fukuoka"
      },
      {
        "key": "Food",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Fukuoka"
      },
      {
        "key": "Transit",
        "val": "$120",
        "src": "https://subway.city.fukuoka.lg.jp"
      },
      {
        "key": "Leisure",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Fukuoka"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "机场到市中心仅 5 分钟",
          "en": "Airport to city center 5min"
        },
        "src": "https://www.fukuoka-airport.jp"
      },
      {
        "t": {
          "zh": "拉面/明太子文化",
          "en": "Ramen/mentaiko culture"
        },
        "src": "https://www.welcomekyushu.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期",
          "en": "Short"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.mofa.go.jp"
      },
      {
        "t": {
          "zh": "创业签证",
          "en": "Startup Visa"
        },
        "d": {
          "zh": "福冈特区有放宽",
          "en": "Fukuoka special zone"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 需公司",
          "en": "⚠ Need biz"
        },
        "src": "https://startup.fukuoka.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "九州大学医院国内一流",
          "en": "Kyushu Uni Hospital top"
        },
        "src": "https://www.hosp.kyushu-u.ac.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国民健保 $100-200/月",
          "en": "NHI $100-200/mo"
        },
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "安全且生活便利",
          "en": "Safe and convenient"
        },
        "src": "https://www.numbeo.com/crime/in/Fukuoka"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "距韩国近，亚洲交叉文化",
          "en": "Close to Korea, intersection"
        },
        "src": "https://www.welcomekyushu.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍜",
          "name_zh": "中洲屋台街",
          "name_en": "Nakasu Yatai Street",
          "area_zh": "中洲",
          "area_en": "Nakasu",
          "price": "¥800-2,000/餐",
          "tags": [
            "拉面",
            "屋台"
          ],
          "src": ""
        },
        {
          "emoji": "🏖️",
          "name_zh": "福冈海滨",
          "name_en": "Itoshima Beach",
          "area_zh": "糸岛",
          "area_en": "Itoshima",
          "price": "免费",
          "tags": [
            "海滩",
            "冲浪"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "福冈亚洲美术馆",
          "name_en": "Fukuoka Asian Art Museum",
          "area_zh": "博多",
          "area_en": "Hakata",
          "price": "¥200",
          "tags": [
            "亚洲艺术"
          ],
          "src": "https://faam.city.fukuoka.lg.jp/en/"
        },
        {
          "emoji": "🧘",
          "name_zh": "FOREST Yoga",
          "name_en": "FOREST Yoga Fukuoka",
          "area_zh": "天神",
          "area_en": "Tenjin",
          "price": "¥2,500/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "大濠公园",
          "name_en": "Ohori Park",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "免费",
          "tags": [
            "公园",
            "跑步"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "博多座剧场",
          "name_en": "Hakataza Theatre",
          "area_zh": "博多",
          "area_en": "Hakata",
          "price": "¥3,000-15,000",
          "tags": [
            "传统戏剧"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "日本最适合家庭城市之一，性价比高，创业签证友好。",
        "en": "One of Japan's best for families, great value, startup visa-friendly."
      },
      "schools": [
        {
          "zh_name": "福冈国际学校 FIS",
          "en_name": "FIS Fukuoka",
          "type": "intl_top",
          "price": "$22k-28k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "great",
        "fat": "great",
        "barista": "great",
        "coast": "ok"
      }
    },
    "eduPerKid": 1500
  },
  {
    "id": "sapporo",
    "name": {
      "zh": "札幌",
      "en": "Sapporo"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 43.07,
    "lng": 141.35,
    "sub": {
      "zh": "北国冰雪·四季分明",
      "en": "Northern snow city·Four seasons"
    },
    "fit": {
      "lean": "poor",
      "regular": "great",
      "fat": "great",
      "barista": "ok",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,800 略超",
        "regular": "Regular FIRE 优选",
        "fat": "四季分明品质生活",
        "barista": "远程工作环境好",
        "coast": "勉强够"
      },
      "en": {
        "lean": "$1,800 slightly over",
        "regular": "Top Regular FIRE",
        "fat": "4-season quality life",
        "barista": "Great remote work env",
        "coast": "Marginal"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,800",
        "src": "https://www.numbeo.com/cost-of-living/in/Sapporo"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.numbeo.com/cost-of-living/in/Sapporo"
      },
      {
        "key": "Food",
        "val": "$430",
        "src": "https://www.numbeo.com/cost-of-living/in/Sapporo"
      },
      {
        "key": "Transit",
        "val": "$130",
        "src": "https://www.city.sapporo.jp"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Sapporo"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "冬季雪节是世界级",
          "en": "Snow Festival world-class"
        },
        "src": "https://www.snowfes.com"
      },
      {
        "t": {
          "zh": "海鲜便宜新鲜",
          "en": "Cheap fresh seafood"
        },
        "src": "https://www.welcome.city.sapporo.jp"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期",
          "en": "Short"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.mofa.go.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "北海道大学医院",
          "en": "Hokkaido Uni Hospital"
        },
        "src": "https://www.huhp.hokudai.ac.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国民健保 $100-200/月",
          "en": "NHI $100-200/mo"
        },
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Sapporo"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "北海道独特文化",
          "en": "Hokkaido unique culture"
        },
        "src": "https://www.visit-hokkaido.jp"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 2,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "⛷️",
          "name_zh": "二世古 / 札幌国际滑雪场",
          "name_en": "Niseko / Sapporo Intl Ski",
          "area_zh": "郊区",
          "area_en": "Suburb",
          "price": "¥6,000-12,000/天",
          "tags": [
            "滑雪",
            "世界级"
          ],
          "src": "https://www.niseko.ne.jp"
        },
        {
          "emoji": "❄️",
          "name_zh": "札幌雪节",
          "name_en": "Sapporo Snow Festival",
          "area_zh": "大通公园",
          "area_en": "Odori Park",
          "price": "免费",
          "tags": [
            "雪雕",
            "年度"
          ],
          "src": "https://www.snowfes.com"
        },
        {
          "emoji": "🍣",
          "name_zh": "二条市场 / 海鲜井",
          "name_en": "Nijo Market / Kaisendon",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "¥1,500-4,000/餐",
          "tags": [
            "海鲜",
            "新鲜"
          ],
          "src": ""
        },
        {
          "emoji": "🍺",
          "name_zh": "札幌啤酒博物馆",
          "name_en": "Sapporo Beer Museum",
          "area_zh": "东区",
          "area_en": "Higashi",
          "price": "免费",
          "tags": [
            "啤酒"
          ],
          "src": "https://www.sapporobeer.jp"
        },
        {
          "emoji": "🎨",
          "name_zh": "北海道近代美术馆",
          "name_en": "Hokkaido Modern Art Museum",
          "area_zh": "中央区",
          "area_en": "Chuo",
          "price": "¥510",
          "tags": [
            "现代艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "莫埃来沼公园 (野口设计)",
          "name_en": "Moerenuma Park (Noguchi)",
          "area_zh": "东区",
          "area_en": "Higashi",
          "price": "免费",
          "tags": [
            "景观艺术"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "四季分明环境优良，国际学校少但治安顶级；冬季滑雪是孩子福利。",
        "en": "4-season great env, few intl schools but top safety; winter skiing is bonus."
      },
      "schools": [
        {
          "zh_name": "Hokkaido International School",
          "en_name": "HIS Sapporo",
          "type": "intl_ib",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "kyoto",
    "name": {
      "zh": "京都",
      "en": "Kyoto"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 35.01,
    "lng": 135.77,
    "sub": {
      "zh": "千年古都·传统文化中心",
      "en": "Millennium capital·Cultural heart"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,000 超预算",
        "regular": "勉强可行，文化氛围浓",
        "fat": "传统精致生活理想",
        "barista": "文化创意签可行",
        "coast": "挑战大"
      },
      "en": {
        "lean": "$2,000 over budget",
        "regular": "Marginal, rich culture",
        "fat": "Traditional refined life",
        "barista": "Cultural visa works",
        "coast": "Challenging"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Kyoto"
      },
      {
        "key": "Housing",
        "val": "$750",
        "src": "https://www.numbeo.com/cost-of-living/in/Kyoto"
      },
      {
        "key": "Food",
        "val": "$480",
        "src": "https://www.numbeo.com/cost-of-living/in/Kyoto"
      },
      {
        "key": "Transit",
        "val": "$130",
        "src": "https://www2.city.kyoto.lg.jp"
      },
      {
        "key": "Leisure",
        "val": "$320",
        "src": "https://www.numbeo.com/cost-of-living/in/Kyoto"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "租传统町家是独特体验",
          "en": "Traditional machiya unique"
        },
        "src": "https://kyoto.travel"
      },
      {
        "t": {
          "zh": "樱花/红枫季住宿涨价 50%",
          "en": "Sakura/momiji season +50%"
        },
        "src": "https://kyoto.travel"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期",
          "en": "Short"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.mofa.go.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "京都大学医院顶尖",
          "en": "Kyoto Uni Hospital top"
        },
        "src": "https://kuhp.kyoto-u.ac.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国民健保 $100-200/月",
          "en": "NHI $100-200/mo"
        },
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Kyoto"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "茶道、艺伎、神社文化",
          "en": "Tea, geisha, shrine culture"
        },
        "src": "https://kyoto.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 5,
        "art": 5,
        "music": 3,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "performance",
        "art"
      ],
      "venues": [
        {
          "emoji": "⛩️",
          "name_zh": "伏见稻荷 + 清水寺",
          "name_en": "Fushimi Inari + Kiyomizu-dera",
          "area_zh": "东山/伏见",
          "area_en": "Higashiyama",
          "price": "免费 / ¥400",
          "tags": [
            "神社",
            "千年文化"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "南座歌舞伎",
          "name_en": "Minamiza Kabuki",
          "area_zh": "东山",
          "area_en": "Higashiyama",
          "price": "¥4,000-22,000",
          "tags": [
            "歌舞伎"
          ],
          "src": ""
        },
        {
          "emoji": "🍵",
          "name_zh": "宇治抹茶道",
          "name_en": "Uji Matcha Tea Ceremony",
          "area_zh": "宇治",
          "area_en": "Uji",
          "price": "¥3,000-5,000",
          "tags": [
            "茶道",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "京都国立博物馆",
          "name_en": "Kyoto National Museum",
          "area_zh": "东山",
          "area_en": "Higashiyama",
          "price": "¥700",
          "tags": [
            "国宝",
            "古美术"
          ],
          "src": "https://www.kyohaku.go.jp/eng/"
        },
        {
          "emoji": "🧘",
          "name_zh": "禅修体验 (各寺院)",
          "name_en": "Zen Meditation (Temples)",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "¥1,000-3,000",
          "tags": [
            "禅修",
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "岚山竹林 + 哲学之道",
          "name_en": "Arashiyama + Philosopher Path",
          "area_zh": "西/东",
          "area_en": "West/East",
          "price": "免费",
          "tags": [
            "徒步",
            "樱花"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "文化氛围浓，国际学校少，适合文化沉浸型家庭。",
        "en": "Rich culture, few intl schools, ideal for culture-immersion families."
      },
      "schools": [
        {
          "zh_name": "京都国际学校 KIS",
          "en_name": "KIS Kyoto",
          "type": "intl_ib",
          "price": "$20k-25k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1700
  },
  {
    "id": "nagoya",
    "name": {
      "zh": "名古屋",
      "en": "Nagoya"
    },
    "country": {
      "zh": "日本",
      "en": "Japan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 35.18,
    "lng": 136.91,
    "sub": {
      "zh": "中部工业之都·性价比之选",
      "en": "Central industrial hub·Best value"
    },
    "fit": {
      "lean": "poor",
      "regular": "great",
      "fat": "great",
      "barista": "ok",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,900 略超",
        "regular": "Regular FIRE 优选",
        "fat": "高品质便利",
        "barista": "商业氛围浓",
        "coast": "勉强够"
      },
      "en": {
        "lean": "$1,900 slightly over",
        "regular": "Top Regular FIRE",
        "fat": "High quality convenient",
        "barista": "Strong biz scene",
        "coast": "Marginal"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,900",
        "src": "https://www.numbeo.com/cost-of-living/in/Nagoya"
      },
      {
        "key": "Housing",
        "val": "$700",
        "src": "https://www.numbeo.com/cost-of-living/in/Nagoya"
      },
      {
        "key": "Food",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Nagoya"
      },
      {
        "key": "Transit",
        "val": "$130",
        "src": "https://www.kotsu.city.nagoya.jp"
      },
      {
        "key": "Leisure",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Nagoya"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "味噌炸猪排是特色",
          "en": "Miso katsu signature"
        },
        "src": "https://www.nagoya-info.jp"
      },
      {
        "t": {
          "zh": "商业枢纽便利",
          "en": "Convenient business hub"
        },
        "src": "https://www.nagoya-info.jp"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "免签 90 天",
          "en": "90-day visa-free"
        },
        "d": {
          "zh": "短期",
          "en": "Short"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.mofa.go.jp"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "名古屋大学医院",
          "en": "Nagoya Uni Hospital"
        },
        "src": "https://www.med.nagoya-u.ac.jp"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国民健保 $100-200/月",
          "en": "NHI $100-200/mo"
        },
        "src": "https://www.mhlw.go.jp"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Nagoya"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "中部独特文化",
          "en": "Central Japan unique"
        },
        "src": "https://www.nagoya-info.jp"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍤",
          "name_zh": "味噌煮乌冬名店",
          "name_en": "Miso Nikomi Udon Houses",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "¥1,000-2,000",
          "tags": [
            "乌冬",
            "味噌"
          ],
          "src": ""
        },
        {
          "emoji": "🏯",
          "name_zh": "名古屋城 + 德川园",
          "name_en": "Nagoya Castle + Tokugawa",
          "area_zh": "中区",
          "area_en": "Naka",
          "price": "¥500",
          "tags": [
            "城堡",
            "庭园"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "丰田博物馆",
          "name_en": "Toyota Museum",
          "area_zh": "长久手",
          "area_en": "Nagakute",
          "price": "¥1,200",
          "tags": [
            "工业设计"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽工作室",
          "name_en": "Yoga Studios",
          "area_zh": "荣区",
          "area_en": "Sakae",
          "price": "¥2,500/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "鹤舞公园",
          "name_en": "Tsuruma Park",
          "area_zh": "昭和区",
          "area_en": "Showa",
          "price": "免费",
          "tags": [
            "公园"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "名古屋音乐厅 (Aichi Concert)",
          "name_en": "Aichi Prefectural Concert Hall",
          "area_zh": "东区",
          "area_en": "Higashi",
          "price": "¥3,000-12,000",
          "tags": [
            "古典音乐"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "日本中部商业枢纽，国际学校尚可，适合工作签证家庭。",
        "en": "Central Japan business hub, decent intl schools, fits work visa families."
      },
      "schools": [
        {
          "zh_name": "名古屋国际学校 NIS",
          "en_name": "NIS Nagoya",
          "type": "intl_top",
          "price": "$22k-28k/年",
          "src": ""
        },
        {
          "zh_name": "日本公立学校",
          "en_name": "Japan public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1600
  },
  {
    "id": "taipei",
    "name": {
      "zh": "台北",
      "en": "Taipei"
    },
    "country": {
      "zh": "台湾",
      "en": "Taiwan"
    },
    "region": {
      "zh": "东亚",
      "en": "East Asia"
    },
    "lat": 25.03,
    "lng": 121.57,
    "sub": {
      "zh": "华语环境·全球最佳医保",
      "en": "Mandarin env·Best healthcare globally"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,600 接近上限，健保便宜",
        "regular": "完美华语 + 顶级医疗",
        "fat": "精致生活",
        "barista": "国际化便利",
        "coast": "健保 + 低成本极佳"
      },
      "en": {
        "lean": "$1,600 near limit, cheap health",
        "regular": "Perfect Mandarin + top healthcare",
        "fat": "Refined life",
        "barista": "International convenient",
        "coast": "Health + low cost excellent"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,600",
        "src": "https://www.numbeo.com/cost-of-living/in/Taipei"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.numbeo.com/cost-of-living/in/Taipei"
      },
      {
        "key": "Food",
        "val": "$380",
        "src": "https://www.numbeo.com/cost-of-living/in/Taipei"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://english.metro.taipei"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Taipei"
      },
      {
        "key": "Health",
        "val": "$50",
        "src": "https://www.nhi.gov.tw"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "健保 $30-50/月全球最划算",
          "en": "NHI $30-50/mo world's best value"
        },
        "src": "https://www.nhi.gov.tw"
      },
      {
        "t": {
          "zh": "夜市 $3-5 吃饱",
          "en": "Night markets $3-5/meal"
        },
        "src": "https://www.taipeitravel.net"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "Gold Card 数字游民签",
          "en": "Gold Card"
        },
        "d": {
          "zh": "专业人才 1-3 年含工作权",
          "en": "Skilled 1-3yr w/work"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 技能门槛",
          "en": "⚠ Skill bar"
        },
        "src": "https://goldcard.nat.gov.tw"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "全民健保全球最佳之一",
          "en": "NHI among world's best"
        },
        "src": "https://www.nhi.gov.tw"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国泰/富邦补充 $30-80/月",
          "en": "Cathay/Fubon supplement $30-80/mo"
        },
        "src": "https://www.cathaylife.com.tw"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "亚洲最安全地区之一",
          "en": "Among Asia's safest"
        },
        "src": "https://www.numbeo.com/crime/in/Taipei"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "华语主流，热情好客",
          "en": "Mandarin mainstream, warm"
        },
        "src": "https://www.taiwan.gov.tw"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 4,
        "music": 4,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "food",
        "yoga"
      ],
      "venues": [
        {
          "emoji": "🍢",
          "name_zh": "宁夏夜市 / 士林夜市",
          "name_en": "Ningxia / Shilin Night Market",
          "area_zh": "大同/士林",
          "area_en": "Datong/Shilin",
          "price": "NT$50-200/餐",
          "tags": [
            "夜市",
            "小吃"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "故宫博物院",
          "name_en": "National Palace Museum",
          "area_zh": "士林",
          "area_en": "Shilin",
          "price": "NT$350",
          "tags": [
            "国宝",
            "中华艺术"
          ],
          "src": "https://www.npm.gov.tw/en/"
        },
        {
          "emoji": "🧘",
          "name_zh": "True Yoga 真适瑜伽",
          "name_en": "True Yoga",
          "area_zh": "信义区",
          "area_en": "Xinyi",
          "price": "NT$1,500/月",
          "tags": [
            "瑜伽连锁",
            "顶级"
          ],
          "src": "https://www.trueyoga.com.tw"
        },
        {
          "emoji": "🎵",
          "name_zh": "Legacy Taipei 音乐展演",
          "name_en": "Legacy Taipei",
          "area_zh": "中山区",
          "area_en": "Zhongshan",
          "price": "NT$800-2,500",
          "tags": [
            "独立音乐",
            "演出"
          ],
          "src": "https://www.legacy.com.tw"
        },
        {
          "emoji": "🎭",
          "name_zh": "国家两厅院",
          "name_en": "National Theater & Concert Hall",
          "area_zh": "中正区",
          "area_en": "Zhongzheng",
          "price": "NT$500-3,500",
          "tags": [
            "歌剧",
            "古典"
          ],
          "src": "https://npac-ntch.org/en/"
        },
        {
          "emoji": "🌳",
          "name_zh": "象山步道 + 阳明山",
          "name_en": "Elephant Mt. + Yangmingshan",
          "area_zh": "信义/北投",
          "area_en": "Xinyi/Beitou",
          "price": "免费",
          "tags": [
            "徒步",
            "温泉"
          ],
          "src": ""
        },
        {
          "emoji": "📚",
          "name_zh": "诚品书店",
          "name_en": "Eslite Bookstore",
          "area_zh": "信义区",
          "area_en": "Xinyi",
          "price": "免费",
          "tags": [
            "书店",
            "24小时"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "亚洲家庭 FIRE 首选——华语零障碍 + 健保便宜 + TAS/TES 顶级国际学校 + 治安顶级。",
        "en": "Asia's top family FIRE pick—Mandarin, cheap health, TAS/TES intl schools, top safety."
      },
      "schools": [
        {
          "zh_name": "台北美国学校 (TAS)",
          "en_name": "Taipei American School",
          "type": "intl_top",
          "price": "$22k-32k/年",
          "src": "https://www.tas.edu.tw"
        },
        {
          "zh_name": "台北欧洲学校 (TES)",
          "en_name": "Taipei European School",
          "type": "intl_ib",
          "price": "$18k-28k/年",
          "src": "https://www.taipeieuropeanschool.com"
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "免费 (中文)",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "great",
        "fat": "great",
        "barista": "great",
        "coast": "great"
      }
    },
    "eduPerKid": 1500
  },
  {
    "id": "chiang_mai",
    "name": {
      "zh": "清迈",
      "en": "Chiang Mai"
    },
    "country": {
      "zh": "泰国",
      "en": "Thailand"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 18.79,
    "lng": 98.98,
    "sub": {
      "zh": "东南亚 FIRE 族首选·数字游民天堂",
      "en": "SEA FIRE haven·Digital nomad paradise"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "月均 $1,100 完全在 Lean FIRE 预算内",
        "regular": "Regular FIRE 绰绰有余",
        "fat": "成本过低，资产闲置",
        "barista": "数字游民社区发达",
        "coast": "$1,500/月被动收入足够"
      },
      "en": {
        "lean": "$1,100/mo fits Lean FIRE budget",
        "regular": "Plenty of room for upgrades",
        "fat": "Costs too low to use assets",
        "barista": "Mature digital nomad scene",
        "coast": "$1,500/mo passive income enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,100",
        "src": "https://www.numbeo.com/cost-of-living/in/Chiang-Mai"
      },
      {
        "key": "Housing",
        "val": "$350",
        "src": "https://www.expatistan.com/cost-of-living/chiang-mai"
      },
      {
        "key": "Food",
        "val": "$250",
        "src": "https://www.numbeo.com/cost-of-living/in/Chiang-Mai"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.grab.com"
      },
      {
        "key": "Leisure",
        "val": "$170",
        "src": "https://www.numbeo.com/cost-of-living/in/Chiang-Mai"
      },
      {
        "key": "Health",
        "val": "$100",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "本地市场食材便宜 40-60%",
          "en": "Local market 40-60% cheaper"
        },
        "src": "https://www.numbeo.com/cost-of-living/in/Chiang-Mai"
      },
      {
        "t": {
          "zh": "租摩托车 $60-80/月",
          "en": "Motorbike $60-80/mo"
        },
        "src": "https://nomadlist.com/chiang-mai"
      },
      {
        "t": {
          "zh": "避开尼曼路省 $100-150/月",
          "en": "Avoid Nimman, save $100-150/mo"
        },
        "src": "https://nomadlist.com/chiang-mai"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签",
          "en": "Tourist Visa"
        },
        "d": {
          "zh": "落地免签 30 天",
          "en": "Visa-free 30 days"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 免签",
          "en": "✓ Free"
        },
        "src": "https://www.thaievisa.go.th"
      },
      {
        "t": {
          "zh": "泰国特权签",
          "en": "Thailand Privilege"
        },
        "d": {
          "zh": "$15k-30k，5-20 年居留",
          "en": "$15k-30k, 5-20yr"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 长居首选",
          "en": "✓ Top"
        },
        "src": "https://www.thailandprivilege.co.th"
      },
      {
        "t": {
          "zh": "LTR 长期签",
          "en": "LTR Visa"
        },
        "d": {
          "zh": "年收入 $80k 或资产 $250k+",
          "en": "$80k income or $250k+"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 门槛",
          "en": "⚠ Bar"
        },
        "src": "https://ltr.boi.go.th"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Bangkok Hospital 清迈院国际水准",
          "en": "Bangkok Hospital CM, intl English"
        },
        "src": "https://www.bangkokhospital.com/chiangmai"
      },
      {
        "t": {
          "zh": "诊所 $20-50",
          "en": "Clinic $20-50"
        },
        "src": "https://safetywing.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing $45/月",
          "en": "SafetyWing $45/mo"
        },
        "src": "https://safetywing.com/nomad-insurance"
      },
      {
        "t": {
          "zh": "Cigna/Aetna $80-200/月",
          "en": "Cigna/Aetna $80-200/mo"
        },
        "src": "https://www.cigna.com/international"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "泰国最安全城市",
          "en": "Thailand's safest city"
        },
        "src": "https://www.numbeo.com/crime/in/Chiang-Mai"
      },
      {
        "t": {
          "zh": "交通事故是主要风险",
          "en": "Traffic is main risk"
        },
        "src": "https://www.who.int/thailand/news/detail/road-safety"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "入庙脱鞋着装保守",
          "en": "Temples: shoes off, modest dress"
        },
        "src": "https://www.tourismthailand.org"
      },
      {
        "t": {
          "zh": "皇室话题绝对回避",
          "en": "Never discuss royal family"
        },
        "src": "https://www.bbc.com/news/world-asia-29628191"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 5,
        "performance": 2,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "yoga",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🧘",
          "name_zh": "Wild Rose Yoga / Yoga Tree",
          "name_en": "Wild Rose Yoga / Yoga Tree",
          "area_zh": "古城",
          "area_en": "Old City",
          "price": "$8-12/次",
          "tags": [
            "瑜伽",
            "国际",
            "顶级社区"
          ],
          "src": "https://www.wildroseyogachiangmai.com"
        },
        {
          "emoji": "🍜",
          "name_zh": "Khao Soi 餐 + 周日夜市",
          "name_en": "Khao Soi + Sunday Night Market",
          "area_zh": "古城",
          "area_en": "Old City",
          "price": "$2-5/餐",
          "tags": [
            "小吃",
            "夜市"
          ],
          "src": ""
        },
        {
          "emoji": "🐘",
          "name_zh": "Elephant Nature Park 大象救助",
          "name_en": "Elephant Nature Park",
          "area_zh": "郊区",
          "area_en": "Suburb",
          "price": "$80/天",
          "tags": [
            "大象",
            "公益"
          ],
          "src": "https://www.elephantnaturepark.org"
        },
        {
          "emoji": "🌳",
          "name_zh": "Doi Suthep + Doi Inthanon 徒步",
          "name_en": "Doi Suthep + Doi Inthanon Hike",
          "area_zh": "郊区",
          "area_en": "Suburb",
          "price": "$5-15",
          "tags": [
            "徒步",
            "山林"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Vipassana 内观禅修",
          "name_en": "Vipassana Meditation",
          "area_zh": "郊区寺院",
          "area_en": "Temple",
          "price": "免费 (寺院)",
          "tags": [
            "禅修"
          ],
          "src": "https://www.dhamma.org"
        },
        {
          "emoji": "☕",
          "name_zh": "Ristr8to / 数字游民咖啡馆",
          "name_en": "Ristr8to / Nomad Cafes",
          "area_zh": "尼曼区",
          "area_en": "Nimman",
          "price": "$3-5/杯",
          "tags": [
            "咖啡",
            "远程工作"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "MAIIAM 当代艺术馆",
          "name_en": "MAIIAM Contemporary Art",
          "area_zh": "郊区",
          "area_en": "Suburb",
          "price": "$5",
          "tags": [
            "当代艺术"
          ],
          "src": "https://www.maiiam.com"
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "低成本顶级国际学校（PRC、Lanna），慢节奏适合带孩子，签证家庭友好。",
        "en": "Affordable top intl schools (PRC, Lanna), slow pace ideal for kids, family-friendly visas."
      },
      "schools": [
        {
          "zh_name": "Prem Tinsulanonda Intl (PRC)",
          "en_name": "PRC",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": "https://www.ptis.ac.th"
        },
        {
          "zh_name": "Lanna International School",
          "en_name": "Lanna Intl",
          "type": "intl_ib",
          "price": "$10k-15k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "$200/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 700
  },
  {
    "id": "bangkok",
    "name": {
      "zh": "曼谷",
      "en": "Bangkok"
    },
    "country": {
      "zh": "泰国",
      "en": "Thailand"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 13.75,
    "lng": 100.5,
    "sub": {
      "zh": "国际都市·生活选择多元",
      "en": "Global metro·Diverse lifestyle"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,500 接近上限",
        "regular": "理想都市选择",
        "fat": "亚洲枢纽",
        "barista": "商业氛围浓",
        "coast": "勉强够"
      },
      "en": {
        "lean": "$1,500 near limit",
        "regular": "Ideal metro choice",
        "fat": "Asian hub",
        "barista": "Strong biz",
        "coast": "Tight"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Bangkok"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.numbeo.com/cost-of-living/in/Bangkok"
      },
      {
        "key": "Food",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Bangkok"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.bts.co.th"
      },
      {
        "key": "Leisure",
        "val": "$250",
        "src": "https://www.numbeo.com/cost-of-living/in/Bangkok"
      },
      {
        "key": "Health",
        "val": "$150",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "BTS/MRT 月票 $35",
          "en": "BTS/MRT $35/mo"
        },
        "src": "https://www.bts.co.th"
      },
      {
        "t": {
          "zh": "Ari/Ladprao 比 Sukhumvit 性价比好",
          "en": "Ari/Ladprao better value"
        },
        "src": "https://nomadlist.com/bangkok"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "泰国全国签证",
          "en": "Thailand visas"
        },
        "d": {
          "zh": "旅游/特权/LTR 同清迈",
          "en": "Same as Chiang Mai"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.thailandprivilege.co.th"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Bumrungrad 国际医院亚洲最知名",
          "en": "Bumrungrad Intl, Asia-famous"
        },
        "src": "https://www.bumrungrad.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Bupa Thailand $80-150/月",
          "en": "Bupa Thailand $80-150/mo"
        },
        "src": "https://www.bupa.co.th"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "交通拥堵是最大挑战",
          "en": "Traffic main challenge"
        },
        "src": "https://www.numbeo.com/crime/in/Bangkok"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "比清迈更国际化",
          "en": "More international"
        },
        "src": "https://www.tourismthailand.org"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 3,
        "art": 4,
        "music": 4,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "Chatuchak 市场 + 街头小吃",
          "name_en": "Chatuchak Market + Street Food",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "$2-10/餐",
          "tags": [
            "美食",
            "夜市"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Absolute You / Yoga Elements",
          "name_en": "Absolute You / Yoga Elements",
          "area_zh": "Sukhumvit",
          "area_en": "Sukhumvit",
          "price": "$10-15/次",
          "tags": [
            "瑜伽连锁"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "曼谷艺术文化中心 BACC",
          "name_en": "BACC",
          "area_zh": "Pathum Wan",
          "area_en": "Pathum Wan",
          "price": "免费",
          "tags": [
            "当代艺术"
          ],
          "src": "https://www.bacc.or.th"
        },
        {
          "emoji": "💆",
          "name_zh": "泰式按摩 (Health Land)",
          "name_en": "Thai Massage (Health Land)",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "$15-25/次",
          "tags": [
            "按摩",
            "Spa"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Sing Sing Theater / 夜场",
          "name_en": "Sing Sing Theater / Nightlife",
          "area_zh": "Sukhumvit",
          "area_en": "Sukhumvit",
          "price": "$10-30/晚",
          "tags": [
            "酒吧",
            "夜生活"
          ],
          "src": ""
        },
        {
          "emoji": "⛩️",
          "name_zh": "大皇宫 + 卧佛寺",
          "name_en": "Grand Palace + Wat Pho",
          "area_zh": "老城",
          "area_en": "Old City",
          "price": "$15",
          "tags": [
            "寺院",
            "文化"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校丰富（NIST、Bangkok Patana 顶级），但交通需考虑，签证家庭灵活。",
        "en": "Many intl schools (NIST, Bangkok Patana top), traffic concern, flexible family visas."
      },
      "schools": [
        {
          "zh_name": "NIST International",
          "en_name": "NIST",
          "type": "intl_top",
          "price": "$28k-35k/年",
          "src": "https://www.nist.ac.th"
        },
        {
          "zh_name": "Bangkok Patana",
          "en_name": "Bangkok Patana",
          "type": "intl_ib",
          "price": "$22k-32k/年",
          "src": "https://www.patana.ac.th"
        },
        {
          "zh_name": "本地公立 + 双语学校",
          "en_name": "Local + bilingual",
          "type": "local",
          "price": "$3k-8k/年",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "ho_chi_minh",
    "name": {
      "zh": "胡志明市",
      "en": "Ho Chi Minh"
    },
    "country": {
      "zh": "越南",
      "en": "Vietnam"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 10.82,
    "lng": 106.63,
    "sub": {
      "zh": "超低成本·活力年轻城市",
      "en": "Ultra-low cost·Young vibrant"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$900/月生活成本极低",
        "regular": "Regular FIRE 高品质",
        "fat": "成本过低",
        "barista": "咖啡馆远程工作天堂",
        "coast": "$1,000 被动收入舒适"
      },
      "en": {
        "lean": "$900/mo ultra-low cost",
        "regular": "High quality Regular FIRE",
        "fat": "Costs too low",
        "barista": "Cafe remote work paradise",
        "coast": "$1,000/mo passive comfortable"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$900",
        "src": "https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City"
      },
      {
        "key": "Housing",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City"
      },
      {
        "key": "Food",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City"
      },
      {
        "key": "Transit",
        "val": "$60",
        "src": "https://www.grab.com/vn"
      },
      {
        "key": "Leisure",
        "val": "$140",
        "src": "https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City"
      },
      {
        "key": "Health",
        "val": "$100",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "街边越南粉 $1-2",
          "en": "Street pho $1-2"
        },
        "src": "https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "E-Visa",
          "en": "E-Visa"
        },
        "d": {
          "zh": "90 天电子签证",
          "en": "90-day e-visa"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 方便",
          "en": "✓ Easy"
        },
        "src": "https://www.evisa.gov.vn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "FV Hospital/Vinmec 国际私立",
          "en": "FV Hospital/Vinmec intl"
        },
        "src": "https://www.fvhospital.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing $45/月推荐",
          "en": "SafetyWing $45/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "摩托车密度高",
          "en": "High motorbike density"
        },
        "src": "https://www.numbeo.com/crime/in/Ho-Chi-Minh-City"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "年轻一代英语进步快",
          "en": "Young gen improving English"
        },
        "src": "https://ef.com/epi"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 2,
        "art": 3,
        "music": 3,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍜",
          "name_zh": "Pho 24 + 街边法棍 Banh Mi",
          "name_en": "Pho 24 + Banh Mi Streets",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "$1-3/餐",
          "tags": [
            "越南粉",
            "法棍"
          ],
          "src": ""
        },
        {
          "emoji": "☕",
          "name_zh": "Cong Caphe + Saigon 咖啡馆",
          "name_en": "Cong Caphe + Saigon Cafes",
          "area_zh": "D1/D3",
          "area_en": "D1/D3",
          "price": "$1-3/杯",
          "tags": [
            "越南咖啡"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Living Center",
          "name_en": "Yoga Living Center",
          "area_zh": "D1/D2",
          "area_en": "D1/D2",
          "price": "$8-12/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "美术博物馆 + Salon Saigon",
          "name_en": "Fine Arts Museum + Salon Saigon",
          "area_zh": "D1",
          "area_en": "D1",
          "price": "$2-5",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "湄公河三角洲 1 日游",
          "name_en": "Mekong Delta Day Trip",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "$15-30",
          "tags": [
            "户外",
            "船游"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Bui Vien 步行街",
          "name_en": "Bui Vien Walking Street",
          "area_zh": "D1",
          "area_en": "D1",
          "price": "免费",
          "tags": [
            "夜生活",
            "酒吧"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校多但贵，E-Visa 全家可用，越南文化对孩子开放。",
        "en": "Many intl schools but pricey, E-visa works for whole family, open culture."
      },
      "schools": [
        {
          "zh_name": "American School (TAS)",
          "en_name": "TAS HCMC",
          "type": "intl_top",
          "price": "$22k-30k/年",
          "src": ""
        },
        {
          "zh_name": "British International (BIS)",
          "en_name": "BIS HCMC",
          "type": "intl_ib",
          "price": "$18k-28k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "$500-2k/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 700
  },
  {
    "id": "hanoi",
    "name": {
      "zh": "河内",
      "en": "Hanoi"
    },
    "country": {
      "zh": "越南",
      "en": "Vietnam"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 21.03,
    "lng": 105.85,
    "sub": {
      "zh": "千年古都·文化深度",
      "en": "Ancient capital·Deep culture"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$800/月生活舒适",
        "regular": "奢华生活",
        "fat": "成本极低",
        "barista": "老城咖啡馆理想",
        "coast": "Coast 容易"
      },
      "en": {
        "lean": "$800/mo comfortable",
        "regular": "Luxurious",
        "fat": "Very low",
        "barista": "Old Quarter cafes ideal",
        "coast": "Coast easy"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$800",
        "src": "https://www.numbeo.com/cost-of-living/in/Hanoi"
      },
      {
        "key": "Housing",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Hanoi"
      },
      {
        "key": "Food",
        "val": "$170",
        "src": "https://www.numbeo.com/cost-of-living/in/Hanoi"
      },
      {
        "key": "Transit",
        "val": "$50",
        "src": "https://www.grab.com/vn"
      },
      {
        "key": "Leisure",
        "val": "$120",
        "src": "https://www.numbeo.com/cost-of-living/in/Hanoi"
      },
      {
        "key": "Health",
        "val": "$80",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Tay Ho 湖区外国人聚集",
          "en": "Tay Ho area popular expats"
        },
        "src": "https://nomadlist.com/hanoi"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "E-Visa 90 天",
          "en": "E-Visa 90d"
        },
        "d": {
          "zh": "境内可延",
          "en": "Extendable"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.evisa.gov.vn"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Vinmec 河内院国际水准",
          "en": "Vinmec Hanoi intl"
        },
        "src": "https://vinmec.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing 必备",
          "en": "SafetyWing essential"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Hanoi"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "千年文化比胡志明传统",
          "en": "More traditional than HCMC"
        },
        "src": "https://whc.unesco.org"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 4,
        "music": 3,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "老城区美食巡礼",
          "name_en": "Old Quarter Food Tour",
          "area_zh": "Hoan Kiem",
          "area_en": "Hoan Kiem",
          "price": "$1-3/餐",
          "tags": [
            "小吃",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Thang Long 水上木偶剧",
          "name_en": "Thang Long Water Puppet",
          "area_zh": "Hoan Kiem",
          "area_en": "Hoan Kiem",
          "price": "$5-8",
          "tags": [
            "水偶",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "☕",
          "name_zh": "Tay Ho 湖区咖啡",
          "name_en": "Tay Ho Lake Cafes",
          "area_zh": "Tay Ho",
          "area_en": "Tay Ho",
          "price": "$2-5/杯",
          "tags": [
            "咖啡",
            "湖景"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "越南美术博物馆",
          "name_en": "Vietnam Fine Arts Museum",
          "area_zh": "Ba Dinh",
          "area_en": "Ba Dinh",
          "price": "$2",
          "tags": [
            "美术",
            "国家"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽社区 (Tay Ho)",
          "name_en": "Yoga Community (Tay Ho)",
          "area_zh": "Tay Ho",
          "area_en": "Tay Ho",
          "price": "$8-12/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Ha Long Bay 周末游",
          "name_en": "Ha Long Bay Weekend",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "$50-150/日",
          "tags": [
            "海湾",
            "世遗"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择不如胡志明多，文化深厚适合文化沉浸家庭。",
        "en": "Fewer intl options than HCMC, rich culture for immersion families."
      },
      "schools": [
        {
          "zh_name": "UN International School (UNIS)",
          "en_name": "UNIS Hanoi",
          "type": "intl_top",
          "price": "$25k-32k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立学校",
          "en_name": "Local public",
          "type": "local",
          "price": "$500-2k/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 600
  },
  {
    "id": "bali",
    "name": {
      "zh": "巴厘岛",
      "en": "Bali"
    },
    "country": {
      "zh": "印尼",
      "en": "Indonesia"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": -8.41,
    "lng": 115.19,
    "sub": {
      "zh": "数字游民天堂·灵性旅居",
      "en": "Digital nomad heaven·Spiritual retreat"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,100/月精彩",
        "regular": "顶级别墅",
        "fat": "成本低海岛独特",
        "barista": "全球最大游民社区",
        "coast": "$1,200 即可舒适"
      },
      "en": {
        "lean": "$1,100/mo great",
        "regular": "Top villas",
        "fat": "Low cost island unique",
        "barista": "World's largest nomad scene",
        "coast": "$1,200 enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,100",
        "src": "https://www.numbeo.com/cost-of-living/in/Bali"
      },
      {
        "key": "Housing",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Bali"
      },
      {
        "key": "Food",
        "val": "$240",
        "src": "https://www.numbeo.com/cost-of-living/in/Bali"
      },
      {
        "key": "Transit",
        "val": "$70",
        "src": "https://www.grab.com/id"
      },
      {
        "key": "Leisure",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Bali"
      },
      {
        "key": "Health",
        "val": "$120",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Canggu 游民聚集，乌布灵性",
          "en": "Canggu nomads, Ubud spiritual"
        },
        "src": "https://nomadlist.com/canggu"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "B211A 旅游签",
          "en": "B211A Tourist"
        },
        "d": {
          "zh": "60 天可延 180",
          "en": "60d, ext to 180"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.imigrasi.go.id"
      },
      {
        "t": {
          "zh": "E33G 数字游民签",
          "en": "E33G Nomad"
        },
        "d": {
          "zh": "1 年需远程证明",
          "en": "1yr, remote proof"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://molina.imigrasi.go.id"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "BIMC Hospital 外籍首选",
          "en": "BIMC, expat first choice"
        },
        "src": "https://www.bimcbali.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "World Nomads/SafetyWing",
          "en": "World Nomads/SafetyWing"
        },
        "src": "https://www.worldnomads.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Denpasar"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "巴厘印度教仪式繁多",
          "en": "Balinese Hindu rituals"
        },
        "src": "https://www.indonesia.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 5,
        "performance": 3,
        "art": 4,
        "music": 4,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "yoga",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🧘",
          "name_zh": "The Yoga Barn / Radiantly Alive",
          "name_en": "The Yoga Barn / Radiantly Alive",
          "area_zh": "乌布",
          "area_en": "Ubud",
          "price": "$13-20/次",
          "tags": [
            "瑜伽",
            "世界级",
            "灵性"
          ],
          "src": "https://theyogabarn.com"
        },
        {
          "emoji": "🏄",
          "name_zh": "Canggu / Uluwatu 冲浪",
          "name_en": "Canggu / Uluwatu Surf",
          "area_zh": "南岛",
          "area_en": "South",
          "price": "$30-40/课",
          "tags": [
            "冲浪",
            "海浪"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Locavore / Warung Babi Guling",
          "name_en": "Locavore / Babi Guling",
          "area_zh": "乌布",
          "area_en": "Ubud",
          "price": "$5-50/餐",
          "tags": [
            "米其林",
            "本地"
          ],
          "src": "https://locavore.co.id"
        },
        {
          "emoji": "🎨",
          "name_zh": "ARMA / Neka 艺术馆",
          "name_en": "ARMA / Neka Museum",
          "area_zh": "乌布",
          "area_en": "Ubud",
          "price": "$7",
          "tags": [
            "巴厘艺术"
          ],
          "src": "https://armabali.com"
        },
        {
          "emoji": "💆",
          "name_zh": "Bali 传统 Spa + 按摩",
          "name_en": "Bali Spa + Massage",
          "area_zh": "乌布/Seminyak",
          "area_en": "Ubud/Seminyak",
          "price": "$15-50",
          "tags": [
            "Spa",
            "按摩"
          ],
          "src": ""
        },
        {
          "emoji": "☕",
          "name_zh": "Dojo Bali 共享办公咖啡",
          "name_en": "Dojo Bali Coworking",
          "area_zh": "Canggu",
          "area_en": "Canggu",
          "price": "$25/天",
          "tags": [
            "数字游民"
          ],
          "src": "https://www.dojobali.org"
        },
        {
          "emoji": "🌋",
          "name_zh": "Mt. Batur 日出徒步",
          "name_en": "Mt. Batur Sunrise Hike",
          "area_zh": "北岛",
          "area_en": "North",
          "price": "$30-50",
          "tags": [
            "徒步",
            "火山"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "绿色学校 (Green School) 闻名世界，户外环境对孩子极佳；E33G 数字游民签包括家属。",
        "en": "Green School world-famous, outdoor environment ideal for kids; E33G nomad visa includes family."
      },
      "schools": [
        {
          "zh_name": "Green School Bali",
          "en_name": "Green School",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": "https://www.greenschool.org"
        },
        {
          "zh_name": "Bali Island School (BIS)",
          "en_name": "BIS Bali",
          "type": "intl_ib",
          "price": "$13k-18k/年",
          "src": ""
        },
        {
          "zh_name": "Sekolah (本地)",
          "en_name": "Local Sekolah",
          "type": "local",
          "price": "$200/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 1200
  },
  {
    "id": "penang",
    "name": {
      "zh": "槟城",
      "en": "Penang"
    },
    "country": {
      "zh": "马来西亚",
      "en": "Malaysia"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 5.41,
    "lng": 100.33,
    "sub": {
      "zh": "美食天堂·MM2H 签证友好",
      "en": "Food paradise·MM2H friendly"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,100/月舒适",
        "regular": "奢侈海岛生活",
        "fat": "成本偏低",
        "barista": "英语便利",
        "coast": "MM2H 极佳"
      },
      "en": {
        "lean": "$1,100/mo comfortable",
        "regular": "Luxury island",
        "fat": "Low cost",
        "barista": "English easy",
        "coast": "MM2H excellent"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,100",
        "src": "https://www.numbeo.com/cost-of-living/in/Penang"
      },
      {
        "key": "Housing",
        "val": "$420",
        "src": "https://www.numbeo.com/cost-of-living/in/Penang"
      },
      {
        "key": "Food",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Penang"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.rapidkl.com.my"
      },
      {
        "key": "Leisure",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Penang"
      },
      {
        "key": "Health",
        "val": "$120",
        "src": "https://www.aia.com.my"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "美食世界级 $2-3 一餐",
          "en": "World-class food $2-3/meal"
        },
        "src": "https://www.cnn.com/travel"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "MM2H 第二家园",
          "en": "MM2H"
        },
        "d": {
          "zh": "USD $150k+ 定存（2024）",
          "en": "USD $150k+ deposit (2024)"
        },
        "cl": "green",
        "l": {
          "zh": "✓ FIRE",
          "en": "✓ FIRE"
        },
        "src": "https://www.mm2h.gov.my"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Gleneagles 槟城国际",
          "en": "Gleneagles Penang intl"
        },
        "src": "https://www.gleneagles.com.my/penang"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "AIA/Prudential $60-150/月",
          "en": "AIA/Prudential $60-150/mo"
        },
        "src": "https://www.aia.com.my"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "槟城非常安全",
          "en": "Penang very safe"
        },
        "src": "https://www.numbeo.com/crime/in/George-Town-Penang-Malaysia"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "华人占多数",
          "en": "Chinese majority"
        },
        "src": "https://www.tourism.gov.my"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 2,
        "art": 4,
        "music": 3,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "food",
        "art"
      ],
      "venues": [
        {
          "emoji": "🍜",
          "name_zh": "乔治市美食 (Char Kway Teow, Laksa)",
          "name_en": "George Town Hawker (Char Kway Teow, Laksa)",
          "area_zh": "George Town",
          "area_en": "George Town",
          "price": "$2-5/餐",
          "tags": [
            "美食",
            "世界级"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "街头壁画 / Hin Bus Depot",
          "name_en": "Street Murals / Hin Bus Depot",
          "area_zh": "George Town",
          "area_en": "George Town",
          "price": "免费",
          "tags": [
            "街艺",
            "文化"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽工作室 (Yoga Plus 等)",
          "name_en": "Yoga Plus etc.",
          "area_zh": "George Town",
          "area_en": "George Town",
          "price": "$8-12/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🏖️",
          "name_zh": "Batu Ferringhi 海滩",
          "name_en": "Batu Ferringhi Beach",
          "area_zh": "北部",
          "area_en": "North",
          "price": "免费",
          "tags": [
            "海滩"
          ],
          "src": ""
        },
        {
          "emoji": "⛰️",
          "name_zh": "Penang Hill 缆车 + 徒步",
          "name_en": "Penang Hill Funicular + Hike",
          "area_zh": "Air Itam",
          "area_en": "Air Itam",
          "price": "$3-10",
          "tags": [
            "徒步",
            "城景"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Penang Performing Arts Centre",
          "name_en": "Penang Performing Arts Centre",
          "area_zh": "Bayan Lepas",
          "area_en": "Bayan Lepas",
          "price": "$10-30",
          "tags": [
            "演出"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "MM2H 全家移居，国际学校选择多 + 多元文化对孩子好。",
        "en": "MM2H covers family, many intl schools + multicultural exposure good for kids."
      },
      "schools": [
        {
          "zh_name": "Uplands International",
          "en_name": "Uplands",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "Tenby International",
          "en_name": "Tenby Penang",
          "type": "intl_ib",
          "price": "$10k-15k/年",
          "src": ""
        },
        {
          "zh_name": "本地 + Chinese 学校",
          "en_name": "Local + Chinese",
          "type": "local",
          "price": "$1k-3k/年",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 900
  },
  {
    "id": "manila",
    "name": {
      "zh": "马尼拉",
      "en": "Manila"
    },
    "country": {
      "zh": "菲律宾",
      "en": "Philippines"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 14.6,
    "lng": 120.98,
    "sub": {
      "zh": "英语通用·海岛跳板",
      "en": "English everywhere·Island gateway"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,200/月舒适",
        "regular": "高品质",
        "fat": "成本偏低",
        "barista": "远程工作天堂",
        "coast": "被动覆盖容易"
      },
      "en": {
        "lean": "$1,200/mo",
        "regular": "High quality",
        "fat": "Low cost",
        "barista": "Remote work paradise",
        "coast": "Easy passive"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,200",
        "src": "https://www.numbeo.com/cost-of-living/in/Manila"
      },
      {
        "key": "Housing",
        "val": "$500",
        "src": "https://www.numbeo.com/cost-of-living/in/Manila"
      },
      {
        "key": "Food",
        "val": "$230",
        "src": "https://www.numbeo.com/cost-of-living/in/Manila"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.grab.com/ph"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Manila"
      },
      {
        "key": "Health",
        "val": "$160",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "BGC 是首选区",
          "en": "BGC top expat area"
        },
        "src": "https://nomadlist.com/manila"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "SRRV 退休签",
          "en": "SRRV"
        },
        "d": {
          "zh": "$10k-50k 存款永久居留",
          "en": "$10k-50k deposit permanent"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 退休",
          "en": "✓ Retire"
        },
        "src": "https://www.pra.gov.ph"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "St. Luke's 亚洲顶尖",
          "en": "St. Luke's top in Asia"
        },
        "src": "https://www.stlukes.com.ph"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing/Cigna $45-150/月",
          "en": "SafetyWing/Cigna $45-150/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "BGC 安全，避特定区",
          "en": "BGC safe, avoid certain areas"
        },
        "src": "https://www.numbeo.com/crime/in/Manila"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "英语官方语言之一",
          "en": "English official"
        },
        "src": "https://ef.com/epi"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 4,
        "food": 4,
        "outdoor": 3
      },
      "greenStars": [
        "music"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "BGC + Poblacion 餐厅区",
          "name_en": "BGC + Poblacion Dining",
          "area_zh": "Taguig/Makati",
          "area_en": "Taguig/Makati",
          "price": "$5-30/餐",
          "tags": [
            "国际餐"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Live Music Bars (Makati)",
          "name_en": "Live Music Bars (Makati)",
          "area_zh": "Makati",
          "area_en": "Makati",
          "price": "$5-15",
          "tags": [
            "现场音乐",
            "OPM"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Plus / White Space",
          "name_en": "Yoga Plus / White Space",
          "area_zh": "BGC",
          "area_en": "BGC",
          "price": "$10-15/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "国家美术馆",
          "name_en": "National Museum of Fine Arts",
          "area_zh": "Manila",
          "area_en": "Manila",
          "price": "免费",
          "tags": [
            "艺术",
            "免费"
          ],
          "src": ""
        },
        {
          "emoji": "🏝️",
          "name_zh": "Boracay / Palawan 周末游",
          "name_en": "Boracay / Palawan Weekend",
          "area_zh": "国内",
          "area_en": "Domestic",
          "price": "$100-300/日",
          "tags": [
            "海岛",
            "潜水"
          ],
          "src": ""
        },
        {
          "emoji": "⛪",
          "name_zh": "Intramuros 西班牙旧城",
          "name_en": "Intramuros Old Spanish Town",
          "area_zh": "Manila",
          "area_en": "Manila",
          "price": "$2-5",
          "tags": [
            "历史"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "英语零障碍 + SRRV 全家覆盖，BGC 是家庭最佳选择。",
        "en": "English barrier-free + SRRV covers family, BGC best for families."
      },
      "schools": [
        {
          "zh_name": "International School Manila",
          "en_name": "ISM",
          "type": "intl_top",
          "price": "$25k-32k/年",
          "src": ""
        },
        {
          "zh_name": "British School Manila",
          "en_name": "BSM",
          "type": "intl_ib",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "本地双语学校",
          "en_name": "Bilingual local",
          "type": "local",
          "price": "$2k-5k/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "ok",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 900
  },
  {
    "id": "kuala_lumpur",
    "name": {
      "zh": "吉隆坡",
      "en": "Kuala Lumpur"
    },
    "country": {
      "zh": "马来西亚",
      "en": "Malaysia"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 3.14,
    "lng": 101.69,
    "sub": {
      "zh": "英语通用·MM2H 签证",
      "en": "English everywhere·MM2H visa"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,400 接近上限",
        "regular": "MM2H 极佳",
        "fat": "国际化便利",
        "barista": "远程工作便利",
        "coast": "MM2H + 低成本极佳"
      },
      "en": {
        "lean": "$1,400 near limit",
        "regular": "MM2H excellent",
        "fat": "Intl convenient",
        "barista": "Remote work convenient",
        "coast": "MM2H + low cost"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,400",
        "src": "https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur"
      },
      {
        "key": "Housing",
        "val": "$550",
        "src": "https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur"
      },
      {
        "key": "Food",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur"
      },
      {
        "key": "Transit",
        "val": "$100",
        "src": "https://www.grab.com/my"
      },
      {
        "key": "Leisure",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur"
      },
      {
        "key": "Health",
        "val": "$140",
        "src": "https://www.aia.com.my"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "MM2H 长居最佳方案",
          "en": "MM2H best long-stay"
        },
        "src": "https://www.mm2h.gov.my"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "MM2H 第二家园",
          "en": "MM2H"
        },
        "d": {
          "zh": "USD $150k+ 定存",
          "en": "USD $150k+ deposit"
        },
        "cl": "green",
        "l": {
          "zh": "✓ FIRE 设计",
          "en": "✓ FIRE"
        },
        "src": "https://www.mm2h.gov.my"
      },
      {
        "t": {
          "zh": "DE Rantau 数字游民签",
          "en": "DE Rantau Nomad"
        },
        "d": {
          "zh": "月 $2,400+",
          "en": "$2,400+/mo"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://mdec.my/derantau"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Gleneagles/Pantai 国际",
          "en": "Gleneagles/Pantai intl"
        },
        "src": "https://www.gleneagles.com.my"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "AIA/Prudential $60-150/月",
          "en": "AIA/Prudential $60-150/mo"
        },
        "src": "https://www.aia.com.my"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Kuala-Lumpur"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "华人 23%",
          "en": "23% Chinese"
        },
        "src": "https://www.tourism.gov.my"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍜",
          "name_zh": "Jalan Alor 美食街",
          "name_en": "Jalan Alor Food Street",
          "area_zh": "Bukit Bintang",
          "area_en": "Bukit Bintang",
          "price": "$3-8/餐",
          "tags": [
            "夜市",
            "多元"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "PURE Yoga 连锁",
          "name_en": "PURE Yoga",
          "area_zh": "市内多店",
          "area_en": "Citywide",
          "price": "$15-20/次",
          "tags": [
            "瑜伽顶级"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "国家美术馆",
          "name_en": "National Art Gallery",
          "area_zh": "Titiwangsa",
          "area_en": "Titiwangsa",
          "price": "免费",
          "tags": [
            "艺术",
            "免费"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "No Black Tie Live",
          "name_en": "No Black Tie Live",
          "area_zh": "Bukit Bintang",
          "area_en": "Bukit Bintang",
          "price": "$10-25",
          "tags": [
            "爵士"
          ],
          "src": ""
        },
        {
          "emoji": "🏞️",
          "name_zh": "Batu Caves + Kanching 瀑布",
          "name_en": "Batu Caves + Kanching Falls",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "免费",
          "tags": [
            "徒步",
            "印度教"
          ],
          "src": ""
        },
        {
          "emoji": "🌃",
          "name_zh": "Heli Lounge Bar 天空酒吧",
          "name_en": "Heli Lounge Bar",
          "area_zh": "Bukit Bintang",
          "area_en": "Bukit Bintang",
          "price": "$15-25/杯",
          "tags": [
            "夜景",
            "酒吧"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "MM2H 全家移居，国际学校选择最多（Garden, ISKL），多元文化优势。",
        "en": "MM2H whole family, most intl schools (Garden, ISKL), multicultural advantage."
      },
      "schools": [
        {
          "zh_name": "International School KL (ISKL)",
          "en_name": "ISKL",
          "type": "intl_top",
          "price": "$25k-32k/年",
          "src": "https://www.iskl.edu.my"
        },
        {
          "zh_name": "Garden International",
          "en_name": "Garden Intl",
          "type": "intl_ib",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "本地华人 / 印度学校",
          "en_name": "Local Chinese / Indian",
          "type": "local",
          "price": "$1k-3k/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "great",
        "fat": "great",
        "barista": "great",
        "coast": "great"
      }
    },
    "eduPerKid": 1100
  },
  {
    "id": "singapore",
    "name": {
      "zh": "新加坡",
      "en": "Singapore"
    },
    "country": {
      "zh": "新加坡",
      "en": "Singapore"
    },
    "region": {
      "zh": "东南亚",
      "en": "Southeast Asia"
    },
    "lat": 1.35,
    "lng": 103.82,
    "sub": {
      "zh": "亚洲枢纽·顶级安全和医疗",
      "en": "Asian hub·Top safety & healthcare"
    },
    "fit": {
      "lean": "poor",
      "regular": "poor",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "$3,500 远超",
        "regular": "勉强",
        "fat": "亚洲首选",
        "barista": "成本高",
        "coast": "挑战大"
      },
      "en": {
        "lean": "$3,500 far over",
        "regular": "Marginal",
        "fat": "Asian top",
        "barista": "Costly",
        "coast": "Challenging"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$3,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Singapore"
      },
      {
        "key": "Housing",
        "val": "$1,800",
        "src": "https://www.numbeo.com/cost-of-living/in/Singapore"
      },
      {
        "key": "Food",
        "val": "$500",
        "src": "https://www.numbeo.com/cost-of-living/in/Singapore"
      },
      {
        "key": "Transit",
        "val": "$150",
        "src": "https://www.smrt.com.sg"
      },
      {
        "key": "Leisure",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Singapore"
      },
      {
        "key": "Health",
        "val": "$300",
        "src": "https://www.moh.gov.sg"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "小贩中心 $3-5",
          "en": "Hawker $3-5"
        },
        "src": "https://www.visitsingapore.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "Global Investor",
          "en": "Global Investor"
        },
        "d": {
          "zh": "$2.5M 投资获 PR",
          "en": "$2.5M investment PR"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 高门槛",
          "en": "⚠ High"
        },
        "src": "https://www.edb.gov.sg"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "亚洲顶级医疗",
          "en": "Top Asian healthcare"
        },
        "src": "https://www.moh.gov.sg"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保 $200-500/月",
          "en": "Intl $200-500/mo"
        },
        "src": "https://www.aia.com.sg"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "全球最安全国家",
          "en": "Among world's safest"
        },
        "src": "https://www.numbeo.com/crime/in/Singapore"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "多元种族，英语行政",
          "en": "Multi-ethnic, English official"
        },
        "src": "https://www.gov.sg"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 5,
        "performance": 5,
        "art": 5,
        "music": 4,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "yoga",
        "art",
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "Hawker Centre 米其林小贩",
          "name_en": "Michelin Hawker Centres",
          "area_zh": "全市",
          "area_en": "Citywide",
          "price": "$3-8/餐",
          "tags": [
            "米其林街食",
            "顶级"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "National Gallery + ArtScience Museum",
          "name_en": "National Gallery + ArtScience",
          "area_zh": "Marina Bay",
          "area_en": "Marina Bay",
          "price": "$15-25",
          "tags": [
            "艺术",
            "顶级"
          ],
          "src": "https://www.nationalgallery.sg"
        },
        {
          "emoji": "🧘",
          "name_zh": "PURE Yoga / Hom Yoga",
          "name_en": "PURE Yoga / Hom Yoga",
          "area_zh": "全市",
          "area_en": "Citywide",
          "price": "$25-35/次",
          "tags": [
            "瑜伽顶级"
          ],
          "src": "https://www.pure-yoga.com"
        },
        {
          "emoji": "🎭",
          "name_zh": "Esplanade 滨海艺术中心",
          "name_en": "Esplanade",
          "area_zh": "Marina Bay",
          "area_en": "Marina Bay",
          "price": "$30-200",
          "tags": [
            "剧院",
            "顶级"
          ],
          "src": "https://www.esplanade.com"
        },
        {
          "emoji": "🌳",
          "name_zh": "Gardens by the Bay + 麦里芝",
          "name_en": "Gardens by Bay + MacRitchie",
          "area_zh": "Marina Bay",
          "area_en": "Marina Bay",
          "price": "$20",
          "tags": [
            "花园",
            "徒步"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Blu Jaz Cafe / Singapore Symphony",
          "name_en": "Blu Jaz Cafe / SSO",
          "area_zh": "Kampong Glam",
          "area_en": "Kampong Glam",
          "price": "$10-80",
          "tags": [
            "爵士",
            "古典"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "亚洲家庭天堂——但极贵；UWCSEA + ISS 顶尖。需投资移民 $2.5M。",
        "en": "Asia's family heaven but very expensive; UWCSEA + ISS top. Need $2.5M investor visa."
      },
      "schools": [
        {
          "zh_name": "UWC South East Asia",
          "en_name": "UWCSEA",
          "type": "intl_top",
          "price": "$35k-45k/年",
          "src": "https://www.uwcsea.edu.sg"
        },
        {
          "zh_name": "International School (ISS)",
          "en_name": "ISS",
          "type": "intl_ib",
          "price": "$30k-38k/年",
          "src": ""
        },
        {
          "zh_name": "本地公立 (PR 才可)",
          "en_name": "Local (PR only)",
          "type": "local",
          "price": "$2k-6k/年",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "poor",
        "fat": "great",
        "barista": "ok",
        "coast": "poor"
      }
    },
    "eduPerKid": 2500
  },
  {
    "id": "lisbon",
    "name": {
      "zh": "里斯本",
      "en": "Lisbon"
    },
    "country": {
      "zh": "葡萄牙",
      "en": "Portugal"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 38.72,
    "lng": -9.14,
    "sub": {
      "zh": "欧洲性价比之王·D7 签证天堂",
      "en": "Europe's value king·D7 visa heaven"
    },
    "fit": {
      "lean": "poor",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,000 超 Lean",
        "regular": "欧洲最佳，D7 为 FIRE 设计",
        "fat": "可考虑更高端",
        "barista": "D8 + 半退休理想",
        "coast": "$2,000+ 被动"
      },
      "en": {
        "lean": "$2,000 over Lean",
        "regular": "Europe's best, D7 for FIRE",
        "fat": "Consider higher-end",
        "barista": "D8 + semi-retire ideal",
        "coast": "$2,000+ passive"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Lisbon"
      },
      {
        "key": "Housing",
        "val": "$1,200",
        "src": "https://www.idealista.pt"
      },
      {
        "key": "Food",
        "val": "$400",
        "src": "https://www.numbeo.com/cost-of-living/in/Lisbon"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.carris.pt"
      },
      {
        "key": "Leisure",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Lisbon"
      },
      {
        "key": "Health",
        "val": "$170",
        "src": "https://www.aima.gov.pt"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "D7 月收入 €920+（2026 新规）",
          "en": "D7: €920+/mo (2026)"
        },
        "src": "https://www.aima.gov.pt"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "D7 被动收入签",
          "en": "D7 Passive"
        },
        "d": {
          "zh": "月被动 €920+",
          "en": "€920+/mo passive"
        },
        "cl": "green",
        "l": {
          "zh": "✓ FIRE 首选",
          "en": "✓ FIRE top"
        },
        "src": "https://www.aima.gov.pt"
      },
      {
        "t": {
          "zh": "D8 数字游民签",
          "en": "D8 Nomad"
        },
        "d": {
          "zh": "月 $3,200+",
          "en": "$3,200+/mo"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.aima.gov.pt"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "SNS 国家医疗 D7 后可加入",
          "en": "SNS national health after D7"
        },
        "src": "https://www.sns.gov.pt/en"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "私立 Médis $50-150/月",
          "en": "Private Médis $50-150/mo"
        },
        "src": "https://www.medis.pt"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "全球和平国家前 10",
          "en": "Top 10 peace globally"
        },
        "src": "https://www.visionofhumanity.org"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "法多音乐 Alfama 区",
          "en": "Fado music Alfama"
        },
        "src": "https://www.visitportugal.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 5,
        "art": 4,
        "music": 4,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "yoga",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🧘",
          "name_zh": "Yoga Shala / Inhala",
          "name_en": "Yoga Shala / Inhala",
          "area_zh": "Príncipe Real",
          "area_en": "Príncipe Real",
          "price": "€15/次",
          "tags": [
            "瑜伽",
            "英文授课"
          ],
          "src": "https://yogashalalisboa.pt"
        },
        {
          "emoji": "🎭",
          "name_zh": "São Carlos 国家歌剧院",
          "name_en": "São Carlos Opera House",
          "area_zh": "Chiado",
          "area_en": "Chiado",
          "price": "€15-80",
          "tags": [
            "歌剧",
            "古典"
          ],
          "src": "https://tnsc.pt"
        },
        {
          "emoji": "🎵",
          "name_zh": "Hot Clube de Portugal 爵士",
          "name_en": "Hot Clube de Portugal",
          "area_zh": "Príncipe Real",
          "area_en": "Príncipe Real",
          "price": "€10-15",
          "tags": [
            "爵士",
            "夜生活"
          ],
          "src": "https://hcp.pt"
        },
        {
          "emoji": "🎨",
          "name_zh": "MAAT + Gulbenkian 美术馆",
          "name_en": "MAAT + Gulbenkian",
          "area_zh": "Belém/Centro",
          "area_en": "Belém/Centro",
          "price": "€11-14",
          "tags": [
            "当代",
            "建筑"
          ],
          "src": "https://www.maat.pt"
        },
        {
          "emoji": "🏄",
          "name_zh": "Carcavelos / Costa da Caparica 冲浪",
          "name_en": "Carcavelos / Caparica Surf",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "€30/课",
          "tags": [
            "冲浪",
            "海滩"
          ],
          "src": ""
        },
        {
          "emoji": "🎶",
          "name_zh": "Fado in Alfama (Mesa de Frades)",
          "name_en": "Fado in Alfama (Mesa de Frades)",
          "area_zh": "Alfama",
          "area_en": "Alfama",
          "price": "€30-50",
          "tags": [
            "Fado",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "💪",
          "name_zh": "Fitness Hut / Holmes Place",
          "name_en": "Fitness Hut / Holmes Place",
          "area_zh": "全市",
          "area_en": "Citywide",
          "price": "€30-60/月",
          "tags": [
            "健身",
            "连锁"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "欧洲家庭 FIRE 首选——D7 全家覆盖，国际学校多，欧盟身份长期收益。",
        "en": "Europe's family FIRE top pick—D7 covers family, many intl schools, EU residency."
      },
      "schools": [
        {
          "zh_name": "Carlucci American (CAISL)",
          "en_name": "CAISL",
          "type": "intl_top",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "St. Julian's School",
          "en_name": "St. Julian's",
          "type": "intl_ib",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "葡萄牙公立学校",
          "en_name": "Portuguese public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "great",
        "fat": "great",
        "barista": "great",
        "coast": "ok"
      }
    },
    "eduPerKid": 1300
  },
  {
    "id": "porto",
    "name": {
      "zh": "波尔图",
      "en": "Porto"
    },
    "country": {
      "zh": "葡萄牙",
      "en": "Portugal"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 41.16,
    "lng": -8.63,
    "sub": {
      "zh": "葡萄酒之都·比里斯本便宜",
      "en": "Wine capital·Cheaper than Lisbon"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,600 比里斯本便宜 20%",
        "regular": "欧洲性价比",
        "fat": "精致",
        "barista": "D8 + 半退休",
        "coast": "$1,600 被动够"
      },
      "en": {
        "lean": "$1,600, 20% cheaper than Lisbon",
        "regular": "Best Europe value",
        "fat": "Refined",
        "barista": "D8 + semi-retire",
        "coast": "$1,600 passive"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,600",
        "src": "https://www.numbeo.com/cost-of-living/in/Porto"
      },
      {
        "key": "Housing",
        "val": "$800",
        "src": "https://www.idealista.pt"
      },
      {
        "key": "Food",
        "val": "$340",
        "src": "https://www.numbeo.com/cost-of-living/in/Porto"
      },
      {
        "key": "Transit",
        "val": "$60",
        "src": "https://www.metrodoporto.pt"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Porto"
      },
      {
        "key": "Health",
        "val": "$170",
        "src": "https://www.aima.gov.pt"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "比里斯本便宜 20%",
          "en": "20% cheaper than Lisbon"
        },
        "src": "https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Portugal&city1=Porto&country2=Portugal&city2=Lisbon"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "D7 被动收入签",
          "en": "D7"
        },
        "d": {
          "zh": "同葡萄牙",
          "en": "Same as Portugal"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.aima.gov.pt"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "SNS 国家医疗",
          "en": "SNS national health"
        },
        "src": "https://www.sns.gov.pt/en"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "私立医保 $50-150/月",
          "en": "Private $50-150/mo"
        },
        "src": "https://www.medis.pt"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "葡萄牙全国安全",
          "en": "Portugal safe"
        },
        "src": "https://www.numbeo.com/crime/in/Porto"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "葡萄酒文化历史悠久",
          "en": "Centuries wine culture"
        },
        "src": "https://www.visitportoandnorth.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 4,
        "art": 4,
        "music": 3,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍷",
          "name_zh": "Vila Nova de Gaia 酒窖",
          "name_en": "Vila Nova de Gaia Wine Cellars",
          "area_zh": "Gaia",
          "area_en": "Gaia",
          "price": "€10-25",
          "tags": [
            "波特酒"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "Serralves 美术馆",
          "name_en": "Serralves Museum",
          "area_zh": "Foz",
          "area_en": "Foz",
          "price": "€20",
          "tags": [
            "当代艺术"
          ],
          "src": "https://www.serralves.pt"
        },
        {
          "emoji": "🎭",
          "name_zh": "Casa da Música 音乐厅",
          "name_en": "Casa da Música",
          "area_zh": "Boavista",
          "area_en": "Boavista",
          "price": "€15-60",
          "tags": [
            "古典",
            "建筑"
          ],
          "src": "https://www.casadamusica.com"
        },
        {
          "emoji": "🍳",
          "name_zh": "Bolhão 市场 + Francesinha",
          "name_en": "Bolhão Market + Francesinha",
          "area_zh": "市中心",
          "area_en": "Centro",
          "price": "€10-20/餐",
          "tags": [
            "小吃"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "瑜伽工作室 (Yoga Em Casa 等)",
          "name_en": "Yoga Studios",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "€12-18/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌊",
          "name_zh": "Foz do Douro 海滨散步",
          "name_en": "Foz do Douro Coastal Walk",
          "area_zh": "Foz",
          "area_en": "Foz",
          "price": "免费",
          "tags": [
            "海岸",
            "户外"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "比里斯本便宜 20%，国际学校少但 Oporto British 优质，D7 全家移居。",
        "en": "20% cheaper than Lisbon, fewer intl schools but Oporto British top, D7 family-wide."
      },
      "schools": [
        {
          "zh_name": "Oporto British School",
          "en_name": "Oporto British",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "葡萄牙公立学校",
          "en_name": "Portuguese public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "great",
        "fat": "great",
        "barista": "great",
        "coast": "great"
      }
    },
    "eduPerKid": 1100
  },
  {
    "id": "berlin",
    "name": {
      "zh": "柏林",
      "en": "Berlin"
    },
    "country": {
      "zh": "德国",
      "en": "Germany"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 52.52,
    "lng": 13.4,
    "sub": {
      "zh": "创意之都·自由开放",
      "en": "Creative capital·Open & liberal"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "great",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,500 超",
        "regular": "勉强",
        "fat": "顶级文化",
        "barista": "自由职业签",
        "coast": "挑战大"
      },
      "en": {
        "lean": "$2,500 over",
        "regular": "Marginal",
        "fat": "Top culture",
        "barista": "Freelance visa",
        "coast": "Challenging"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Berlin"
      },
      {
        "key": "Housing",
        "val": "$1,200",
        "src": "https://www.immobilienscout24.de"
      },
      {
        "key": "Food",
        "val": "$500",
        "src": "https://www.numbeo.com/cost-of-living/in/Berlin"
      },
      {
        "key": "Transit",
        "val": "$100",
        "src": "https://www.bvg.de"
      },
      {
        "key": "Leisure",
        "val": "$400",
        "src": "https://www.numbeo.com/cost-of-living/in/Berlin"
      },
      {
        "key": "Health",
        "val": "$300",
        "src": "https://www.tk.de"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "自由职业签适合 FIRE",
          "en": "Freelance visa fits FIRE"
        },
        "src": "https://service.berlin.de"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "自由职业签",
          "en": "Freelance"
        },
        "d": {
          "zh": "需收入证明",
          "en": "Income proof"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://service.berlin.de"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "公立 + 私立医保",
          "en": "Public + private"
        },
        "src": "https://www.bundesgesundheitsministerium.de"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "TK 公立 $200-400/月",
          "en": "TK public $200-400/mo"
        },
        "src": "https://www.tk.de"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Berlin"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "创意夜生活艺术",
          "en": "Creative nightlife art"
        },
        "src": "https://www.visitberlin.de"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 5,
        "art": 5,
        "music": 5,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "performance",
        "music",
        "art"
      ],
      "venues": [
        {
          "emoji": "🎵",
          "name_zh": "Berghain / Tresor 电子乐",
          "name_en": "Berghain / Tresor",
          "area_zh": "Friedrichshain",
          "area_en": "Friedrichshain",
          "price": "€15-25",
          "tags": [
            "电子",
            "Techno"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Berliner Philharmoniker",
          "name_en": "Berlin Philharmonic",
          "area_zh": "Tiergarten",
          "area_en": "Tiergarten",
          "price": "€20-150",
          "tags": [
            "古典",
            "顶级"
          ],
          "src": "https://www.berliner-philharmoniker.de"
        },
        {
          "emoji": "🎨",
          "name_zh": "Museum Island + East Side Gallery",
          "name_en": "Museum Island + East Side Gallery",
          "area_zh": "Mitte",
          "area_en": "Mitte",
          "price": "€18-32",
          "tags": [
            "博物馆",
            "街艺"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Spirit Yoga / Yogaspot",
          "name_en": "Spirit Yoga / Yogaspot",
          "area_zh": "Mitte",
          "area_en": "Mitte",
          "price": "€18-22/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Markthalle Neun + Döner 街角",
          "name_en": "Markthalle Neun + Döner",
          "area_zh": "Kreuzberg",
          "area_en": "Kreuzberg",
          "price": "€5-15/餐",
          "tags": [
            "国际餐"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Tiergarten + Tempelhofer Feld",
          "name_en": "Tiergarten + Tempelhofer Feld",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "免费",
          "tags": [
            "公园",
            "跑步"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Volksbühne / Schaubühne 戏剧",
          "name_en": "Volksbühne / Schaubühne",
          "area_zh": "Mitte",
          "area_en": "Mitte",
          "price": "€15-50",
          "tags": [
            "戏剧",
            "前卫"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校多（JFKS、BBIS），但自由职业签证家属程序复杂。",
        "en": "Many intl schools (JFKS, BBIS), but freelance visa for spouse is complex."
      },
      "schools": [
        {
          "zh_name": "John F. Kennedy School (JFKS)",
          "en_name": "JFKS",
          "type": "intl_top",
          "price": "免费(德美双语)",
          "src": ""
        },
        {
          "zh_name": "Berlin Brandenburg Intl (BBIS)",
          "en_name": "BBIS",
          "type": "intl_ib",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "德国公立学校",
          "en_name": "German public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1500
  },
  {
    "id": "amsterdam",
    "name": {
      "zh": "阿姆斯特丹",
      "en": "Amsterdam"
    },
    "country": {
      "zh": "荷兰",
      "en": "Netherlands"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 52.37,
    "lng": 4.9,
    "sub": {
      "zh": "运河之城·国际化高质量",
      "en": "Canal city·Intl high quality"
    },
    "fit": {
      "lean": "poor",
      "regular": "poor",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "远超",
        "regular": "偏紧",
        "fat": "欧洲精致",
        "barista": "DAFT 创业签",
        "coast": "压力大"
      },
      "en": {
        "lean": "Far over",
        "regular": "Tight",
        "fat": "Refined EU",
        "barista": "DAFT entrepreneur",
        "coast": "Pressure"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$3,300",
        "src": "https://www.numbeo.com/cost-of-living/in/Amsterdam"
      },
      {
        "key": "Housing",
        "val": "$1,900",
        "src": "https://www.pararius.com"
      },
      {
        "key": "Food",
        "val": "$600",
        "src": "https://www.numbeo.com/cost-of-living/in/Amsterdam"
      },
      {
        "key": "Transit",
        "val": "$120",
        "src": "https://www.gvb.nl"
      },
      {
        "key": "Leisure",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Amsterdam"
      },
      {
        "key": "Health",
        "val": "$250",
        "src": "https://www.zorgwijzer.nl"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "DAFT 美荷友好条约 $4,500 投资",
          "en": "DAFT US-NL $4,500"
        },
        "src": "https://ind.nl/en"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "DAFT 美籍创业",
          "en": "DAFT (US only)"
        },
        "d": {
          "zh": "$4,500 投资",
          "en": "$4,500 investment"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠ 仅美",
          "en": "⚠ US-only"
        },
        "src": "https://ind.nl/en"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "强制基础医保 $150/月",
          "en": "Mandatory health $150/mo"
        },
        "src": "https://www.government.nl/topics/health-insurance"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "基础 + 补充 $50/月",
          "en": "Basic + suppl $50/mo"
        },
        "src": "https://www.zorgwijzer.nl"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Amsterdam"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "英语普及度全欧最高",
          "en": "Highest English in EU"
        },
        "src": "https://ef.com/epi"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 5,
        "music": 4,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "art"
      ],
      "venues": [
        {
          "emoji": "🎨",
          "name_zh": "Rijksmuseum + Van Gogh 美术馆",
          "name_en": "Rijksmuseum + Van Gogh Museum",
          "area_zh": "Museumplein",
          "area_en": "Museumplein",
          "price": "€22-25",
          "tags": [
            "国宝",
            "顶级"
          ],
          "src": "https://www.rijksmuseum.nl"
        },
        {
          "emoji": "🎵",
          "name_zh": "Concertgebouw 音乐厅",
          "name_en": "Concertgebouw",
          "area_zh": "Museumplein",
          "area_en": "Museumplein",
          "price": "€25-100",
          "tags": [
            "古典",
            "顶级"
          ],
          "src": "https://www.concertgebouw.nl"
        },
        {
          "emoji": "🧘",
          "name_zh": "De Nieuwe Yogaschool",
          "name_en": "De Nieuwe Yogaschool",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "€20-25/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🚲",
          "name_zh": "自行车环城 + Vondelpark",
          "name_en": "Bike + Vondelpark",
          "area_zh": "全市",
          "area_en": "Citywide",
          "price": "租车 €10/天",
          "tags": [
            "骑行",
            "公园"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Foodhallen + 印尼 rijsttafel",
          "name_en": "Foodhallen + Rijsttafel",
          "area_zh": "Oud-West",
          "area_en": "Oud-West",
          "price": "€10-30/餐",
          "tags": [
            "国际餐"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Stadsschouwburg 剧院",
          "name_en": "International Theater Amsterdam",
          "area_zh": "Leidseplein",
          "area_en": "Leidseplein",
          "price": "€20-60",
          "tags": [
            "戏剧"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校多但贵，DAFT 仅美籍主申请，配偶儿童附属；公立质量高。",
        "en": "Many intl schools but pricey, DAFT US-only for main applicant, family attached; strong public."
      },
      "schools": [
        {
          "zh_name": "Amsterdam International (AICS)",
          "en_name": "AICS",
          "type": "intl_top",
          "price": "$10k-18k/年",
          "src": ""
        },
        {
          "zh_name": "British School (BSA)",
          "en_name": "BSA",
          "type": "intl_ib",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "荷兰公立学校",
          "en_name": "Dutch public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "poor",
        "fat": "great",
        "barista": "ok",
        "coast": "poor"
      }
    },
    "eduPerKid": 1800
  },
  {
    "id": "barcelona",
    "name": {
      "zh": "巴塞罗那",
      "en": "Barcelona"
    },
    "country": {
      "zh": "西班牙",
      "en": "Spain"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 41.39,
    "lng": 2.16,
    "sub": {
      "zh": "地中海生活·加泰文化",
      "en": "Mediterranean·Catalan culture"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "远超",
        "regular": "勉强",
        "fat": "理想欧洲",
        "barista": "DNV 可行",
        "coast": "被动 $2,400+"
      },
      "en": {
        "lean": "Far over",
        "regular": "Marginal",
        "fat": "Ideal EU",
        "barista": "DNV works",
        "coast": "Passive $2,400+"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Barcelona"
      },
      {
        "key": "Housing",
        "val": "$1,200",
        "src": "https://www.idealista.com"
      },
      {
        "key": "Food",
        "val": "$500",
        "src": "https://www.numbeo.com/cost-of-living/in/Barcelona"
      },
      {
        "key": "Transit",
        "val": "$100",
        "src": "https://www.tmb.cat"
      },
      {
        "key": "Leisure",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Barcelona"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.sanitas.es"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "非盈利签月收入 $2,800+",
          "en": "NL visa $2,800+/mo"
        },
        "src": "https://www.exteriores.gob.es"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "非盈利活动签",
          "en": "Non-Lucrative"
        },
        "d": {
          "zh": "月 $2,800+",
          "en": "$2,800+/mo"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.exteriores.gob.es"
      },
      {
        "t": {
          "zh": "数字游民签 DNV",
          "en": "DNV"
        },
        "d": {
          "zh": "月 $2,600+",
          "en": "$2,600+/mo"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.interior.gob.es"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "SNS 几乎免费",
          "en": "SNS nearly free"
        },
        "src": "https://www.sanidad.gob.es"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Sanitas/DKV $80-150/月",
          "en": "Sanitas/DKV $80-150/mo"
        },
        "src": "https://www.sanitas.es"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "扒手问题严重",
          "en": "Pickpocket serious"
        },
        "src": "https://www.numbeo.com/crime/in/Barcelona"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "晚餐 8-11pm",
          "en": "Dinner 8-11pm"
        },
        "src": "https://www.barcelona.cat/en"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 5,
        "music": 4,
        "food": 5,
        "outdoor": 5
      },
      "greenStars": [
        "art",
        "outdoor",
        "food"
      ],
      "venues": [
        {
          "emoji": "⛪",
          "name_zh": "Sagrada Familia + Park Güell",
          "name_en": "Sagrada + Park Güell",
          "area_zh": "Eixample",
          "area_en": "Eixample",
          "price": "€26-33",
          "tags": [
            "高迪",
            "建筑"
          ],
          "src": "https://sagradafamilia.org"
        },
        {
          "emoji": "🎨",
          "name_zh": "MACBA + Picasso 美术馆",
          "name_en": "MACBA + Picasso Museum",
          "area_zh": "El Raval/Born",
          "area_en": "El Raval/Born",
          "price": "€11-14",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🏖️",
          "name_zh": "Barceloneta 海滩 + 冲浪",
          "name_en": "Barceloneta Beach + Surf",
          "area_zh": "Barceloneta",
          "area_en": "Barceloneta",
          "price": "免费 / €30 课",
          "tags": [
            "海滩",
            "冲浪"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Boqueria 市场 + Tapas Tour",
          "name_en": "Boqueria Market + Tapas",
          "area_zh": "Las Ramblas",
          "area_en": "Las Ramblas",
          "price": "€2-10/盘",
          "tags": [
            "Tapas"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Bindu / Caravan",
          "name_en": "Yoga Bindu / Caravan",
          "area_zh": "Eixample",
          "area_en": "Eixample",
          "price": "€15-20/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Palau de la Música 音乐厅",
          "name_en": "Palau de la Música",
          "area_zh": "Born",
          "area_en": "Born",
          "price": "€20-80",
          "tags": [
            "古典",
            "建筑"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校丰富（ASB、BSB），非盈利签证全家覆盖，地中海生活适合孩子。",
        "en": "Many intl schools (ASB, BSB), NL visa whole family, Mediterranean life ideal."
      },
      "schools": [
        {
          "zh_name": "American School (ASB)",
          "en_name": "ASB",
          "type": "intl_top",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "British School (BSB)",
          "en_name": "BSB",
          "type": "intl_ib",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "西班牙公立 (含加泰兰)",
          "en_name": "Spanish public (incl. Catalan)",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1300
  },
  {
    "id": "madrid",
    "name": {
      "zh": "马德里",
      "en": "Madrid"
    },
    "country": {
      "zh": "西班牙",
      "en": "Spain"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 40.42,
    "lng": -3.7,
    "sub": {
      "zh": "西班牙首都·文化艺术中心",
      "en": "Spanish capital·Arts hub"
    },
    "fit": {
      "lean": "poor",
      "regular": "ok",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "超",
        "regular": "勉强",
        "fat": "精致",
        "barista": "DNV",
        "coast": "中等压力"
      },
      "en": {
        "lean": "Over",
        "regular": "Marginal",
        "fat": "Refined",
        "barista": "DNV",
        "coast": "Medium"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,100",
        "src": "https://www.numbeo.com/cost-of-living/in/Madrid"
      },
      {
        "key": "Housing",
        "val": "$1,000",
        "src": "https://www.idealista.com"
      },
      {
        "key": "Food",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/Madrid"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.crtm.es"
      },
      {
        "key": "Leisure",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Madrid"
      },
      {
        "key": "Health",
        "val": "$170",
        "src": "https://www.sanitas.es"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "普拉多博物馆 6-8pm 免费",
          "en": "Prado free 6-8pm"
        },
        "src": "https://www.museodelprado.es"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "非盈利/DNV",
          "en": "NL/DNV"
        },
        "d": {
          "zh": "同西班牙",
          "en": "Same as Spain"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.exteriores.gob.es"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "SNS 公立",
          "en": "SNS public"
        },
        "src": "https://www.sanidad.gob.es"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "私立 $80-150/月",
          "en": "Private $80-150/mo"
        },
        "src": "https://www.sanitas.es"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "比巴塞安全",
          "en": "Safer than BCN"
        },
        "src": "https://www.numbeo.com/crime/in/Madrid"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "皇家马德里博物馆三角",
          "en": "Real Madrid museum triangle"
        },
        "src": "https://www.esmadrid.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 5,
        "music": 4,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "art",
        "food"
      ],
      "venues": [
        {
          "emoji": "🎨",
          "name_zh": "Prado + Reina Sofía 美术馆三角",
          "name_en": "Prado + Reina Sofía Triangle",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "€15 (6-8pm 免费)",
          "tags": [
            "国宝",
            "毕加索"
          ],
          "src": "https://www.museodelprado.es"
        },
        {
          "emoji": "💃",
          "name_zh": "Flamenco @ Corral de la Morería",
          "name_en": "Flamenco @ Corral de la Morería",
          "area_zh": "La Latina",
          "area_en": "La Latina",
          "price": "€40-80",
          "tags": [
            "弗拉门戈"
          ],
          "src": ""
        },
        {
          "emoji": "⚽",
          "name_zh": "Bernabéu / Atlético 球场",
          "name_en": "Bernabéu / Atlético Stadium",
          "area_zh": "Chamartín",
          "area_en": "Chamartín",
          "price": "€30-200",
          "tags": [
            "足球"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Mercado de San Miguel + Tapas",
          "name_en": "San Miguel Market + Tapas",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "€3-10/盘",
          "tags": [
            "Tapas"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Center Madrid",
          "name_en": "Yoga Center Madrid",
          "area_zh": "Salamanca",
          "area_en": "Salamanca",
          "price": "€15-22/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Retiro 公园",
          "name_en": "Retiro Park",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "免费",
          "tags": [
            "公园",
            "划船"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择多于巴塞，治安更好，西班牙文化沉浸适合双语家庭。",
        "en": "More intl schools than BCN, safer, Spanish immersion for bilingual families."
      },
      "schools": [
        {
          "zh_name": "American School Madrid (ASM)",
          "en_name": "ASM",
          "type": "intl_top",
          "price": "$22k-28k/年",
          "src": ""
        },
        {
          "zh_name": "British Council School",
          "en_name": "British Council",
          "type": "intl_ib",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "西班牙公立学校",
          "en_name": "Spanish public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "valletta",
    "name": {
      "zh": "瓦莱塔",
      "en": "Valletta"
    },
    "country": {
      "zh": "马耳他",
      "en": "Malta"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 35.9,
    "lng": 14.51,
    "sub": {
      "zh": "地中海岛国·英语官方",
      "en": "Mediterranean island·English official"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,900 边缘",
        "regular": "极适合，欧盟身份",
        "fat": "海岛精致",
        "barista": "游民签理想",
        "coast": "$1,900 即可"
      },
      "en": {
        "lean": "$1,900 borderline",
        "regular": "Highly fit, EU",
        "fat": "Island refined",
        "barista": "Nomad visa ideal",
        "coast": "$1,900 enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,900",
        "src": "https://www.numbeo.com/cost-of-living/in/Valletta"
      },
      {
        "key": "Housing",
        "val": "$850",
        "src": "https://www.maltapark.com"
      },
      {
        "key": "Food",
        "val": "$420",
        "src": "https://www.numbeo.com/cost-of-living/in/Valletta"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.publictransport.com.mt"
      },
      {
        "key": "Leisure",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Valletta"
      },
      {
        "key": "Health",
        "val": "$250",
        "src": "https://www.gov.mt"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "英语官方语言",
          "en": "English official"
        },
        "src": "https://www.gov.mt"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "游民居留签",
          "en": "Nomad Residence"
        },
        "d": {
          "zh": "月 $2,700+",
          "en": "$2,700+/mo"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://nomad.residencymalta.gov.mt"
      },
      {
        "t": {
          "zh": "退休签 MRP",
          "en": "MRP Retirement"
        },
        "d": {
          "zh": "年金证明",
          "en": "Pension proof"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 退休",
          "en": "✓ Retire"
        },
        "src": "https://www.cfr.gov.mt"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "公立医保欧盟标准",
          "en": "Public health EU standard"
        },
        "src": "https://www.gov.mt"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保 $100-200/月",
          "en": "Intl $100-200/mo"
        },
        "src": "https://www.aviva.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "最安全岛国",
          "en": "Safest island"
        },
        "src": "https://www.numbeo.com/crime/in/Valletta"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "地中海 + 英国遗产",
          "en": "Mediterranean + British"
        },
        "src": "https://www.visitmalta.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 4,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🏖️",
          "name_zh": "Blue Lagoon + Gozo 岛",
          "name_en": "Blue Lagoon + Gozo Island",
          "area_zh": "Comino/Gozo",
          "area_en": "Comino/Gozo",
          "price": "€20 渡轮",
          "tags": [
            "海岛",
            "潜水"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "MUŻA 国家美术馆",
          "name_en": "MUŻA National Museum",
          "area_zh": "Valletta",
          "area_en": "Valletta",
          "price": "€10",
          "tags": [
            "艺术",
            "历史"
          ],
          "src": "https://heritagemalta.mt"
        },
        {
          "emoji": "🎭",
          "name_zh": "Manoel Theatre (1731 年)",
          "name_en": "Manoel Theatre (1731)",
          "area_zh": "Valletta",
          "area_en": "Valletta",
          "price": "€15-50",
          "tags": [
            "古剧院",
            "欧洲最古老之一"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Marsaxlokk 海鲜村",
          "name_en": "Marsaxlokk Seafood Village",
          "area_zh": "南部",
          "area_en": "South",
          "price": "€15-30/餐",
          "tags": [
            "海鲜"
          ],
          "src": ""
        },
        {
          "emoji": "🌊",
          "name_zh": "潜水 (Cirkewwa 等)",
          "name_en": "Diving (Cirkewwa etc.)",
          "area_zh": "全岛",
          "area_en": "Islandwide",
          "price": "€40-80/次",
          "tags": [
            "潜水",
            "世界级"
          ],
          "src": ""
        },
        {
          "emoji": "🏰",
          "name_zh": "Mdina 寂静之城",
          "name_en": "Mdina Silent City",
          "area_zh": "中部",
          "area_en": "Central",
          "price": "免费",
          "tags": [
            "古城",
            "夜景"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "英语官方语言无语言障碍，国际学校少但 Verdala 优质，欧盟身份家庭吸引。",
        "en": "English official no language barrier, few intl schools but Verdala top, EU residency draw."
      },
      "schools": [
        {
          "zh_name": "Verdala International",
          "en_name": "Verdala Intl",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "本地英文学校",
          "en_name": "Local English schools",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1100
  },
  {
    "id": "tbilisi",
    "name": {
      "zh": "第比利斯",
      "en": "Tbilisi"
    },
    "country": {
      "zh": "格鲁吉亚",
      "en": "Georgia"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 41.69,
    "lng": 44.83,
    "sub": {
      "zh": "365 天免签·极低税率",
      "en": "365-day visa-free·Ultra-low taxes"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,000/月完美",
        "regular": "绰绰有余",
        "fat": "成本过低但税优",
        "barista": "免签 + 低税天堂",
        "coast": "$1,100 被动即舒适"
      },
      "en": {
        "lean": "$1,000/mo perfect",
        "regular": "Plenty for quality",
        "fat": "Low cost tax-optimal",
        "barista": "Visa-free + low tax",
        "coast": "$1,100 passive enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Tbilisi"
      },
      {
        "key": "Housing",
        "val": "$380",
        "src": "https://www.ss.ge"
      },
      {
        "key": "Food",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Tbilisi"
      },
      {
        "key": "Transit",
        "val": "$50",
        "src": "https://ttc.com.ge/en"
      },
      {
        "key": "Leisure",
        "val": "$170",
        "src": "https://www.numbeo.com/cost-of-living/in/Tbilisi"
      },
      {
        "key": "Health",
        "val": "$100",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "365 天免签全球最宽松",
          "en": "365-day visa-free, most lenient"
        },
        "src": "https://migration.gov.ge/en/visa-free-countries"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "365 天免签",
          "en": "365-day free"
        },
        "d": {
          "zh": "美/欧/加等",
          "en": "US/EU/CA"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 最宽松",
          "en": "✓ Most lenient"
        },
        "src": "https://migration.gov.ge/en/visa-free-countries"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "医疗发展中，复杂手术建议土耳其",
          "en": "Healthcare developing"
        },
        "src": "https://www.who.int/georgia"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing $45/月必备",
          "en": "SafetyWing $45/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://travel.state.gov"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "葡萄酒发源地，热情",
          "en": "Wine origin, warm"
        },
        "src": "https://georgia.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 4,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor",
        "music"
      ],
      "venues": [
        {
          "emoji": "⛰️",
          "name_zh": "高加索山脉徒步 (Kazbegi)",
          "name_en": "Caucasus Hiking (Kazbegi)",
          "area_zh": "北部",
          "area_en": "North",
          "price": "€20-50/日",
          "tags": [
            "徒步",
            "世界级"
          ],
          "src": ""
        },
        {
          "emoji": "🍷",
          "name_zh": "格鲁吉亚葡萄酒品鉴",
          "name_en": "Georgian Wine Tasting",
          "area_zh": "Kakheti/Tbilisi",
          "area_en": "Kakheti/Tbilisi",
          "price": "€10-30",
          "tags": [
            "葡萄酒发源地"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Bassiani 地下夜店",
          "name_en": "Bassiani Underground Club",
          "area_zh": "Saburtalo",
          "area_en": "Saburtalo",
          "price": "€10-15",
          "tags": [
            "Techno",
            "世界知名"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Khinkali 饺子 + Khachapuri",
          "name_en": "Khinkali + Khachapuri",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "€3-8/餐",
          "tags": [
            "格鲁吉亚菜"
          ],
          "src": ""
        },
        {
          "emoji": "♨️",
          "name_zh": "Abanotubani 硫磺温泉",
          "name_en": "Abanotubani Sulphur Baths",
          "area_zh": "老城",
          "area_en": "Old Town",
          "price": "€10-30",
          "tags": [
            "温泉",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "Fabrika 创意园 + 街艺",
          "name_en": "Fabrika + Street Art",
          "area_zh": "Marjanishvili",
          "area_en": "Marjanishvili",
          "price": "免费",
          "tags": [
            "创意",
            "街艺"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择有限但 BSG/QSI 可用，365 天免签全家适合短期试住。",
        "en": "Limited intl options but BSG/QSI exist, 365-day visa-free great for trial."
      },
      "schools": [
        {
          "zh_name": "British School Tbilisi",
          "en_name": "BST",
          "type": "intl_top",
          "price": "$10k-15k/年",
          "src": ""
        },
        {
          "zh_name": "QSI Tbilisi",
          "en_name": "QSI",
          "type": "intl_ib",
          "price": "$8k-12k/年",
          "src": ""
        },
        {
          "zh_name": "格鲁吉亚公立学校",
          "en_name": "Georgian public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 500
  },
  {
    "id": "budapest",
    "name": {
      "zh": "布达佩斯",
      "en": "Budapest"
    },
    "country": {
      "zh": "匈牙利",
      "en": "Hungary"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 47.5,
    "lng": 19.05,
    "sub": {
      "zh": "多瑙河之都·中欧性价比",
      "en": "Danube capital·Central EU value"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,500 接近上限",
        "regular": "中欧最佳",
        "fat": "成本偏低",
        "barista": "中欧商业",
        "coast": "$1,500 勉强够"
      },
      "en": {
        "lean": "$1,500 near limit",
        "regular": "Best Central EU",
        "fat": "Low cost",
        "barista": "Central EU biz",
        "coast": "$1,500 marginal"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Budapest"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.ingatlan.com"
      },
      {
        "key": "Food",
        "val": "$320",
        "src": "https://www.numbeo.com/cost-of-living/in/Budapest"
      },
      {
        "key": "Transit",
        "val": "$70",
        "src": "https://bkk.hu/en"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Budapest"
      },
      {
        "key": "Health",
        "val": "$180",
        "src": "https://www.medicover.hu"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "温泉浴场日常消遣",
          "en": "Thermal baths daily"
        },
        "src": "https://www.szechenyibath.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "申根免签 90 天",
          "en": "Schengen 90d"
        },
        "d": {
          "zh": "短期",
          "en": "Short"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://ec.europa.eu"
      },
      {
        "t": {
          "zh": "GRSP 居留签",
          "en": "GRSP"
        },
        "d": {
          "zh": "投资 $250k 10 年",
          "en": "Invest $250k 10yr"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.gov.hu"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "私立 Medicover 英语完善",
          "en": "Private Medicover English"
        },
        "src": "https://www.medicover.hu"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Cigna/AXA $80-150/月",
          "en": "Cigna/AXA $80-150/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "整体安全",
          "en": "Overall safe"
        },
        "src": "https://www.numbeo.com/crime/in/Budapest"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "匈牙利语极难",
          "en": "Hungarian language hard"
        },
        "src": "https://ef.com/epi"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 4,
        "art": 4,
        "music": 4,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "performance"
      ],
      "venues": [
        {
          "emoji": "♨️",
          "name_zh": "Széchenyi 温泉浴场",
          "name_en": "Széchenyi Thermal Baths",
          "area_zh": "市中心",
          "area_en": "City Park",
          "price": "€20-25",
          "tags": [
            "温泉",
            "地标"
          ],
          "src": "https://www.szechenyibath.com"
        },
        {
          "emoji": "🎭",
          "name_zh": "匈牙利国家歌剧院",
          "name_en": "Hungarian State Opera",
          "area_zh": "Andrássy",
          "area_en": "Andrássy",
          "price": "€10-80",
          "tags": [
            "歌剧",
            "顶级"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "匈牙利国家美术馆 + 民族博物馆",
          "name_en": "National Gallery + Ethnographic",
          "area_zh": "Buda Castle",
          "area_en": "Buda Castle",
          "price": "€8-15",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Central Market + 古拉什汤",
          "name_en": "Central Market + Goulash",
          "area_zh": "市中心",
          "area_en": "Centro",
          "price": "€5-12/餐",
          "tags": [
            "市场",
            "本地"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Szimpla Kert 废墟酒吧",
          "name_en": "Szimpla Kert Ruin Bar",
          "area_zh": "Erzsébetváros",
          "area_en": "Erzsébetváros",
          "price": "€3-8/杯",
          "tags": [
            "夜生活",
            "废墟"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Margit-sziget 玛格丽特岛",
          "name_en": "Margaret Island",
          "area_zh": "多瑙河",
          "area_en": "Danube",
          "price": "免费",
          "tags": [
            "公园",
            "跑步"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校选择多（AISB、BISB），中欧文化氛围适合家庭。",
        "en": "Many intl schools (AISB, BISB), Central EU culture good for families."
      },
      "schools": [
        {
          "zh_name": "American Intl School (AISB)",
          "en_name": "AISB",
          "type": "intl_top",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "British Intl School (BISB)",
          "en_name": "BISB",
          "type": "intl_ib",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "匈牙利公立学校",
          "en_name": "Hungarian public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1100
  },
  {
    "id": "prague",
    "name": {
      "zh": "布拉格",
      "en": "Prague"
    },
    "country": {
      "zh": "捷克",
      "en": "Czechia"
    },
    "region": {
      "zh": "欧洲",
      "en": "Europe"
    },
    "lat": 50.08,
    "lng": 14.44,
    "sub": {
      "zh": "百塔之城·中欧文化中心",
      "en": "City of spires·Central EU culture"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,700 边缘",
        "regular": "中欧最佳之一",
        "fat": "成本偏低",
        "barista": "自由职业签",
        "coast": "被动 $1,700+"
      },
      "en": {
        "lean": "$1,700 borderline",
        "regular": "Top Central EU",
        "fat": "Low cost",
        "barista": "Freelance visa",
        "coast": "Passive $1,700+"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,700",
        "src": "https://www.numbeo.com/cost-of-living/in/Prague"
      },
      {
        "key": "Housing",
        "val": "$800",
        "src": "https://www.sreality.cz"
      },
      {
        "key": "Food",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Prague"
      },
      {
        "key": "Transit",
        "val": "$50",
        "src": "https://www.dpp.cz/en"
      },
      {
        "key": "Leisure",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Prague"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.vzp.cz"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Zivnostensky list 自由职业签易获",
          "en": "Zivno freelance visa easy"
        },
        "src": "https://www.mvcr.cz/mvcren"
      },
      {
        "t": {
          "zh": "啤酒比水便宜（真的）",
          "en": "Beer cheaper than water (really)"
        },
        "src": "https://www.czechtourism.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "自由职业签（Zivno）",
          "en": "Freelance (Zivno)"
        },
        "d": {
          "zh": "需收入和注册",
          "en": "Income & reg"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.mvcr.cz"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "VZP 公立医保 $200/月",
          "en": "VZP public $200/mo"
        },
        "src": "https://www.vzp.cz"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "私立补充 $80-150/月",
          "en": "Private suppl $80-150/mo"
        },
        "src": "https://www.cigna.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "非常安全",
          "en": "Very safe"
        },
        "src": "https://www.numbeo.com/crime/in/Prague"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "中欧文化十字路口",
          "en": "Central EU crossroads"
        },
        "src": "https://www.prague.eu"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 4,
        "art": 4,
        "music": 4,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "performance"
      ],
      "venues": [
        {
          "emoji": "🎭",
          "name_zh": "国家剧院 + Estates Theatre (莫扎特)",
          "name_en": "National + Estates Theatre",
          "area_zh": "市中心",
          "area_en": "Centro",
          "price": "€15-80",
          "tags": [
            "歌剧",
            "莫扎特"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "国家美术馆 + DOX 当代",
          "name_en": "National Gallery + DOX",
          "area_zh": "市内",
          "area_en": "Citywide",
          "price": "€8-12",
          "tags": [
            "艺术"
          ],
          "src": ""
        },
        {
          "emoji": "🍺",
          "name_zh": "啤酒酒吧 (U Fleku 自 1499)",
          "name_en": "Beer Halls (U Fleku since 1499)",
          "area_zh": "Nové Město",
          "area_en": "Nové Město",
          "price": "€3-5/杯",
          "tags": [
            "啤酒",
            "传统"
          ],
          "src": ""
        },
        {
          "emoji": "⛪",
          "name_zh": "Prague Castle + Charles Bridge",
          "name_en": "Prague Castle + Charles Bridge",
          "area_zh": "Hradčany",
          "area_en": "Hradčany",
          "price": "€10-15",
          "tags": [
            "历史地标"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Karlin / Beruna",
          "name_en": "Yoga Karlin / Beruna",
          "area_zh": "Karlín",
          "area_en": "Karlín",
          "price": "€12-18/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Jazz Dock 河上爵士",
          "name_en": "Jazz Dock Floating Jazz",
          "area_zh": "Smíchov",
          "area_en": "Smíchov",
          "price": "€10-15",
          "tags": [
            "爵士",
            "河景"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校充足（PBIS、ISP），Zivno 签证家属程序需独立办理。",
        "en": "Plenty intl schools (PBIS, ISP), Zivno visa family must apply separately."
      },
      "schools": [
        {
          "zh_name": "Prague British School (PBIS)",
          "en_name": "PBIS",
          "type": "intl_top",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "Intl School Prague (ISP)",
          "en_name": "ISP",
          "type": "intl_ib",
          "price": "$20k-28k/年",
          "src": ""
        },
        {
          "zh_name": "捷克公立学校",
          "en_name": "Czech public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "merida",
    "name": {
      "zh": "梅里达",
      "en": "Mérida"
    },
    "country": {
      "zh": "墨西哥",
      "en": "Mexico"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": 20.97,
    "lng": -89.62,
    "sub": {
      "zh": "北美 FIRE 首选·最安全墨西哥",
      "en": "NA FIRE top pick·Safest Mexico"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,300 接近上限",
        "regular": "Regular FIRE 完美",
        "fat": "成本偏低",
        "barista": "距美加近时区好",
        "coast": "$1,300 被动即可"
      },
      "en": {
        "lean": "$1,300 near limit",
        "regular": "Perfect Regular FIRE",
        "fat": "Low cost",
        "barista": "Close to US/CA, good TZ",
        "coast": "$1,300 passive enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,300",
        "src": "https://www.numbeo.com/cost-of-living/in/Merida"
      },
      {
        "key": "Housing",
        "val": "$500",
        "src": "https://www.inmuebles24.com"
      },
      {
        "key": "Food",
        "val": "$300",
        "src": "https://www.numbeo.com/cost-of-living/in/Merida"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.uber.com/mx"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Merida"
      },
      {
        "key": "Health",
        "val": "$150",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "墨西哥最安全城市",
          "en": "Safest in Mexico"
        },
        "src": "https://mexiconewsdaily.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "临时居留签",
          "en": "Temporary Residence"
        },
        "d": {
          "zh": "月 $1,620+ 或资产 $27k+",
          "en": "$1,620+/mo or $27k+ assets"
        },
        "cl": "green",
        "l": {
          "zh": "✓ FIRE",
          "en": "✓ FIRE"
        },
        "src": "https://www.inm.gob.mx"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Star Medica 英语服务",
          "en": "Star Medica English"
        },
        "src": "https://www.starmedica.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing $45-150/月",
          "en": "SafetyWing $45-150/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "墨西哥治安最佳",
          "en": "Best Mexico safety"
        },
        "src": "https://www.numbeo.com/crime/in/Merida"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "玛雅文化底蕴",
          "en": "Mayan heritage"
        },
        "src": "https://www.yucatan.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 3,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 4
      },
      "greenStars": [
        "yoga"
      ],
      "venues": [
        {
          "emoji": "🧘",
          "name_zh": "Yoga Studios (Mérida Yoga)",
          "name_en": "Mérida Yoga Studios",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$10-15/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🏛️",
          "name_zh": "Chichén Itzá 玛雅遗址",
          "name_en": "Chichén Itzá Maya Ruins",
          "area_zh": "郊外",
          "area_en": "Outskirts",
          "price": "$30",
          "tags": [
            "玛雅",
            "世遗"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Cochinita Pibil + Mercado",
          "name_en": "Cochinita Pibil + Mercado",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$3-8/餐",
          "tags": [
            "尤卡坦菜"
          ],
          "src": ""
        },
        {
          "emoji": "🌊",
          "name_zh": "Cenotes 天然井游泳",
          "name_en": "Cenote Swimming",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "$10-25",
          "tags": [
            "天然井",
            "户外"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "Macay 当代美术馆",
          "name_en": "Macay Contemporary Museum",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "免费",
          "tags": [
            "艺术",
            "免费"
          ],
          "src": ""
        },
        {
          "emoji": "🏖️",
          "name_zh": "Progreso 海滩 1 小时",
          "name_en": "Progreso Beach 1hr",
          "area_zh": "郊外",
          "area_en": "Coast",
          "price": "$10 公车",
          "tags": [
            "海滩"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "墨西哥最安全城市，临时居留签全家，国际学校少但 ASM 不错。",
        "en": "Safest Mexican city, residency visa for family, few intl schools but ASM ok."
      },
      "schools": [
        {
          "zh_name": "American School Mérida",
          "en_name": "ASM",
          "type": "intl_top",
          "price": "$10k-15k/年",
          "src": ""
        },
        {
          "zh_name": "墨西哥公立学校",
          "en_name": "Mexican public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 600
  },
  {
    "id": "mexico_city",
    "name": {
      "zh": "墨西哥城",
      "en": "Mexico City"
    },
    "country": {
      "zh": "墨西哥",
      "en": "Mexico"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": 19.43,
    "lng": -99.13,
    "sub": {
      "zh": "美洲文化大都会·数字游民热点",
      "en": "Americas cultural metro·Nomad hotspot"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,600 边缘",
        "regular": "完美都市",
        "fat": "精致拉美",
        "barista": "美东时区",
        "coast": "$1,600 舒适"
      },
      "en": {
        "lean": "$1,600 borderline",
        "regular": "Perfect metro",
        "fat": "Refined LatAm",
        "barista": "East US TZ",
        "coast": "$1,600 comfortable"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,600",
        "src": "https://www.numbeo.com/cost-of-living/in/Mexico-City"
      },
      {
        "key": "Housing",
        "val": "$750",
        "src": "https://www.inmuebles24.com"
      },
      {
        "key": "Food",
        "val": "$320",
        "src": "https://www.numbeo.com/cost-of-living/in/Mexico-City"
      },
      {
        "key": "Transit",
        "val": "$80",
        "src": "https://www.metro.cdmx.gob.mx"
      },
      {
        "key": "Leisure",
        "val": "$250",
        "src": "https://www.numbeo.com/cost-of-living/in/Mexico-City"
      },
      {
        "key": "Health",
        "val": "$150",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Roma/Condesa 数字游民聚集",
          "en": "Roma/Condesa nomads"
        },
        "src": "https://nomadlist.com/mexico-city"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "临时居留签",
          "en": "Temp Residence"
        },
        "d": {
          "zh": "同墨西哥",
          "en": "Same as Mexico"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.inm.gob.mx"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "ABC Medical Center 国际",
          "en": "ABC Medical intl"
        },
        "src": "https://www.abchospital.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing/AXA $45-200/月",
          "en": "SafetyWing/AXA $45-200/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "游客区安全",
          "en": "Tourist areas safe"
        },
        "src": "https://www.numbeo.com/crime/in/Mexico-City"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "博物馆密度世界第一",
          "en": "World's densest museums"
        },
        "src": "https://www.cdmxtravel.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 5,
        "music": 4,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "art",
        "food"
      ],
      "venues": [
        {
          "emoji": "🎨",
          "name_zh": "Frida Kahlo 故居 + 国家人类学馆",
          "name_en": "Frida Kahlo + Nat'l Anthropology",
          "area_zh": "Coyoacán/Chapultepec",
          "area_en": "Coyoacán/Chapultepec",
          "price": "$8-15",
          "tags": [
            "艺术",
            "玛雅文化"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Pujol / Quintonil / Tacos",
          "name_en": "Pujol / Quintonil / Tacos",
          "area_zh": "Polanco/Roma",
          "area_en": "Polanco/Roma",
          "price": "$3-200/餐",
          "tags": [
            "米其林",
            "墨西哥菜"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Palacio de Bellas Artes",
          "name_en": "Palacio de Bellas Artes",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$5-30",
          "tags": [
            "剧院",
            "壁画"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Vajra Yoga / Sivananda",
          "name_en": "Vajra Yoga / Sivananda",
          "area_zh": "Roma/Condesa",
          "area_en": "Roma/Condesa",
          "price": "$12-18/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Mariachi @ Plaza Garibaldi",
          "name_en": "Mariachi @ Plaza Garibaldi",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$5-15",
          "tags": [
            "传统音乐"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Chapultepec 公园 + 特奥蒂瓦坎",
          "name_en": "Chapultepec + Teotihuacán",
          "area_zh": "市内/郊外",
          "area_en": "City/Outskirts",
          "price": "免费 / $10",
          "tags": [
            "公园",
            "金字塔"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校丰富（ASF、Colegio Eton），文化中心 + 安全区域（Polanco/Roma）。",
        "en": "Many intl schools (ASF, Eton), cultural hub + safe areas (Polanco/Roma)."
      },
      "schools": [
        {
          "zh_name": "American School Foundation (ASF)",
          "en_name": "ASF",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "Colegio Eton",
          "en_name": "Colegio Eton",
          "type": "intl_ib",
          "price": "$12k-18k/年",
          "src": ""
        },
        {
          "zh_name": "墨西哥公立学校",
          "en_name": "Mexican public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 900
  },
  {
    "id": "medellin",
    "name": {
      "zh": "麦德林",
      "en": "Medellín"
    },
    "country": {
      "zh": "哥伦比亚",
      "en": "Colombia"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": 6.25,
    "lng": -75.57,
    "sub": {
      "zh": "永恒之春之城·退休签门槛极低",
      "en": "Eternal spring·Very low retirement bar"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "退休签月 $1,000+ 即可",
        "regular": "绰绰有余气候完美",
        "fat": "成本低",
        "barista": "门槛低 + 完美时区",
        "coast": "退休签永久"
      },
      "en": {
        "lean": "Retirement visa $1,000+/mo",
        "regular": "Plenty, perfect climate",
        "fat": "Low cost",
        "barista": "Low bar + great TZ",
        "coast": "Permanent retire visa"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,200",
        "src": "https://www.numbeo.com/cost-of-living/in/Medellin"
      },
      {
        "key": "Housing",
        "val": "$450",
        "src": "https://www.fincaraiz.com.co"
      },
      {
        "key": "Food",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Medellin"
      },
      {
        "key": "Transit",
        "val": "$70",
        "src": "https://www.metrodemedellin.gov.co"
      },
      {
        "key": "Leisure",
        "val": "$200",
        "src": "https://www.numbeo.com/cost-of-living/in/Medellin"
      },
      {
        "key": "Health",
        "val": "$150",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "全年气候 22-26°C",
          "en": "22-26°C year-round"
        },
        "src": "https://en.wikipedia.org/wiki/Medell%C3%ADn#Climate"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "退休签 Pensionado",
          "en": "Pensionado"
        },
        "d": {
          "zh": "月被动 $1,000+（2026 三倍最低工资）",
          "en": "$1,000+/mo passive (2026)"
        },
        "cl": "green",
        "l": {
          "zh": "✓ FIRE 设计",
          "en": "✓ FIRE"
        },
        "src": "https://www.cancilleria.gov.co"
      },
      {
        "t": {
          "zh": "数字游民签 DNV",
          "en": "DNV"
        },
        "d": {
          "zh": "月 $1,000+ 最长 2 年",
          "en": "$1,000+/mo, 2yr"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.migracioncolombia.gov.co"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Clinica las Vegas 世界级",
          "en": "Clinica las Vegas world-class"
        },
        "src": "https://www.clinicalasvegasmed.com"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing/Cigna $45-150/月",
          "en": "SafetyWing/Cigna $45-150/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "El Poblado 安全",
          "en": "El Poblado safe"
        },
        "src": "https://travel.state.gov"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "Salsa 日常社交",
          "en": "Salsa daily social"
        },
        "src": "https://www.colombia.co"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 3,
        "art": 3,
        "music": 5,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "music",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "💃",
          "name_zh": "Salsa 课 + Son Havana 舞厅",
          "name_en": "Salsa Classes + Son Havana",
          "area_zh": "El Poblado",
          "area_en": "El Poblado",
          "price": "$10-15/课",
          "tags": [
            "Salsa",
            "舞蹈"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Guatapé 周末游 + 攀岩",
          "name_en": "Guatapé Weekend + Rock Climb",
          "area_zh": "郊区",
          "area_en": "Outskirts",
          "price": "$30-50",
          "tags": [
            "攀岩",
            "湖光"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Vida / Bhakti",
          "name_en": "Yoga Vida / Bhakti",
          "area_zh": "El Poblado",
          "area_en": "El Poblado",
          "price": "$8-12/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "Comuna 13 街艺 Tour",
          "name_en": "Comuna 13 Street Art Tour",
          "area_zh": "Comuna 13",
          "area_en": "Comuna 13",
          "price": "$15-25",
          "tags": [
            "街艺",
            "故事"
          ],
          "src": ""
        },
        {
          "emoji": "☕",
          "name_zh": "Pergamino 咖啡 + 农庄游",
          "name_en": "Pergamino Coffee + Farm Tour",
          "area_zh": "El Poblado/郊区",
          "area_en": "El Poblado",
          "price": "$5-50",
          "tags": [
            "咖啡",
            "原产地"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Reggaeton + Club El Patio",
          "name_en": "Reggaeton + Club El Patio",
          "area_zh": "El Poblado",
          "area_en": "El Poblado",
          "price": "$15-25",
          "tags": [
            "夜生活"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "低成本 Pensionado 签证全家覆盖，El Poblado 区国际学校优质（TCS）。",
        "en": "Low-cost Pensionado covers family, El Poblado area has good intl schools (TCS)."
      },
      "schools": [
        {
          "zh_name": "The Columbus School (TCS)",
          "en_name": "TCS",
          "type": "intl_top",
          "price": "$12k-18k/年",
          "src": ""
        },
        {
          "zh_name": "Colombian public schools",
          "en_name": "Colombian public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 700
  },
  {
    "id": "buenos_aires",
    "name": {
      "zh": "布宜诺斯艾利斯",
      "en": "Buenos Aires"
    },
    "country": {
      "zh": "阿根廷",
      "en": "Argentina"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": -34.6,
    "lng": -58.38,
    "sub": {
      "zh": "南美巴黎·文化艺术之都",
      "en": "Paris of South America·Arts capital"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "ok"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,900 接近上限",
        "regular": "高品质生活",
        "fat": "经济不稳定是风险",
        "barista": "创意半退休",
        "coast": "经济波动需注意"
      },
      "en": {
        "lean": "$1,900 near limit",
        "regular": "High quality life",
        "fat": "Econ instability risk",
        "barista": "Creative semi-retire",
        "coast": "Watch volatility"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,900",
        "src": "https://www.numbeo.com/cost-of-living/in/Buenos-Aires"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.zonaprop.com.ar"
      },
      {
        "key": "Food",
        "val": "$400",
        "src": "https://www.numbeo.com/cost-of-living/in/Buenos-Aires"
      },
      {
        "key": "Transit",
        "val": "$50",
        "src": "https://www.buenosaires.gob.ar"
      },
      {
        "key": "Leisure",
        "val": "$280",
        "src": "https://www.numbeo.com/cost-of-living/in/Buenos-Aires"
      },
      {
        "key": "Health",
        "val": "$150",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Palermo/San Telmo 外国人区",
          "en": "Palermo/San Telmo expat areas"
        },
        "src": "https://nomadlist.com/buenos-aires"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签 90 天",
          "en": "Tourist 90d"
        },
        "d": {
          "zh": "可延共 180",
          "en": "Ext 180"
        },
        "cl": "green",
        "l": {
          "zh": "✓",
          "en": "✓"
        },
        "src": "https://www.migraciones.gov.ar"
      },
      {
        "t": {
          "zh": "退休签",
          "en": "Retirement"
        },
        "d": {
          "zh": "月 $1,200+，经济波动",
          "en": "$1,200+/mo, volatility"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.migraciones.gov.ar"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "公立免费，私立 CEMIC",
          "en": "Public free, private CEMIC"
        },
        "src": "https://www.cemic.edu.ar"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "国际医保推荐",
          "en": "Intl insurance recommended"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "Uber 较安全",
          "en": "Uber safer"
        },
        "src": "https://www.numbeo.com/crime/in/Buenos-Aires"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "探戈咖啡馆文化",
          "en": "Tango cafe culture"
        },
        "src": "https://whc.unesco.org"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 5,
        "art": 4,
        "music": 5,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "performance",
        "music",
        "food"
      ],
      "venues": [
        {
          "emoji": "💃",
          "name_zh": "探戈 @ La Catedral / Milonga",
          "name_en": "Tango @ La Catedral / Milongas",
          "area_zh": "Almagro/全市",
          "area_en": "Almagro/Citywide",
          "price": "$10-30",
          "tags": [
            "探戈",
            "夜场"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Teatro Colón 歌剧院",
          "name_en": "Teatro Colón Opera House",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$10-100",
          "tags": [
            "歌剧",
            "世界级"
          ],
          "src": "https://teatrocolon.org.ar"
        },
        {
          "emoji": "🥩",
          "name_zh": "阿根廷烤肉 (Don Julio)",
          "name_en": "Argentine Asado (Don Julio)",
          "area_zh": "Palermo",
          "area_en": "Palermo",
          "price": "$25-50/人",
          "tags": [
            "牛排",
            "顶级"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "MALBA + Recoleta 墓园",
          "name_en": "MALBA + Recoleta Cemetery",
          "area_zh": "Palermo/Recoleta",
          "area_en": "Palermo/Recoleta",
          "price": "$8-15",
          "tags": [
            "拉美艺术"
          ],
          "src": ""
        },
        {
          "emoji": "📚",
          "name_zh": "El Ateneo Grand Splendid 书店",
          "name_en": "El Ateneo Bookstore",
          "area_zh": "Recoleta",
          "area_en": "Recoleta",
          "price": "免费",
          "tags": [
            "书店",
            "全球最美"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Buenos Aires / Mandala",
          "name_en": "Yoga BA / Mandala",
          "area_zh": "Palermo",
          "area_en": "Palermo",
          "price": "$10-15/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校多（Lincoln、Asociación），但阿根廷经济波动需谨慎。",
        "en": "Many intl schools (Lincoln, Asociación), but volatile economy needs caution."
      },
      "schools": [
        {
          "zh_name": "Lincoln School",
          "en_name": "Lincoln",
          "type": "intl_top",
          "price": "$10k-15k/年",
          "src": ""
        },
        {
          "zh_name": "Asociación Escuelas Lincoln",
          "en_name": "Asociación Lincoln",
          "type": "intl_ib",
          "price": "$8k-12k/年",
          "src": ""
        },
        {
          "zh_name": "阿根廷公立学校",
          "en_name": "Argentine public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 600
  },
  {
    "id": "santiago",
    "name": {
      "zh": "圣地亚哥",
      "en": "Santiago"
    },
    "country": {
      "zh": "智利",
      "en": "Chile"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": -33.45,
    "lng": -70.66,
    "sub": {
      "zh": "安第斯山下·拉美最安全首都",
      "en": "Below Andes·Safest LatAm capital"
    },
    "fit": {
      "lean": "ok",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,500 边缘",
        "regular": "拉美最佳",
        "fat": "精致山城",
        "barista": "基础设施好",
        "coast": "$1,500 即可"
      },
      "en": {
        "lean": "$1,500 borderline",
        "regular": "Best LatAm",
        "fat": "Refined mountain",
        "barista": "Good infrastructure",
        "coast": "$1,500 enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,500",
        "src": "https://www.numbeo.com/cost-of-living/in/Santiago"
      },
      {
        "key": "Housing",
        "val": "$650",
        "src": "https://www.portalinmobiliario.com"
      },
      {
        "key": "Food",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/Santiago"
      },
      {
        "key": "Transit",
        "val": "$70",
        "src": "https://www.metro.cl"
      },
      {
        "key": "Leisure",
        "val": "$250",
        "src": "https://www.numbeo.com/cost-of-living/in/Santiago"
      },
      {
        "key": "Health",
        "val": "$180",
        "src": "https://www.fonasa.cl"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "距安第斯滑雪场 1 小时",
          "en": "Andes ski 1hr away"
        },
        "src": "https://chile.travel"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "临时居留签",
          "en": "Temp Residence"
        },
        "d": {
          "zh": "需收入证明",
          "en": "Income proof"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.serviciomigraciones.cl"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Clinica Las Condes 拉美顶尖",
          "en": "Las Condes top LatAm"
        },
        "src": "https://www.clinicalascondes.cl"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing/Cigna $45-200/月",
          "en": "SafetyWing/Cigna $45-200/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "拉美最安全首都",
          "en": "Safest LatAm capital"
        },
        "src": "https://www.numbeo.com/crime/in/Santiago-de-Chile"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "葡萄酒海鲜文化",
          "en": "Wine seafood culture"
        },
        "src": "https://chile.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 3,
        "music": 3,
        "food": 4,
        "outdoor": 5
      },
      "greenStars": [
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "⛷️",
          "name_zh": "Valle Nevado 滑雪 (1 小时)",
          "name_en": "Valle Nevado Ski (1hr)",
          "area_zh": "Andes",
          "area_en": "Andes",
          "price": "$40-80/天",
          "tags": [
            "滑雪",
            "安第斯"
          ],
          "src": ""
        },
        {
          "emoji": "🍷",
          "name_zh": "Casablanca 葡萄酒谷",
          "name_en": "Casablanca Wine Valley",
          "area_zh": "郊外 1.5 小时",
          "area_en": "1.5h Outskirts",
          "price": "$50-100/日",
          "tags": [
            "葡萄酒",
            "酒庄"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Teatro Municipal de Santiago",
          "name_en": "Teatro Municipal",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$15-80",
          "tags": [
            "歌剧",
            "古典"
          ],
          "src": ""
        },
        {
          "emoji": "🍳",
          "name_zh": "Mercado Central 海鲜",
          "name_en": "Mercado Central Seafood",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$15-30/餐",
          "tags": [
            "海鲜"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Yoga Studios (Las Condes)",
          "name_en": "Yoga Studios (Las Condes)",
          "area_zh": "Las Condes",
          "area_en": "Las Condes",
          "price": "$12-18/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Cerro San Cristóbal 缆车",
          "name_en": "Cerro San Cristóbal Funicular",
          "area_zh": "Centro",
          "area_en": "Centro",
          "price": "$5",
          "tags": [
            "全城景"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "拉美最安全首都，国际学校选择多（NIDO、Lincoln），适合家庭。",
        "en": "Safest LatAm capital, many intl schools (NIDO, Lincoln), family-friendly."
      },
      "schools": [
        {
          "zh_name": "Nido de Aguilas",
          "en_name": "NIDO",
          "type": "intl_top",
          "price": "$18k-25k/年",
          "src": ""
        },
        {
          "zh_name": "Lincoln Intl Academy",
          "en_name": "Lincoln Intl",
          "type": "intl_ib",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "智利公立学校",
          "en_name": "Chilean public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 900
  },
  {
    "id": "lima",
    "name": {
      "zh": "利马",
      "en": "Lima"
    },
    "country": {
      "zh": "秘鲁",
      "en": "Peru"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": -12.05,
    "lng": -77.04,
    "sub": {
      "zh": "美食之都·太平洋海岸",
      "en": "Food capital·Pacific coast"
    },
    "fit": {
      "lean": "great",
      "regular": "great",
      "fat": "ok",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$1,000 完美",
        "regular": "美食世界级",
        "fat": "成本偏低",
        "barista": "基础设施完善",
        "coast": "$1,000 即可"
      },
      "en": {
        "lean": "$1,000 perfect",
        "regular": "World-class food",
        "fat": "Low cost",
        "barista": "Good infrastructure",
        "coast": "$1,000 enough"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$1,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Lima"
      },
      {
        "key": "Housing",
        "val": "$400",
        "src": "https://urbania.pe"
      },
      {
        "key": "Food",
        "val": "$220",
        "src": "https://www.numbeo.com/cost-of-living/in/Lima"
      },
      {
        "key": "Transit",
        "val": "$60",
        "src": "https://www.uber.com/pe"
      },
      {
        "key": "Leisure",
        "val": "$180",
        "src": "https://www.numbeo.com/cost-of-living/in/Lima"
      },
      {
        "key": "Health",
        "val": "$140",
        "src": "https://safetywing.com"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Miraflores 海岸首选",
          "en": "Miraflores top"
        },
        "src": "https://nomadlist.com/lima"
      },
      {
        "t": {
          "zh": "Central 餐厅全球第一",
          "en": "Central restaurant world #1"
        },
        "src": "https://www.theworlds50best.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "旅游签免签 183 天",
          "en": "Tourist 183d"
        },
        "d": {
          "zh": "可延",
          "en": "Extendable"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 长免签",
          "en": "✓ Long free"
        },
        "src": "https://www.gob.pe/migraciones"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Clinica Anglo Americana",
          "en": "Clinica Anglo Americana"
        },
        "src": "https://www.clinicaangloamericana.pe"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "SafetyWing $45/月",
          "en": "SafetyWing $45/mo"
        },
        "src": "https://safetywing.com"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "Miraflores 安全",
          "en": "Miraflores safe"
        },
        "src": "https://www.numbeo.com/crime/in/Lima"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "印加 + 美食圣地",
          "en": "Inca + food mecca"
        },
        "src": "https://www.peru.travel"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 3,
        "performance": 3,
        "art": 3,
        "music": 4,
        "food": 5,
        "outdoor": 4
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "Central / Maido (世界 50 佳)",
          "name_en": "Central / Maido (World 50 Best)",
          "area_zh": "Miraflores/Barranco",
          "area_en": "Miraflores/Barranco",
          "price": "$100-200/人",
          "tags": [
            "米其林",
            "全球前列"
          ],
          "src": "https://www.theworlds50best.com"
        },
        {
          "emoji": "🌊",
          "name_zh": "Miraflores 海岸冲浪",
          "name_en": "Miraflores Coastal Surf",
          "area_zh": "Miraflores",
          "area_en": "Miraflores",
          "price": "$30-40/课",
          "tags": [
            "冲浪"
          ],
          "src": ""
        },
        {
          "emoji": "🎨",
          "name_zh": "MALI 美术馆 + Larco 博物馆",
          "name_en": "MALI + Larco Museum",
          "area_zh": "Centro/Pueblo Libre",
          "area_en": "Centro",
          "price": "$10",
          "tags": [
            "艺术",
            "考古"
          ],
          "src": ""
        },
        {
          "emoji": "🥘",
          "name_zh": "Ceviche + Surquillo 市场",
          "name_en": "Ceviche + Surquillo Market",
          "area_zh": "Miraflores",
          "area_en": "Miraflores",
          "price": "$5-15/餐",
          "tags": [
            "Ceviche"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "Barranco 现场音乐 + 酒吧",
          "name_en": "Barranco Live Music + Bars",
          "area_zh": "Barranco",
          "area_en": "Barranco",
          "price": "$10-20",
          "tags": [
            "现场音乐",
            "艺术区"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "Sivananda Yoga / Yogi Tribe",
          "name_en": "Sivananda / Yogi Tribe",
          "area_zh": "Miraflores",
          "area_en": "Miraflores",
          "price": "$10-15/次",
          "tags": [
            "瑜伽"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校在 Miraflores/Surco 区集中（FDR、Markham），免签 183 天试住方便。",
        "en": "Intl schools clustered Miraflores/Surco (FDR, Markham), 183-day visa-free for trial."
      },
      "schools": [
        {
          "zh_name": "Colegio Roosevelt (FDR)",
          "en_name": "FDR Lima",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "Markham College",
          "en_name": "Markham",
          "type": "intl_ib",
          "price": "$12k-18k/年",
          "src": ""
        },
        {
          "zh_name": "秘鲁公立学校",
          "en_name": "Peruvian public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "ok",
        "regular": "ok",
        "fat": "poor",
        "barista": "ok",
        "coast": "ok"
      }
    },
    "eduPerKid": 800
  },
  {
    "id": "costa_rica",
    "name": {
      "zh": "圣何塞",
      "en": "San José"
    },
    "country": {
      "zh": "哥斯达黎加",
      "en": "Costa Rica"
    },
    "region": {
      "zh": "拉丁美洲",
      "en": "Latin America"
    },
    "lat": 9.93,
    "lng": -84.09,
    "sub": {
      "zh": "生态天堂·Pura Vida 文化",
      "en": "Eco paradise·Pura Vida culture"
    },
    "fit": {
      "lean": "poor",
      "regular": "great",
      "fat": "great",
      "barista": "great",
      "coast": "great"
    },
    "fitNote": {
      "zh": {
        "lean": "$2,000 超",
        "regular": "完美 Pura Vida",
        "fat": "海岸+雨林精致",
        "barista": "Rentista 签理想",
        "coast": "$1,000 退休签"
      },
      "en": {
        "lean": "$2,000 over",
        "regular": "Perfect Pura Vida",
        "fat": "Coast+rainforest refined",
        "barista": "Rentista visa ideal",
        "coast": "$1,000 retire visa"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$2,000",
        "src": "https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica"
      },
      {
        "key": "Housing",
        "val": "$900",
        "src": "https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica"
      },
      {
        "key": "Food",
        "val": "$450",
        "src": "https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica"
      },
      {
        "key": "Transit",
        "val": "$100",
        "src": "https://www.uber.com"
      },
      {
        "key": "Leisure",
        "val": "$350",
        "src": "https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica"
      },
      {
        "key": "Health",
        "val": "$200",
        "src": "https://www.ccss.sa.cr"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "Pura Vida 国家精神",
          "en": "Pura Vida ethos"
        },
        "src": "https://www.visitcostarica.com"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "退休签 Pensionado",
          "en": "Pensionado"
        },
        "d": {
          "zh": "月 $1,000+ 永久",
          "en": "$1,000+/mo permanent"
        },
        "cl": "green",
        "l": {
          "zh": "✓ 退休",
          "en": "✓ Retire"
        },
        "src": "https://www.migracion.go.cr"
      },
      {
        "t": {
          "zh": "Rentista",
          "en": "Rentista"
        },
        "d": {
          "zh": "月 $2,500+ 或定存 $60k",
          "en": "$2,500+ or $60k"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://www.migracion.go.cr"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "CCSS 中美洲最佳",
          "en": "CCSS best in CA"
        },
        "src": "https://www.ccss.sa.cr"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "CCSS 加入 $80-150/月",
          "en": "CCSS join $80-150/mo"
        },
        "src": "https://www.ccss.sa.cr"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "中美洲最安全",
          "en": "Safest in Central America"
        },
        "src": "https://www.numbeo.com/crime/in/San-Jose-Costa-Rica"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "无常备军环保中立",
          "en": "No army, eco-neutral"
        },
        "src": "https://www.visitcostarica.com"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 5,
        "performance": 2,
        "art": 2,
        "music": 3,
        "food": 3,
        "outdoor": 5
      },
      "greenStars": [
        "yoga",
        "outdoor"
      ],
      "venues": [
        {
          "emoji": "🧘",
          "name_zh": "Nosara 瑜伽圣地 + Pranamar",
          "name_en": "Nosara Yoga + Pranamar",
          "area_zh": "Guanacaste 海岸",
          "area_en": "Guanacaste",
          "price": "$20-30/次",
          "tags": [
            "瑜伽圣地",
            "世界级"
          ],
          "src": ""
        },
        {
          "emoji": "🌳",
          "name_zh": "Manuel Antonio + Arenal 火山",
          "name_en": "Manuel Antonio + Arenal Volcano",
          "area_zh": "国家公园",
          "area_en": "National Parks",
          "price": "$15-25",
          "tags": [
            "雨林",
            "动物"
          ],
          "src": ""
        },
        {
          "emoji": "🏄",
          "name_zh": "Tamarindo / Santa Teresa 冲浪",
          "name_en": "Tamarindo / Santa Teresa Surf",
          "area_zh": "太平洋岸",
          "area_en": "Pacific Coast",
          "price": "$50-100/课",
          "tags": [
            "冲浪",
            "顶级"
          ],
          "src": ""
        },
        {
          "emoji": "☕",
          "name_zh": "咖啡农庄 (Hacienda Alsacia)",
          "name_en": "Coffee Farm Tours",
          "area_zh": "Central Valley",
          "area_en": "Central Valley",
          "price": "$30-50",
          "tags": [
            "咖啡"
          ],
          "src": ""
        },
        {
          "emoji": "🦥",
          "name_zh": "树懒救助中心",
          "name_en": "Sloth Sanctuary",
          "area_zh": "Limón",
          "area_en": "Limón",
          "price": "$25",
          "tags": [
            "树懒",
            "公益"
          ],
          "src": ""
        },
        {
          "emoji": "🌊",
          "name_zh": "Whale + 海龟观察季",
          "name_en": "Whale + Turtle Watching",
          "area_zh": "两岸",
          "area_en": "Both coasts",
          "price": "$60-100",
          "tags": [
            "自然",
            "季节性"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "国际学校多（Country Day、CDS），Pura Vida 文化 + 户外天堂对孩子极佳。",
        "en": "Many intl schools (Country Day, CDS), Pura Vida + outdoor heaven ideal for kids."
      },
      "schools": [
        {
          "zh_name": "Country Day School",
          "en_name": "CDS Costa Rica",
          "type": "intl_top",
          "price": "$15k-22k/年",
          "src": ""
        },
        {
          "zh_name": "European School (CR)",
          "en_name": "European School CR",
          "type": "intl_ib",
          "price": "$12k-18k/年",
          "src": ""
        },
        {
          "zh_name": "哥斯达黎加公立学校",
          "en_name": "Costa Rican public",
          "type": "local",
          "price": "免费",
          "src": ""
        }
      ],
      "fit_override": null
    },
    "eduPerKid": 1200
  },
  {
    "id": "dubai",
    "name": {
      "zh": "迪拜",
      "en": "Dubai"
    },
    "country": {
      "zh": "阿联酋",
      "en": "UAE"
    },
    "region": {
      "zh": "中东",
      "en": "Middle East"
    },
    "lat": 25.2,
    "lng": 55.27,
    "sub": {
      "zh": "零税率天堂·Fat FIRE 首选",
      "en": "Zero-tax haven·Fat FIRE top pick"
    },
    "fit": {
      "lean": "poor",
      "regular": "poor",
      "fat": "great",
      "barista": "ok",
      "coast": "poor"
    },
    "fitNote": {
      "zh": {
        "lean": "远超",
        "regular": "超大部分预算",
        "fat": "零所得税首选",
        "barista": "成本过高",
        "coast": "被动 $4,000+"
      },
      "en": {
        "lean": "Far over",
        "regular": "Over budget",
        "fat": "Zero-tax top",
        "barista": "Costly",
        "coast": "Passive $4,000+"
      }
    },
    "costs": [
      {
        "key": "Monthly",
        "val": "$4,000",
        "src": "https://www.numbeo.com/cost-of-living/in/Dubai"
      },
      {
        "key": "Housing",
        "val": "$2,000",
        "src": "https://www.propertyfinder.ae"
      },
      {
        "key": "Food",
        "val": "$700",
        "src": "https://www.numbeo.com/cost-of-living/in/Dubai"
      },
      {
        "key": "Transit",
        "val": "$200",
        "src": "https://www.rta.ae"
      },
      {
        "key": "Leisure",
        "val": "$600",
        "src": "https://www.numbeo.com/cost-of-living/in/Dubai"
      },
      {
        "key": "Health",
        "val": "$350",
        "src": "https://www.dha.gov.ae"
      }
    ],
    "tips": [
      {
        "t": {
          "zh": "个人所得税为零",
          "en": "Zero personal income tax"
        },
        "src": "https://u.ae/en"
      }
    ],
    "visa": [
      {
        "t": {
          "zh": "虚拟工作签",
          "en": "Virtual Working"
        },
        "d": {
          "zh": "月 $5,000+",
          "en": "$5,000+/mo"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://gdrfad.gov.ae/en/articles/remote-work-visa"
      },
      {
        "t": {
          "zh": "退休签",
          "en": "Retirement"
        },
        "d": {
          "zh": "55+，资产 $545k+",
          "en": "55+, $545k+"
        },
        "cl": "yellow",
        "l": {
          "zh": "⚠",
          "en": "⚠"
        },
        "src": "https://gdrfad.gov.ae"
      }
    ],
    "health": [
      {
        "t": {
          "zh": "Cleveland Clinic 世界级",
          "en": "Cleveland Clinic world-class"
        },
        "src": "https://my.clevelandclinic.ae"
      }
    ],
    "ins": [
      {
        "t": {
          "zh": "Bupa/Daman 高端 $300-600/月",
          "en": "Bupa/Daman premium $300-600/mo"
        },
        "src": "https://www.daman.ae"
      }
    ],
    "safety": [
      {
        "t": {
          "zh": "最安全城市之一",
          "en": "Among safest"
        },
        "src": "https://www.numbeo.com/crime/in/Dubai"
      }
    ],
    "culture": [
      {
        "t": {
          "zh": "伊斯兰文化",
          "en": "Islamic culture"
        },
        "src": "https://u.ae/en"
      }
    ],
    "vibe": {
      "scores": {
        "yoga": 4,
        "performance": 4,
        "art": 4,
        "music": 4,
        "food": 5,
        "outdoor": 3
      },
      "greenStars": [
        "food"
      ],
      "venues": [
        {
          "emoji": "🍳",
          "name_zh": "Nobu / Pierchic / 米其林餐厅群",
          "name_en": "Nobu / Pierchic / Michelin",
          "area_zh": "Marina/Palm",
          "area_en": "Marina/Palm",
          "price": "$100-500/人",
          "tags": [
            "米其林",
            "国际"
          ],
          "src": ""
        },
        {
          "emoji": "🎭",
          "name_zh": "Dubai Opera 歌剧院",
          "name_en": "Dubai Opera",
          "area_zh": "Downtown",
          "area_en": "Downtown",
          "price": "$50-300",
          "tags": [
            "歌剧",
            "顶级"
          ],
          "src": "https://www.dubaiopera.com"
        },
        {
          "emoji": "🎨",
          "name_zh": "Louvre Abu Dhabi (1hr) + Alserkal",
          "name_en": "Louvre Abu Dhabi + Alserkal",
          "area_zh": "AUH/Al Quoz",
          "area_en": "AUH/Al Quoz",
          "price": "$25",
          "tags": [
            "艺术",
            "国际"
          ],
          "src": ""
        },
        {
          "emoji": "🧘",
          "name_zh": "PURE Yoga + Inspire Yoga",
          "name_en": "PURE Yoga + Inspire",
          "area_zh": "DIFC/Marina",
          "area_en": "DIFC/Marina",
          "price": "$25-40/次",
          "tags": [
            "瑜伽顶级"
          ],
          "src": ""
        },
        {
          "emoji": "🏜️",
          "name_zh": "沙漠 Safari + 直升机游",
          "name_en": "Desert Safari + Helicopter",
          "area_zh": "郊外",
          "area_en": "Outskirts",
          "price": "$60-300",
          "tags": [
            "沙漠",
            "户外"
          ],
          "src": ""
        },
        {
          "emoji": "🎵",
          "name_zh": "全球巡演场地 (Coca-Cola Arena 等)",
          "name_en": "Global Tour Venues (Coca-Cola Arena)",
          "area_zh": "Downtown",
          "area_en": "Downtown",
          "price": "$50-500",
          "tags": [
            "演唱会",
            "国际"
          ],
          "src": ""
        }
      ]
    },
    "family": {
      "summary": {
        "zh": "Fat FIRE 家庭天堂——零所得税 + 顶级国际学校（GEMS、JESS）+ 极致安全。需高资产签证。",
        "en": "Fat FIRE family heaven—zero tax + top intl schools (GEMS, JESS) + extreme safety. High-asset visa."
      },
      "schools": [
        {
          "zh_name": "GEMS Wellington Intl",
          "en_name": "GEMS Wellington",
          "type": "intl_top",
          "price": "$22k-32k/年",
          "src": ""
        },
        {
          "zh_name": "JESS Dubai (British)",
          "en_name": "JESS",
          "type": "intl_ib",
          "price": "$18k-28k/年",
          "src": ""
        },
        {
          "zh_name": "本地阿语学校",
          "en_name": "Local Arabic",
          "type": "local",
          "price": "免费 (公民)",
          "src": ""
        }
      ],
      "fit_override": {
        "lean": "poor",
        "regular": "poor",
        "fat": "great",
        "barista": "ok",
        "coast": "poor"
      }
    },
    "eduPerKid": 2000
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseCostUSD(v) {
  // Extract number from strings like "$1,100" or "¥3.0M" etc; fallback returns null
  const m = String(v).match(/[\d,]+\.?\d*/);
  if (!m) return null;
  return parseFloat(m[0].replace(/,/g, ""));
}
function formatCost(v, key, mult) {
  // Returns the adjusted cost string preserving currency symbol
  const num = parseCostUSD(v);
  if (num === null) return v;
  const adjusted = num * (mult[key] || 1);
  // Use original prefix (e.g. "$" or "¥" or "€")
  const prefix = String(v).match(/^[^\d]+/)?.[0] || "$";
  // Round nicely
  const rounded = adjusted >= 1000 ? Math.round(adjusted / 10) * 10 : Math.round(adjusted);
  return prefix + rounded.toLocaleString();
}
function getFamilyFit(city, fireType, hh) {
  // Use familyFit if household has children; otherwise base fit
  const hasChildren = hh === "family3" || hh === "family4";
  if (hasChildren && city.family && city.family.fit_override) {
    return city.family.fit_override[fireType] || city.fit[fireType];
  }
  return city.fit[fireType];
}

export default function App() {
  const [lang, setLang] = useState("zh");
  const [fireType, setFireType] = useState("lean");
  const [household, setHousehold] = useState("single");
  const [hhOpen, setHhOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [followInput, setFollowInput] = useState("");
  const [communityData, setCommunityData] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const labelsRef = useRef({});
  const t = T[lang];
  const mult = MULTIPLIERS[household];
  const hh = HOUSEHOLDS[household];
  const hasChildren = household === "family3" || household === "family4";

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [25, 20], zoom: 2, minZoom: 2, maxZoom: 10,
      zoomControl: true, attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap, © CARTO',
      subdomains: "abcd",
    }).addTo(map);

    leafletMap.current = map;

    CITIES.forEach(city => {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:relative;width:30px;height:30px;cursor:pointer;";
      const glow = document.createElement("div");
      glow.style.cssText = "position:absolute;inset:0;border-radius:50%;transition:all 0.3s ease;";
      const main = document.createElement("div");
      main.style.cssText = "position:absolute;top:50%;left:50%;width:9px;height:9px;border-radius:50%;transform:translate(-50%,-50%);transition:all 0.3s ease;";
      wrapper.appendChild(glow);
      wrapper.appendChild(main);

      const icon = L.divIcon({ html: wrapper, className:"", iconSize:[30,30], iconAnchor:[15,15] });
      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);
      marker.on("click", () => selectCity(city));

      const labelEl = document.createElement("div");
      labelEl.style.cssText = "padding:2px 7px;border-radius:3px;font-size:10px;font-family:'Inter','PingFang SC',sans-serif;font-weight:500;letter-spacing:0.3px;white-space:nowrap;pointer-events:none;transition:all 0.3s ease;backdrop-filter:blur(4px);";
      const labelIcon = L.divIcon({ html: labelEl, className:"", iconSize:[60,16], iconAnchor:[30,28] });
      const labelMarker = L.marker([city.lat, city.lng], { icon: labelIcon, interactive: false, zIndexOffset: -100 }).addTo(map);

      markersRef.current[city.id] = { marker, glow, main };
      labelsRef.current[city.id] = labelEl;
    });

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Update markers/labels by fit/lang/household
  useEffect(() => {
    CITIES.forEach(city => {
      const m = markersRef.current[city.id];
      const labelEl = labelsRef.current[city.id];
      if (!m || !labelEl) return;
      const fitKey = getFamilyFit(city, fireType, household);
      const fit = FIT_CONFIG[fitKey];
      const isSelected = selected?.id === city.id;

      if (fitKey === "great") {
        m.glow.style.background = `radial-gradient(circle, ${fit.color}55 0%, transparent 70%)`;
        m.main.style.background = fit.color;
        m.main.style.border = "none";
        m.main.style.boxShadow = `0 0 8px ${fit.color}99`;
        m.main.style.width = isSelected ? "13px" : "9px";
        m.main.style.height = isSelected ? "13px" : "9px";
        m.main.style.opacity = "1";
        labelEl.style.background = isSelected ? "rgba(14,14,16,0.92)" : "rgba(14,14,16,0.75)";
        labelEl.style.color = isSelected ? "#f5d875" : "#e8e6df";
        labelEl.style.border = isSelected ? "0.5px solid rgba(212,175,55,0.5)" : "0.5px solid rgba(255,255,255,0.08)";
      } else if (fitKey === "ok") {
        m.glow.style.background = `radial-gradient(circle, ${fit.color}33 0%, transparent 70%)`;
        m.main.style.background = fit.color;
        m.main.style.border = "none";
        m.main.style.boxShadow = `0 0 4px ${fit.color}66`;
        m.main.style.opacity = "0.85";
        m.main.style.width = isSelected ? "11px" : "7px";
        m.main.style.height = isSelected ? "11px" : "7px";
        labelEl.style.background = isSelected ? "rgba(14,14,16,0.92)" : "rgba(14,14,16,0.7)";
        labelEl.style.color = isSelected ? "#f5d875" : "#c8d8e8";
        labelEl.style.border = isSelected ? "0.5px solid rgba(212,175,55,0.5)" : "0.5px solid rgba(255,255,255,0.06)";
      } else {
        m.glow.style.background = "transparent";
        m.main.style.background = "transparent";
        m.main.style.border = `1.5px solid ${fit.color}`;
        m.main.style.opacity = "0.6";
        m.main.style.boxShadow = "none";
        m.main.style.width = isSelected ? "10px" : "7px";
        m.main.style.height = isSelected ? "10px" : "7px";
        labelEl.style.background = "rgba(14,14,16,0.55)";
        labelEl.style.color = "#9a9088";
        labelEl.style.border = "0.5px solid rgba(255,255,255,0.04)";
      }

      labelEl.textContent = city.name[lang];
    });
  }, [fireType, selected, lang, household]);

  function selectCity(city) {
    setSelected(city);
    setActiveTab(0);
    setConversation([]);
    setCommunityData(null);
    leafletMap.current?.flyTo([city.lat, city.lng], Math.max(leafletMap.current.getZoom(), 4), { duration: 0.8 });
  }

  async function callAI(userMsg, isFollowUp = false) {
    if (aiLoading || !selected) return;
    setAiLoading(true);
    const newConv = isFollowUp ? [...conversation, { role:"user", text: userMsg }] : [];
    if (isFollowUp) setConversation(newConv);

    const p = FIRE_TYPES[fireType];
    const fitKey = getFamilyFit(selected, fireType, household);
    const fitLabel = t[fitKey];
    const hhLabel = hh.label[lang];

    let prompt;
    if (!isFollowUp) {
      prompt = lang === "zh"
        ? `FIRE 专家。用户：${p.label} FIRE（${t.fireRange[fireType]}）+ ${hhLabel}，考虑 ${selected.name.zh}（${fitLabel}，单身月 ${selected.costs[0].val}）。\n\n用中文 120 字回答：1) 为何"${fitLabel}" 2) 签证建议（${hasChildren ? '含家属附签' : ''}）3) 实用提示。简洁有料。`
        : `FIRE expert. User: ${p.label} FIRE (${t.fireRange[fireType]}) + ${hhLabel}, considering ${selected.name.en} (${fitLabel}, single mo ${selected.costs[0].val}).\n\nIn 120 words English: 1) Why "${fitLabel}" 2) Visa tip ${hasChildren ? '(incl. family)' : ''} 3) Practical insight. Concise.`;
    } else {
      const lastUserMsg = newConv[newConv.length - 1].text;
      const compactPrompt = lang === "zh"
        ? `城市 ${selected.name.zh}（${p.label} FIRE + ${hhLabel}，月 ${selected.costs[0].val}）。问题：${lastUserMsg}\n\n用中文 120 字内回答。`
        : `City ${selected.name.en} (${p.label} FIRE + ${hhLabel}, ${selected.costs[0].val}/mo). Q: ${lastUserMsg}\n\nUnder 120 words.`;

      try {
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: compactPrompt })
        });
        const data = await res.json();
        if (!res.ok || !data.text) {
          setConversation([...newConv, { role:"assistant", text: t.ai.err + ": " + (data.error || "unknown") }]);
        } else {
          setConversation([...newConv, { role:"assistant", text: data.text }]);
        }
      } catch {
        setConversation([...newConv, { role:"assistant", text: t.ai.net }]);
      }
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setConversation([{ role:"assistant", text: t.ai.err + ": " + (data.error || "unknown") }]);
      } else {
        setConversation([{ role:"assistant", text: data.text }]);
      }
    } catch {
      setConversation([{ role:"assistant", text: t.ai.net }]);
    }
    setAiLoading(false);
  }

  async function loadCommunity() {
    if (!selected || communityLoading) return;
    setCommunityLoading(true);
    setCommunityData(null);

    const prompt = lang === "zh"
      ? `用 web_search 找 ${selected.name.en} 关于 FIRE/退休/旅居/数字游民的讨论帖、文章、博客（任何来源都可以）。\n\n返回 JSON 数组（2-6 个结果即可），每个对象：source（"reddit"/"blog"/"forum"/"news"/"other"），title（原标题），snippet（30 字中文简述），url（真实链接），date（如"2024"或""），stats（"thread" 或 ""）。\n\n只输出 JSON。`
      : `Use web_search to find ANY threads/articles/blogs about ${selected.name.en} FIRE/retire/expat/nomad.\n\nReturn JSON array (2-6 results), each: source ("reddit"/"blog"/"forum"/"news"/"other"), title, snippet (30 words), url (real), date ("2024" or ""), stats ("thread" or "").\n\nJSON only.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, useWebSearch: true })
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setCommunityData({ error: data?.error || "网络错误", raw: "" });
      } else {
        let text = data.text.trim();
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
        const start = text.indexOf("[");
        const end = text.lastIndexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
          const jsonStr = text.substring(start, end + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCommunityData(parsed);
            } else {
              setCommunityData({ error: "空数组", raw: data.text });
            }
          } catch (e) {
            setCommunityData({ error: "JSON 解析失败", raw: data.text });
          }
        } else {
          setCommunityData({ error: "未返回 JSON", raw: data.text });
        }
      }
    } catch (err) {
      setCommunityData({ error: "请求失败", raw: String(err) });
    }
    setCommunityLoading(false);
  }

  useEffect(() => {
    if (activeTab === 4 && selected && !communityData && !communityLoading) {
      loadCommunity();
    }
  }, [activeTab, selected]);

  function handleSuggested(question) {
    setFollowInput("");
    callAI(question, true);
  }
  function handleSendFollow() {
    if (!followInput.trim() || aiLoading) return;
    const q = followInput.trim();
    setFollowInput("");
    callAI(q, true);
  }

  const fitKey = selected ? getFamilyFit(selected, fireType, household) : null;
  const fit = fitKey ? FIT_CONFIG[fitKey] : null;
  const fitLabel = fitKey ? t[fitKey] : "";
  const fitNote = selected ? selected.fitNote[lang][fireType] : "";

  function renderTabContent() {
    if (!selected) return null;
    const ss = {
      sec: { fontSize:9, letterSpacing:3, color:"#d4af37", textTransform:"uppercase", marginBottom:14, fontWeight:400 },
      row: { padding:"10px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)", fontSize:12, color:"#a8a59f", lineHeight:1.7, display:"flex", gap:10, alignItems:"flex-start", fontWeight:300 },
      arr: { color:"#d4af37", fontSize:11, lineHeight:1.5, flexShrink:0 },
      link: { color:"#6b6864", fontSize:10, textDecoration:"none", flexShrink:0 },
    };

    const renderList = (items, emoji = "—") => items.map((item, i) => (
      <div key={i} style={ss.row}>
        <span style={ss.arr}>{emoji}</span>
        <span style={{ flex:1 }}>{typeof item.t === "object" ? item.t[lang] : item.t}</span>
        {item.src && <a href={item.src} target="_blank" rel="noopener noreferrer" style={ss.link}>↗</a>}
      </div>
    ));

    // TAB 0: FINANCE — Cost grid (above) + Tips + Tax
    if (activeTab === 0) return (
      <div>
        <div style={ss.sec}>{t.sec.tips}</div>
        {renderList(selected.tips)}
      </div>
    );

    // TAB 1: RESIDENCY — Visa + Family visa
    if (activeTab === 1) return (
      <div>
        <div style={ss.sec}>{t.sec.visa}</div>
        {selected.visa.map((v, i) => {
          const ts = TAG_STYLE[v.cl] || TAG_STYLE.yellow;
          return (
            <div key={i} style={ss.row}>
              <span style={ss.arr}>—</span>
              <div style={{ flex:1 }}>
                <strong style={{ color:"#e8e6df", fontWeight:500 }}>{v.t[lang]}</strong><br/>
                <span>{v.d[lang]}</span><br/>
                <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:100, fontSize:9, fontWeight:500, marginTop:5, background:ts.background, color:ts.color, border:`0.5px solid ${ts.border}`, letterSpacing:1, textTransform:"uppercase" }}>{v.l[lang]}</span>
              </div>
              {v.src && <a href={v.src} target="_blank" rel="noopener noreferrer" style={ss.link}>↗</a>}
            </div>
          );
        })}
        {(household === "couple" || hasChildren) && selected.family && (
          <>
            <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.family_visa}</div>
            <div style={{ ...ss.row, color:"#c8c5bd", fontStyle:"italic" }}>
              <span style={ss.arr}>👨‍👩‍👧</span>
              <span style={{ flex:1 }}>{selected.family.summary[lang]}</span>
            </div>
          </>
        )}
      </div>
    );

    // TAB 2: LIVING — Health + Insurance + (Education if family) + Safety + Culture
    if (activeTab === 2) return (
      <div>
        <div style={ss.sec}>{t.sec.health}</div>
        {renderList(selected.health)}
        <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.ins}</div>
        {renderList(selected.ins)}
        {hasChildren && selected.family?.schools && (
          <>
            <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.education}</div>
            {selected.family.schools.map((s, i) => {
              const typeColor = s.type === "local" ? TAG_STYLE.green : TAG_STYLE.yellow;
              const typeLabel = s.type === "local" ? (lang==="zh"?"免费 · 本地":"Free · Local") : s.type === "intl_top" ? (lang==="zh"?"国际 · 顶级":"Intl · Top") : (lang==="zh"?"国际 · IB":"Intl · IB");
              return (
                <div key={i} style={ss.row}>
                  <span style={ss.arr}>🎓</span>
                  <div style={{ flex:1 }}>
                    <strong style={{ color:"#e8e6df", fontWeight:500 }}>{lang === "zh" ? s.zh_name : s.en_name}</strong><br/>
                    <span>{s.price}</span><br/>
                    <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:100, fontSize:9, fontWeight:500, marginTop:5, background:typeColor.background, color:typeColor.color, border:`0.5px solid ${typeColor.border}`, letterSpacing:1, textTransform:"uppercase" }}>{typeLabel}</span>
                  </div>
                  {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer" style={ss.link}>↗</a>}
                </div>
              );
            })}
          </>
        )}
        <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.safety}</div>
        {renderList(selected.safety)}
        <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.culture}</div>
        {renderList(selected.culture)}
      </div>
    );

    // TAB 3: VIBE — Score grid + Curated venues
    if (activeTab === 3) {
      const scores = selected.vibe?.scores || {};
      const venues = selected.vibe?.venues || [];
      const greenStars = selected.vibe?.greenStars || [];
      return (
        <div>
          <div style={ss.sec}>{t.sec.vibe_overview}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7, marginBottom:18 }}>
            {Object.entries(scores).map(([k, score]) => {
              const isGreen = greenStars.includes(k);
              const isHot = score >= 4;
              return (
                <div key={k} style={{
                  background: isHot ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.03)",
                  border: `0.5px solid ${isHot ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.12)"}`,
                  borderRadius:3, padding:"9px 11px", position:"relative",
                }}>
                  <div style={{ fontSize:9, letterSpacing:1.5, color: isHot ? "#d4af37" : "#8a8884", textTransform:"uppercase", marginBottom:5, fontWeight:400 }}>
                    {t.vibeLabels[k]}
                  </div>
                  <div style={{ display:"flex", gap:2 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex:1, height:3, borderRadius:1,
                        background: i <= score ? (isGreen ? "#7dd3a8" : "#d4af37") : "rgba(212,175,55,0.15)"
                      }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {venues.length > 0 && (
            <>
              <div style={ss.sec}>{t.sec.vibe_detail}</div>
              {venues.map((v, i) => (
                <div key={i} style={{ padding:"11px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)" }}>
                  <div style={{ display:"flex", gap:10 }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{v.emoji}</span>
                    <div style={{ flex:1 }}>
                      <strong style={{ color:"#e8e6df", fontWeight:500, fontSize:12 }}>{lang === "zh" ? v.name_zh : v.name_en}</strong><br/>
                      <span style={{ fontSize:11, color:"#a8a59f", lineHeight:1.6, fontWeight:300 }}>{lang === "zh" ? v.desc_zh : v.desc_en}</span>
                      {v.tags && v.tags.length > 0 && (
                        <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap" }}>
                          {v.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize:9, padding:"2px 7px", borderRadius:100, background:"rgba(212,175,55,0.12)", color:"#d4af37", border:"0.5px solid rgba(212,175,55,0.25)", letterSpacing:0.5, fontWeight:400 }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {v.src && <a href={v.src} target="_blank" rel="noopener noreferrer" style={ss.link}>↗</a>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      );
    }

    // TAB 4: DISCUSSION
    if (activeTab === 4) return (
      <div>
        <div style={{ ...ss.sec, display:"flex", alignItems:"center", gap:8 }}>
          {t.sec.community}
          <span onClick={loadCommunity} style={{ marginLeft:"auto", cursor:"pointer", fontSize:9, color:"#6b6864", padding:"3px 8px", border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:10, fontWeight:300, letterSpacing:1 }}>
            {t.community.refresh}
          </span>
        </div>
        {communityLoading && (
          <div style={{ fontSize:11, color:"#8a8884", lineHeight:1.7, fontWeight:300, padding:"20px 0" }}>
            {t.community.loading}
          </div>
        )}
        {!communityLoading && communityData && !Array.isArray(communityData) && communityData.error && (
          <div style={{ padding:"12px 0" }}>
            <div style={{ fontSize:11, color:"#8a8884", fontWeight:300, lineHeight:1.6 }}>
              {t.community.noResults}
            </div>
          </div>
        )}
        {!communityLoading && Array.isArray(communityData) && communityData.length > 0 && (
          <>
            <div style={{ fontSize:10, color:"#6b6864", fontStyle:"italic", marginBottom:12, fontWeight:300 }}>
              {t.community.hint}
            </div>
            {communityData.map((thread, i) => {
              const srcColors = {
                reddit: {bg:"rgba(255,69,0,0.15)", color:"#ff8d4a", border:"rgba(255,69,0,0.3)"},
                xhs: {bg:"rgba(255,36,66,0.15)", color:"#ff708a", border:"rgba(255,36,66,0.3)"},
                zhihu: {bg:"rgba(0,132,255,0.15)", color:"#4ba3ff", border:"rgba(0,132,255,0.3)"},
                bogleheads: {bg:"rgba(125,211,168,0.15)", color:"#7dd3a8", border:"rgba(125,211,168,0.3)"},
                blog: {bg:"rgba(212,175,55,0.12)", color:"#d4af37", border:"rgba(212,175,55,0.3)"},
                forum: {bg:"rgba(180,140,210,0.15)", color:"#c8a8e0", border:"rgba(180,140,210,0.3)"},
                news: {bg:"rgba(140,200,200,0.15)", color:"#a0d8d8", border:"rgba(140,200,200,0.3)"},
                other: {bg:"rgba(168,165,159,0.15)", color:"#a8a59f", border:"rgba(168,165,159,0.3)"}
              };
              const sc = srcColors[thread.source] || srcColors.other;
              const srcLabels = { reddit:"Reddit", xhs:"小红书", zhihu:"知乎", bogleheads:"Bogleheads", blog:lang==="zh"?"博客":"Blog", forum:lang==="zh"?"论坛":"Forum", news:lang==="zh"?"新闻":"News", other:lang==="zh"?"其他":"Other" };
              return (
                <div key={i} style={{ padding:"12px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:9, padding:"2px 7px", borderRadius:8, fontWeight:500, background:sc.bg, color:sc.color, border:`0.5px solid ${sc.border}` }}>{srcLabels[thread.source] || thread.source}</span>
                    {thread.date && <span style={{ fontSize:9, color:"#6b6864" }}>{thread.date}</span>}
                  </div>
                  <div style={{ fontSize:12, color:"#e8e6df", lineHeight:1.5, fontWeight:400, marginBottom:4 }}>
                    {thread.title}
                  </div>
                  <div style={{ fontSize:11, color:"#8a8884", lineHeight:1.6, fontWeight:300, marginBottom:6 }}>
                    {thread.snippet}
                  </div>
                  <div style={{ display:"flex", gap:12, fontSize:9, color:"#6b6864", alignItems:"center" }}>
                    {thread.stats && <span>{thread.stats}</span>}
                    {thread.url && (
                      <a href={thread.url} target="_blank" rel="noopener noreferrer" style={{ color:"#d4af37", textDecoration:"none", marginLeft:"auto", fontSize:9, letterSpacing:1, textTransform:"uppercase" }}>
                        {t.community.openLink}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!communityLoading && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop:"0.5px solid rgba(212,175,55,0.1)" }}>
            <div style={{ fontSize:9, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", marginBottom:10, fontWeight:300 }}>
              {t.community.directTitle}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                { label:"Reddit", url:`https://www.reddit.com/search/?q=${encodeURIComponent(selected.name.en + " FIRE retire expat")}&sort=top&t=year`, c:"#ff8d4a", bg:"rgba(255,69,0,0.08)", b:"rgba(255,69,0,0.3)" },
                { label:"小红书", url:`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(selected.name.zh + " 旅居 FIRE")}`, c:"#ff708a", bg:"rgba(255,36,66,0.08)", b:"rgba(255,36,66,0.3)" },
                { label:"知乎", url:`https://www.zhihu.com/search?type=content&q=${encodeURIComponent(selected.name.zh + " FIRE 退休")}`, c:"#4ba3ff", bg:"rgba(0,132,255,0.08)", b:"rgba(0,132,255,0.3)" },
                { label:"Bogleheads", url:`https://www.bogleheads.org/forum/search.php?keywords=${encodeURIComponent(selected.name.en + " retire")}`, c:"#7dd3a8", bg:"rgba(125,211,168,0.08)", b:"rgba(125,211,168,0.3)" },
              ].map(p => (
                <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" style={{
                  padding:"8px 10px", borderRadius:2, fontSize:10, fontWeight:500,
                  background: p.bg, color: p.c, border:`0.5px solid ${p.b}`,
                  textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"space-between",
                  letterSpacing:0.3,
                }}>
                  <span>{p.label}</span>
                  <span style={{ fontSize:9, opacity:0.7 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0e0e10", fontFamily:"'Inter','PingFang SC','Microsoft YaHei',system-ui,sans-serif", color:"#e8e6df", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        .leaflet-control-zoom a { background:#131315!important; color:#d4af37!important; border:0.5px solid rgba(212,175,55,0.2)!important; }
        .leaflet-control-zoom a:hover { background:#1a1a1c!important; }
        .leaflet-control-attribution { background:rgba(14,14,16,0.85)!important; color:#6b6864!important; font-size:9px!important; }
        .leaflet-control-attribution a { color:#8a8884!important; }
        .leaflet-container { background:#050810!important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.2); border-radius:2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-start", padding:"10px 18px", borderBottom:"0.5px solid rgba(212,175,55,0.12)", background:"linear-gradient(180deg,#131315 0%,#0e0e10 100%)", flexShrink:0, gap:10, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:30, height:30, border:"0.5px solid rgba(212,175,55,0.4)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#d4af37" strokeWidth="0.8" opacity="0.7"/>
              <path d="M12 3 Q 7 12 12 21 Q 17 12 12 3 Z" stroke="#d4af37" strokeWidth="0.6" fill="none" opacity="0.5"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="#d4af37" strokeWidth="0.6" opacity="0.5"/>
              <circle cx="12" cy="12" r="1.2" fill="#d4af37"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontWeight:500, letterSpacing:0.8, color:"#d4af37" }}>
              FIRE<span style={{ fontStyle:"italic", fontWeight:400, color:"#e8e6df" }}>nomad</span>
            </div>
            <div style={{ fontSize:8, letterSpacing:3, color:"#6b6864", textTransform:"uppercase", marginTop:1, fontWeight:300 }}>{t.appTag} · {CITIES.length}</div>
          </div>
        </div>

        {/* FIRE PILLS */}
        <div style={{ display:"flex", border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:100, overflow:"hidden", background:"#131315" }}>
          {Object.entries(FIRE_TYPES).map(([k, v], i) => (
            <button key={k} onClick={() => setFireType(k)} style={{
              padding:"4px 10px", border:"none",
              borderRight: i < 4 ? "0.5px solid rgba(212,175,55,0.08)" : "none",
              background: fireType===k ? "linear-gradient(180deg,#d4af37 0%,#b8941f 100%)" : "transparent",
              color: fireType===k ? "#0e0e10" : "#6b6864",
              fontSize:10, fontWeight: fireType===k ? 500 : 400,
              cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3,
            }}>{v.label}</button>
          ))}
        </div>

        {/* HOUSEHOLD DROPDOWN */}
        <div style={{ position:"relative" }}>
          <button id="hh-trigger" onClick={() => setHhOpen(!hhOpen)} style={{
            background:"#131315", border:"0.5px solid rgba(212,175,55,0.3)", borderRadius:100,
            padding:"5px 11px 5px 13px", color:"#d4af37", fontSize:10, fontFamily:"inherit", fontWeight:500,
            cursor:"pointer", display:"flex", alignItems:"center", gap:7, letterSpacing:0.3,
          }}>
            <span>{hh.emoji} {hh.label[lang]}</span>
            <span style={{ fontSize:8, opacity:0.8 }}>▾</span>
          </button>
          {hhOpen && (() => {
            const trigger = typeof document !== "undefined" ? document.getElementById("hh-trigger") : null;
            const rect = trigger?.getBoundingClientRect();
            const top = rect ? rect.bottom + 6 : 60;
            const right = rect ? (window.innerWidth - rect.right) : 200;
            return (
              <>
                <div onClick={() => setHhOpen(false)} style={{ position:"fixed", inset:0, zIndex:9998 }}/>
                <div style={{
                  position:"fixed", top: top + "px", right: right + "px",
                  width:220, background:"#131315",
                  border:"0.5px solid rgba(212,175,55,0.3)", borderRadius:6, overflow:"hidden",
                  boxShadow:"0 10px 30px rgba(0,0,0,0.5)", zIndex:9999,
                }}>
                  <div style={{ fontSize:8, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", padding:"9px 14px 4px", fontWeight:400 }}>
                    {t.hhSection}
                  </div>
                  {Object.entries(HOUSEHOLDS).map(([k, h]) => (
                    <div key={k} onClick={() => { setHousehold(k); setHhOpen(false); }} style={{
                      padding:"9px 14px", color: household===k ? "#d4af37" : "#a8a59f",
                      background: household===k ? "rgba(212,175,55,0.1)" : "transparent",
                      fontSize:11, cursor:"pointer", fontFamily:"inherit",
                      fontWeight: household===k ? 500 : 400,
                      display:"flex", alignItems:"center", gap:9,
                    }}>
                      <span style={{ fontSize:14 }}>{h.emoji}</span>
                      <div>
                        <div>{h.label[lang]}</div>
                        <div style={{ fontSize:9, color: household===k ? "#d4af3799" : "#6b6864", marginTop:1 }}>{h.desc[lang]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* LANG */}
        <div style={{ display:"flex", alignItems:"center", border:"0.5px solid rgba(212,175,55,0.3)", borderRadius:100, overflow:"hidden", background:"#131315" }}>
          <button onClick={() => setLang("zh")} style={{ padding:"4px 10px", border:"none", background: lang==="zh" ? "rgba(212,175,55,0.18)" : "transparent", color: lang==="zh" ? "#d4af37" : "#6b6864", fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>中</button>
          <button onClick={() => setLang("en")} style={{ padding:"4px 10px", border:"none", background: lang==="en" ? "rgba(212,175,55,0.18)" : "transparent", color: lang==="en" ? "#d4af37" : "#6b6864", fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>EN</button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9, color:"#6b6864", letterSpacing:2, textTransform:"uppercase", fontWeight:300, marginLeft:"auto" }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#d4af37", boxShadow:"0 0 8px rgba(212,175,55,0.6)" }}/>
          {t.aiLive}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, position:"relative", background:"#050810" }}>
          <div ref={mapRef} style={{ width:"100%", height:"100%" }}/>

          <div style={{ position:"absolute", bottom:18, left:18, background:"rgba(14,14,16,0.92)", border:"0.5px solid rgba(212,175,55,0.18)", borderRadius:8, padding:"12px 16px", backdropFilter:"blur(10px)", zIndex:1000 }}>
            <div style={{ fontSize:9, letterSpacing:3, color:"#6b6864", textTransform:"uppercase", marginBottom:9, fontWeight:300 }}>
              {FIRE_TYPES[fireType].label} · {hh.emoji} {t.fitLegend}
            </div>
            {["great","ok","poor"].map(k => {
              const v = FIT_CONFIG[k];
              return (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:9, fontSize:11, color:"#a8a59f", marginBottom:5, fontWeight:300 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:k==="poor"?"transparent":v.color, border:k==="poor"?`1px solid ${v.color}`:"none" }}/>
                  {t[k]}
                </div>
              );
            })}
          </div>

          {!selected && (
            <div style={{ position:"absolute", top:18, left:"50%", transform:"translateX(-50%)", background:"rgba(14,14,16,0.85)", border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:100, padding:"7px 18px", fontSize:10, color:"#8a8884", letterSpacing:1.5, textTransform:"uppercase", fontWeight:300, backdropFilter:"blur(8px)", zIndex:1000, pointerEvents:"none" }}>
              {t.hint}
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div style={{ width: selected ? 400 : 0, background:"#0e0e10", borderLeft:"0.5px solid rgba(212,175,55,0.12)", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.3s ease", flexShrink:0 }}>
          {selected && (
            <div style={{ width:400, display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"18px 22px 14px", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0, position:"relative" }}>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:16, right:18, width:22, height:22, borderRadius:"50%", background:"transparent", border:"0.5px solid rgba(212,175,55,0.3)", color:"#8a8884", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>{t.close}</button>

                <div style={{ fontSize:9, letterSpacing:4, color:"#6b6864", textTransform:"uppercase", marginBottom:6, fontWeight:300 }}>
                  {selected.country[lang]} · {selected.region[lang]}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:25, fontWeight:500, color:"#e8e6df", letterSpacing:0.5, lineHeight:1.1 }}>
                  {selected.name[lang]}
                </div>
                <div style={{ fontSize:11, color:"#8a8884", marginTop:6, fontWeight:300, lineHeight:1.5 }}>
                  {selected.sub[lang]}
                </div>

                <div style={{ height:"0.5px", background:"linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.3) 50%,transparent 100%)", margin:"12px 0" }}/>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:10, letterSpacing:1.5, color:"#8a8884", textTransform:"uppercase", fontWeight:400 }}>
                    {FIRE_TYPES[fireType].icon} {FIRE_TYPES[fireType].label} · {hh.emoji} {hh.label[lang]}
                  </span>
                  <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", fontWeight:500, border:`0.5px solid ${fit.border}`, padding:"3px 10px", borderRadius:100, color:fit.color, background:fit.bg }}>
                    {fitLabel}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"#a8a59f", lineHeight:1.7, fontWeight:300 }}>{fitNote}</div>
              </div>

              {/* COST GRID (with multipliers) */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, padding:1, background:"rgba(212,175,55,0.08)", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {selected.costs.map((c) => {
                  const adjusted = formatCost(c.val, c.key, mult);
                  const multValue = mult[c.key];
                  const showMult = household !== "single" && multValue !== 1;
                  return (
                    <div key={c.key} style={{ background:"#0e0e10", padding:"12px 13px", position:"relative" }}>
                      <div style={{ fontSize:8, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", marginBottom:5, fontWeight:300 }}>{t.cost[c.key]}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:500, color:"#d4af37", letterSpacing:0.5 }}>{adjusted}</div>
                      {showMult && (
                        <div style={{ fontSize:9, color:"#6b6864", marginTop:2, textDecoration:"line-through" }}>{c.val}</div>
                      )}
                      {showMult && (
                        <span style={{ position:"absolute", top:7, right:9, fontSize:8, color:"#7dd3a8", background:"rgba(125,211,168,0.15)", padding:"2px 5px", borderRadius:7, letterSpacing:0.3, fontWeight:500 }}>×{multValue.toFixed(1)}</span>
                      )}
                      <a href={c.src} target="_blank" rel="noopener noreferrer" style={{ position:"absolute", bottom:7, right:9, fontSize:9, color:"#6b6864", textDecoration:"none" }}>↗</a>
                    </div>
                  );
                })}
                {/* Education card — only if family with children */}
                {hasChildren && selected.eduPerKid && (
                  <div style={{ background:"#0e0e10", padding:"12px 13px", position:"relative" }}>
                    <div style={{ fontSize:8, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", marginBottom:5, fontWeight:300 }}>{t.cost.Education}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:500, color:"#d4af37", letterSpacing:0.5 }}>
                      ${(selected.eduPerKid * mult.Education).toLocaleString()}
                    </div>
                    <div style={{ fontSize:9, color:"#7dd3a8", marginTop:2 }}>
                      {mult.Education}× {lang === "zh" ? "孩子" : "child" + (mult.Education > 1 ? "ren" : "")}
                    </div>
                    <span style={{ position:"absolute", top:7, right:9, fontSize:8, color:"#d4af37", background:"rgba(212,175,55,0.15)", padding:"2px 5px", borderRadius:7, letterSpacing:0.3, fontWeight:500 }}>{t.newCategory}</span>
                  </div>
                )}
              </div>

              {/* 5 TABS */}
              <div style={{ display:"flex", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {t.tabs.map((tabLabel, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    flex:1, padding:"11px 3px",
                    fontSize:9, letterSpacing:1, textTransform:"uppercase",
                    color: activeTab===i ? "#d4af37" : "#6b6864",
                    cursor:"pointer", border:"none",
                    borderBottom: activeTab===i ? "1px solid #d4af37" : "1px solid transparent",
                    background:"none", fontFamily:"inherit", fontWeight:400,
                    whiteSpace:"nowrap",
                  }}>
                    {tabLabel}
                  </button>
                ))}
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"16px 22px" }}>
                {renderTabContent()}
              </div>

              {/* AI SECTION */}
              <div style={{ padding:"14px 20px 16px", borderTop:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0, background:"#0a0a0c", maxHeight: aiExpanded ? "45%" : "auto", overflowY: aiExpanded ? "auto" : "visible" }}>
                <div style={{ fontSize:9, letterSpacing:3, color:"#d4af37", textTransform:"uppercase", marginBottom: aiExpanded ? 10 : 0, fontWeight:400, display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() => setAiExpanded(!aiExpanded)}>
                  <span>✦</span> {t.ai.title}
                  <span style={{ marginLeft:"auto", fontSize:11, color:"#6b6864", fontWeight:300, letterSpacing:0 }}>
                    {aiExpanded ? "▾" : "▸"}
                  </span>
                </div>

                {aiExpanded && (<>
                {conversation.length === 0 && !aiLoading && (
                  <button onClick={() => callAI(null, false)} style={{
                    width:"100%", padding:11, background:"transparent",
                    color:"#d4af37", border:"0.5px solid rgba(212,175,55,0.4)",
                    borderRadius:2, fontFamily:"inherit", fontWeight:400, fontSize:10,
                    letterSpacing:2.5, textTransform:"uppercase", cursor:"pointer",
                  }}>
                    ✦ {t.ai.askBtn} ✦
                  </button>
                )}
                {aiLoading && conversation.length === 0 && (
                  <div style={{ padding:"10px 12px", background:"rgba(212,175,55,0.04)", border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:2, fontSize:11, color:"#d4af37", fontStyle:"italic" }}>
                    ✦ {t.ai.loading}...
                  </div>
                )}
                {conversation.length > 0 && (
                  <div style={{ background:"rgba(212,175,55,0.04)", border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:2, padding:"12px 14px", marginBottom:10, maxHeight:200, overflowY:"auto" }}>
                    {conversation.map((msg, i) => (
                      <div key={i} style={{ marginBottom:10, ...(msg.role==="user" ? { borderLeft:"1px solid rgba(212,175,55,0.3)", paddingLeft:10, color:"#8a8884", fontStyle:"italic" } : { color:"#c8c5bd" }) }}>
                        <div style={{ fontSize:8, letterSpacing:2, color:"#6b6864", textTransform:"uppercase", marginBottom:4, fontWeight:400 }}>
                          {msg.role==="user" ? t.ai.you : (i===0 ? t.ai.aiLabel : t.ai.aiFollow)}
                        </div>
                        <div style={{ fontSize:11, lineHeight:1.75, fontWeight:300, whiteSpace:"pre-wrap" }}>{msg.text}</div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div style={{ color:"#d4af37", fontSize:11, fontStyle:"italic" }}>✦ {t.ai.loading}...</div>
                    )}
                  </div>
                )}
                {conversation.length > 0 && conversation[conversation.length-1].role === "assistant" && !aiLoading && (
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:10 }}>
                    {t.suggested.slice(0, 2).map((q, i) => (
                      <button key={i} onClick={() => handleSuggested(q)} style={{
                        padding:"7px 10px", background:"transparent",
                        border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:2,
                        color:"#a8a59f", fontSize:10, textAlign:"left", cursor:"pointer",
                        fontFamily:"inherit", fontWeight:300, letterSpacing:0.2,
                      }}>
                        → {q}
                      </button>
                    ))}
                  </div>
                )}
                {conversation.length > 0 && (
                  <div style={{ display:"flex", gap:5 }}>
                    <input
                      value={followInput}
                      onChange={e => setFollowInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendFollow()}
                      disabled={aiLoading}
                      placeholder={t.ai.placeholder}
                      style={{
                        flex:1, padding:"9px 11px", background:"#131315",
                        border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:2,
                        color:"#e8e6df", fontSize:11, fontFamily:"inherit", fontWeight:300, outline:"none"
                      }}
                    />
                    <button onClick={handleSendFollow} disabled={aiLoading || !followInput.trim()} style={{
                      padding:"9px 13px", background:"transparent",
                      color:"#d4af37", border:"0.5px solid rgba(212,175,55,0.4)",
                      borderRadius:2, fontFamily:"inherit", fontWeight:400, fontSize:9,
                      letterSpacing:2, cursor:"pointer", textTransform:"uppercase",
                      opacity: (aiLoading || !followInput.trim()) ? 0.4 : 1
                    }}>{t.ai.send}</button>
                  </div>
                )}
                </>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
