import { useState, useEffect, useRef } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  zh: {
    appName: "FIRENomad", appTag: "独立旅居图鉴", cities: "城市",
    aiLive: "AI · 实时",
    hint: "点击城市 · 滚轮缩放 · 拖拽",
    fitLegend: "适合度", great: "非常适合", ok: "勉强可行", poor: "不推荐",
    fireRange: { lean: "$1,500-2,000/月", regular: "$2,000-4,000/月", fat: "$4,000+/月", barista: "半退休+兼职", coast: "被动收入为主" },
    tabs: ["成本", "签证", "医保", "安全", "社区"],
    sec: { tips: "省钱贴士", visa: "签证类型", health: "医疗体系", ins: "保险建议", safety: "安全状况", culture: "文化考量", community: "实时讨论攻略" },
    ai: { title: "AI 个性化分析", askBtn: "请 AI 个性化分析", loading: "分析中", placeholder: "继续问 AI...（Enter 发送）", send: "发送", you: "你", aiLabel: "AI 分析", aiFollow: "AI 跟进", err: "错误", net: "网络问题，请稍后重试" },
    community: { refresh: "↻ 刷新", loading: "📡 AI 正在搜索 Reddit/小红书/知乎... 约需 10-20 秒", noResults: "暂无结果，请刷新重试", hint: "最近 60 天 · AI 已汇总热门论坛最新讨论", openLink: "查看 ↗" },
    suggested: ["如果我想带家人一起来，签证怎么办？", "如果带宠物搬过去，要注意什么？", "比较这个城市和其他热门 FIRE 城市哪个更适合我？"],
    cost: { Monthly: "月均总计", Housing: "住宿", Food: "餐饮", Transit: "交通", Leisure: "娱乐", Health: "医保" },
    close: "✕",
  },
  en: {
    appName: "FIRENomad", appTag: "Atlas of Independence", cities: "cities",
    aiLive: "AI · LIVE",
    hint: "Click city · Scroll to zoom · Drag",
    fitLegend: "Compatibility", great: "Highly Suitable", ok: "Marginal", poor: "Not Recommended",
    fireRange: { lean: "$1.5-2k/mo", regular: "$2-4k/mo", fat: "$4k+/mo", barista: "Semi-retire+Part-time", coast: "Mostly Passive" },
    tabs: ["Cost", "Visa", "Health", "Safety", "Community"],
    sec: { tips: "Insider Notes", visa: "Visa Types", health: "Healthcare", ins: "Insurance", safety: "Safety", culture: "Culture", community: "Live Discussions" },
    ai: { title: "AI Personal Analysis", askBtn: "Ask AI · Personal Analysis", loading: "Analyzing", placeholder: "Follow up with AI... (Enter)", send: "Send", you: "You", aiLabel: "AI Analysis", aiFollow: "AI Follow-up", err: "Error", net: "Network issue" },
    community: { refresh: "↻ Refresh", loading: "📡 AI searching Reddit/Xiaohongshu/Zhihu... 10-20s", noResults: "No results, try refresh", hint: "Last 60 days · AI-curated from popular forums", openLink: "View ↗" },
    suggested: ["What visa options exist for bringing my family?", "What should I know about relocating with pets?", "Compare this city with other popular FIRE destinations for me"],
    cost: { Monthly: "Monthly", Housing: "Housing", Food: "Food", Transit: "Transit", Leisure: "Leisure", Health: "Health" },
    close: "✕",
  }
};

const FIRE_TYPES = {
  lean:    { label:"Lean",    icon:"🌱" },
  regular: { label:"Regular", icon:"🔥" },
  fat:     { label:"Fat",     icon:"💎" },
  barista: { label:"Barista", icon:"☕" },
  coast:   { label:"Coast",   icon:"🌊" },
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

// ─── 40 CITIES (bilingual, fact-checked May 2026) ────────────────────────────
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

export default function App() {
  const [lang, setLang] = useState("zh");
  const [fireType, setFireType] = useState("lean");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [conversation, setConversation] = useState([]); // { role:"user"|"assistant", text }
  const [aiLoading, setAiLoading] = useState(false);
  const [followInput, setFollowInput] = useState("");
  const [aiExpanded, setAiExpanded] = useState(true);
  const [communityData, setCommunityData] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const labelsRef = useRef({});
  const t = T[lang];

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
      // Marker dot
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

      // Visible city label (always shown, not just on hover)
      const labelEl = document.createElement("div");
      labelEl.style.cssText = "padding:2px 7px;border-radius:3px;font-size:10px;font-family:'Inter','PingFang SC',sans-serif;font-weight:500;letter-spacing:0.3px;white-space:nowrap;pointer-events:none;transition:all 0.3s ease;backdrop-filter:blur(4px);";
      const labelIcon = L.divIcon({ html: labelEl, className:"", iconSize:[60,16], iconAnchor:[30,28] });
      const labelMarker = L.marker([city.lat, city.lng], { icon: labelIcon, interactive: false, zIndexOffset: -100 }).addTo(map);

      markersRef.current[city.id] = { marker, glow, main };
      labelsRef.current[city.id] = labelEl;
    });

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Update markers and labels by fit/lang
  useEffect(() => {
    CITIES.forEach(city => {
      const m = markersRef.current[city.id];
      const labelEl = labelsRef.current[city.id];
      if (!m || !labelEl) return;
      const fitKey = city.fit[fireType];
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
  }, [fireType, selected, lang]);

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
    const newConv = isFollowUp
      ? [...conversation, { role:"user", text: userMsg }]
      : [];
    if (isFollowUp) setConversation(newConv);

    const p = FIRE_TYPES[fireType];
    const fit = FIT_CONFIG[selected.fit[fireType]];
    const fitLabel = t[selected.fit[fireType]];

    let prompt;
    if (!isFollowUp) {
      prompt = lang === "zh"
        ? `FIRE 专家。用户 ${p.label} FIRE（${t.fireRange[fireType]}），考虑 ${selected.name.zh}（${fitLabel}，月 ${selected.costs[0].val}）。\n\n用中文 120 字回答：1) 为何"${fitLabel}" 2) 签证建议 3) 实用提示。简洁有料。`
        : `FIRE expert. User ${p.label} FIRE (${t.fireRange[fireType]}), considering ${selected.name.en} (${fitLabel}, ${selected.costs[0].val}/mo).\n\nIn 120 words English: 1) Why "${fitLabel}" 2) Visa tip 3) Practical insight. Concise.`;
    } else {
      // Compact context: only send latest user question + brief city context (not full history)
      const lastUserMsg = newConv[newConv.length - 1].text;
      const compactPrompt = lang === "zh"
        ? `城市 ${selected.name.zh}（${p.label} FIRE，月 ${selected.costs[0].val}）。问题：${lastUserMsg}\n\n用中文 120 字内回答。`
        : `City ${selected.name.en} (${p.label} FIRE, ${selected.costs[0].val}/mo). Q: ${lastUserMsg}\n\nAnswer in English, under 120 words.`;

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
      ? `搜索 ${selected.name.zh} (${selected.name.en}) 关于 FIRE/退休/旅居/数字游民的最新社区讨论。在 Reddit、小红书、知乎、Bogleheads 等热门论坛中找 4-6 个最相关、最近 60 天内的帖子。\n\n以 JSON 数组格式返回，每个对象包含：source（reddit/xhs/zhihu/bogleheads/other），title（讨论标题），snippet（30-50 字摘要），url（原帖链接），date（如"3 天前"），stats（如"↑ 412 · 💬 89"）。\n\n只返回 JSON，无其他文字。`
      : `Search for recent FIRE/retirement/expat/digital-nomad discussions about ${selected.name.en}. Find 4-6 most relevant posts from last 60 days on Reddit, Xiaohongshu, Zhihu, Bogleheads etc.\n\nReturn as JSON array, each object: source (reddit/xhs/zhihu/bogleheads/other), title, snippet (30-50 words), url, date (e.g. "3 days ago"), stats (e.g. "↑ 412 · 💬 89").\n\nJSON only, no other text.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, useWebSearch: true })
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setCommunityData({ error: data?.error || "网络错误 / Network error", raw: "" });
      } else {
        // Robust JSON extraction: handle markdown code fences, extra text
        let text = data.text.trim();
        // Strip ```json ... ``` or ``` ... ``` wrappers
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
        // Find first [ and last ]
        const start = text.indexOf("[");
        const end = text.lastIndexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
          const jsonStr = text.substring(start, end + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCommunityData(parsed);
            } else {
              setCommunityData({ error: "AI 返回了空数组", raw: data.text });
            }
          } catch (e) {
            setCommunityData({ error: "JSON 解析失败 / Parse failed", raw: data.text });
          }
        } else {
          setCommunityData({ error: "AI 未返回 JSON 格式 / Not JSON", raw: data.text });
        }
      }
    } catch (err) {
      setCommunityData({ error: "请求失败 / Request failed", raw: String(err) });
    }
    setCommunityLoading(false);
  }

  // Auto-load community when tab activated
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

  const fit = selected ? FIT_CONFIG[selected.fit[fireType]] : null;
  const fitLabel = selected ? t[selected.fit[fireType]] : "";
  const fitNote = selected ? selected.fitNote[lang][fireType] : "";

  function renderTabContent() {
    if (!selected) return null;
    const ss = {
      sec: { fontSize:9, letterSpacing:3, color:"#d4af37", textTransform:"uppercase", marginBottom:14, fontWeight:400 },
      row: { padding:"10px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)", fontSize:12, color:"#a8a59f", lineHeight:1.7, display:"flex", gap:10, alignItems:"flex-start", fontWeight:300 },
      arr: { color:"#d4af37", fontSize:11, lineHeight:1.5, flexShrink:0 },
      link: { color:"#6b6864", fontSize:10, textDecoration:"none", flexShrink:0 },
    };

    const renderList = (items) => items.map((item, i) => (
      <div key={i} style={ss.row}>
        <span style={ss.arr}>—</span>
        <span style={{ flex:1 }}>{typeof item.t === "object" ? item.t[lang] : item.t}</span>
        {item.src && <a href={item.src} target="_blank" rel="noopener noreferrer" style={ss.link}>↗</a>}
      </div>
    ));

    if (activeTab === 0) return (
      <div>
        <div style={ss.sec}>{t.sec.tips}</div>
        {renderList(selected.tips)}
      </div>
    );
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
      </div>
    );
    if (activeTab === 2) return (
      <div>
        <div style={ss.sec}>{t.sec.health}</div>
        {renderList(selected.health)}
        <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.ins}</div>
        {renderList(selected.ins)}
      </div>
    );
    if (activeTab === 3) return (
      <div>
        <div style={ss.sec}>{t.sec.safety}</div>
        {renderList(selected.safety)}
        <div style={{ ...ss.sec, marginTop:18 }}>{t.sec.culture}</div>
        {renderList(selected.culture)}
      </div>
    );
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
          <div style={{ padding:"16px 0" }}>
            <div style={{ fontSize:11, color:"#c45c6e", marginBottom:10, fontWeight:400 }}>
              ⚠ {communityData.error}
            </div>
            {communityData.raw && (
              <details style={{ fontSize:10, color:"#6b6864", fontWeight:300 }}>
                <summary style={{ cursor:"pointer", marginBottom:8 }}>查看 AI 原始回复 / Show raw response</summary>
                <pre style={{ background:"rgba(212,175,55,0.04)", padding:"10px", borderRadius:2, fontSize:10, color:"#a8a59f", whiteSpace:"pre-wrap", maxHeight:200, overflow:"auto", fontFamily:"monospace" }}>
                  {communityData.raw}
                </pre>
              </details>
            )}
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
                other: {bg:"rgba(168,165,159,0.15)", color:"#a8a59f", border:"rgba(168,165,159,0.3)"}
              };
              const sc = srcColors[thread.source] || srcColors.other;
              const srcLabels = { reddit:"Reddit", xhs:"小红书", zhihu:"知乎", bogleheads:"Bogleheads", other:"Other" };
              return (
                <div key={i} style={{ padding:"12px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:9, padding:"2px 7px", borderRadius:8, fontWeight:500, background:sc.bg, color:sc.color, border:`0.5px solid ${sc.border}` }}>{srcLabels[thread.source] || thread.source}</span>
                    <span style={{ fontSize:9, color:"#6b6864" }}>{thread.date}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#e8e6df", lineHeight:1.5, fontWeight:400, marginBottom:4 }}>
                    {thread.title}
                  </div>
                  <div style={{ fontSize:11, color:"#8a8884", lineHeight:1.6, fontWeight:300, marginBottom:6 }}>
                    {thread.snippet}
                  </div>
                  <div style={{ display:"flex", gap:12, fontSize:9, color:"#6b6864", alignItems:"center" }}>
                    <span>{thread.stats}</span>
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 22px", borderBottom:"0.5px solid rgba(212,175,55,0.12)", background:"linear-gradient(180deg,#131315 0%,#0e0e10 100%)", flexShrink:0, gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:32, height:32, border:"0.5px solid rgba(212,175,55,0.4)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <div style={{ position:"absolute", inset:4, border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:"50%" }}/>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#d4af37" strokeWidth="0.8" opacity="0.7"/>
              <path d="M12 3 Q 7 12 12 21 Q 17 12 12 3 Z" stroke="#d4af37" strokeWidth="0.6" fill="none" opacity="0.5"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="#d4af37" strokeWidth="0.6" opacity="0.5"/>
              <circle cx="12" cy="12" r="1.2" fill="#d4af37"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:500, letterSpacing:0.8, color:"#d4af37" }}>
              FIRE<span style={{ fontStyle:"italic", fontWeight:400, color:"#e8e6df" }}>nomad</span>
            </div>
            <div style={{ fontSize:8, letterSpacing:3.5, color:"#6b6864", textTransform:"uppercase", marginTop:2, fontWeight:300 }}>{t.appTag} · {CITIES.length} {t.cities}</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:0, border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:100, overflow:"hidden", background:"#131315" }}>
          {Object.entries(FIRE_TYPES).map(([k, v], i) => (
            <button key={k} onClick={() => setFireType(k)} style={{
              padding:"5px 11px", border:"none",
              borderRight: i < 4 ? "0.5px solid rgba(212,175,55,0.08)" : "none",
              background: fireType===k ? "linear-gradient(180deg,#d4af37 0%,#b8941f 100%)" : "transparent",
              color: fireType===k ? "#0e0e10" : "#6b6864",
              fontSize:10, fontWeight: fireType===k ? 500 : 400,
              cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3,
            }}>{v.label}</button>
          ))}
        </div>

        {/* LANGUAGE TOGGLE */}
        <div style={{ display:"flex", alignItems:"center", border:"0.5px solid rgba(212,175,55,0.3)", borderRadius:100, overflow:"hidden", background:"#131315" }}>
          <button onClick={() => setLang("zh")} style={{ padding:"5px 11px", border:"none", background: lang==="zh" ? "rgba(212,175,55,0.18)" : "transparent", color: lang==="zh" ? "#d4af37" : "#6b6864", fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>中</button>
          <div style={{ width:"0.5px", height:14, background:"rgba(212,175,55,0.2)" }}/>
          <button onClick={() => setLang("en")} style={{ padding:"5px 11px", border:"none", background: lang==="en" ? "rgba(212,175,55,0.18)" : "transparent", color: lang==="en" ? "#d4af37" : "#6b6864", fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5 }}>EN</button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:9, color:"#6b6864", letterSpacing:2, textTransform:"uppercase", fontWeight:300 }}>
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
              {FIRE_TYPES[fireType].label} {t.fitLegend}
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
        <div style={{ width: selected ? 380 : 0, background:"#0e0e10", borderLeft:"0.5px solid rgba(212,175,55,0.12)", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.3s ease", flexShrink:0 }}>
          {selected && (
            <div style={{ width:380, display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0, position:"relative" }}>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:16, right:18, width:22, height:22, borderRadius:"50%", background:"transparent", border:"0.5px solid rgba(212,175,55,0.3)", color:"#8a8884", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>{t.close}</button>

                <div style={{ fontSize:9, letterSpacing:4, color:"#6b6864", textTransform:"uppercase", marginBottom:6, fontWeight:300 }}>
                  {selected.country[lang]} · {selected.region[lang]}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:500, color:"#e8e6df", letterSpacing:0.5, lineHeight:1.1 }}>
                  {selected.name[lang]}
                </div>
                <div style={{ fontSize:11, color:"#8a8884", marginTop:6, fontWeight:300, lineHeight:1.5 }}>
                  {selected.sub[lang]}
                </div>

                <div style={{ height:"0.5px", background:"linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.3) 50%,transparent 100%)", margin:"14px 0" }}/>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:10, letterSpacing:1.5, color:"#8a8884", textTransform:"uppercase", fontWeight:400 }}>
                    {FIRE_TYPES[fireType].icon} {FIRE_TYPES[fireType].label} FIRE
                  </span>
                  <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", fontWeight:500, border:`0.5px solid ${fit.border}`, padding:"3px 10px", borderRadius:100, color:fit.color, background:fit.bg }}>
                    {fitLabel}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"#a8a59f", lineHeight:1.7, fontWeight:300 }}>{fitNote}</div>
              </div>

              {/* Cost grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, padding:1, background:"rgba(212,175,55,0.08)", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {selected.costs.map((c) => (
                  <div key={c.key} style={{ background:"#0e0e10", padding:"13px 15px", position:"relative" }}>
                    <div style={{ fontSize:8, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", marginBottom:6, fontWeight:300 }}>{t.cost[c.key]}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500, color:"#d4af37", letterSpacing:0.5 }}>{c.val}</div>
                    <a href={c.src} target="_blank" rel="noopener noreferrer" style={{ position:"absolute", top:8, right:10, fontSize:9, color:"#6b6864", textDecoration:"none" }}>↗</a>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {t.tabs.map((tabLabel, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    flex:1, padding:"11px 4px",
                    fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
                    color: activeTab===i ? "#d4af37" : "#6b6864",
                    cursor:"pointer", border:"none",
                    borderBottom: activeTab===i ? "1px solid #d4af37" : "1px solid transparent",
                    background:"none", fontFamily:"inherit", fontWeight:400,
                  }}>
                    {tabLabel}{i === 4 && <span style={{ color:"#d4af37", marginLeft:3 }}>✦</span>}
                  </button>
                ))}
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"16px 22px" }}>
                {renderTabContent()}
              </div>

              {/* AI CHAT SECTION */}
              <div style={{ padding:"14px 20px 16px", borderTop:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0, background:"#0a0a0c", maxHeight: aiExpanded ? "45%" : "auto", overflowY: aiExpanded ? "auto" : "visible" }}>
                <div style={{ fontSize:9, letterSpacing:3, color:"#d4af37", textTransform:"uppercase", marginBottom: aiExpanded ? 10 : 0, fontWeight:400, display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() => setAiExpanded(!aiExpanded)}>
                  <span>✦</span> {t.ai.title}
                  <span style={{ marginLeft:"auto", fontSize:11, color:"#6b6864", fontWeight:300, letterSpacing:0 }}>
                    {aiExpanded ? "▾" : "▸"}
                  </span>
                </div>

                {aiExpanded && (<>

                {/* Initial Ask button (only show if no conversation yet) */}
                {conversation.length === 0 && !aiLoading && (
                  <button onClick={() => callAI(null, false)} style={{
                    width:"100%", padding:11, background:"transparent",
                    color:"#d4af37", border:"0.5px solid rgba(212,175,55,0.4)",
                    borderRadius:2, fontFamily:"inherit", fontWeight:400, fontSize:10,
                    letterSpacing:2.5, textTransform:"uppercase",
                    cursor:"pointer", transition:"all 0.3s",
                  }}>
                    ✦ {t.ai.askBtn} ✦
                  </button>
                )}

                {aiLoading && conversation.length === 0 && (
                  <div style={{ padding:"10px 12px", background:"rgba(212,175,55,0.04)", border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:2, fontSize:11, color:"#d4af37", fontStyle:"italic" }}>
                    ✦ {t.ai.loading}...
                  </div>
                )}

                {/* Conversation history */}
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

                {/* Suggested follow-ups (only after first AI response) */}
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

                {/* Input box */}
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
