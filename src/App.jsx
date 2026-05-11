import { useState, useEffect, useRef } from "react";

// ─── DATA: 30+ cities ───────────────────────────────────────────────────────
const CITIES = [
  // ASIA
  { id:"chiang_mai", name:"清迈", country:"泰国", region:"东南亚", lat:18.79, lng:98.98,
    sub:"东南亚 FIRE 族首选 · 数字游民天堂",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"月均 $900，完全在预算内，全球 Lean FIRE 最佳目的地之一",
      regular:"Regular FIRE 绰绰有余，可升级住宿和生活品质",
      fat:"生活成本过低，资产闲置，建议配合新加坡作为枢纽",
      barista:"数字游民社区发达，半退休边工作边生活极理想",
      coast:"$1,500/月被动收入即可舒适生活，Coast FIRE 很容易覆盖"
    },
    costs:[
      { label:"月均总计", val:"$900", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"住宿", val:"$300", src:"https://www.expatistan.com/cost-of-living/chiang-mai" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"交通", val:"$80", src:"https://www.grab.com" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"医保", val:"$100", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"本地市场食材便宜 40–60%，自煮省更多", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { t:"租摩托车 $60–80/月，比 Grab 省一半", src:"https://www.expatistan.com/cost-of-living/chiang-mai" },
      { t:"避开尼曼路，古城内找房省 $100–150/月", src:"https://www.facebook.com/groups/chiangmaiexpats" },
    ],
    visa:[
      { t:"旅游签", d:"落地免签 30 天，可延至 90 天", cl:"green", l:"✓ 免签", src:"https://www.thaievisa.go.th" },
      { t:"泰精英签", d:"$15k–30k，可住 5–20 年，FIRE 长居首选", cl:"green", l:"✓ 长居首选", src:"https://www.thailandelite.com" },
      { t:"LTR 长期签", d:"年收入 $80k 或资产 $250k+，10 年有效", cl:"yellow", l:"⚠ 有门槛", src:"https://ltr.boi.go.th" },
    ],
    health:[
      { t:"Bangkok Hospital 国际私立，英语完善", src:"https://www.bangkokhospital.com/chiangmai" },
      { t:"诊所看诊 $20–50，比欧美便宜 80%", src:"https://www.internationalinsurance.com/thailand/health-insurance.php" },
    ],
    ins:[
      { t:"SafetyWing $45/月，全球覆盖", src:"https://safetywing.com/nomad-insurance" },
      { t:"Cigna/Aetna $80–200/月，保障更全", src:"https://www.cigna.com/international" },
    ],
    safety:[
      { t:"泰国最安全城市，外国人犯罪目标极少", src:"https://www.numbeo.com/crime/in/Chiang-Mai" },
      { t:"主要风险：交通事故，务必戴安全帽", src:"https://www.who.int/thailand/news/detail/road-safety" },
    ],
    culture:[
      { t:"入庙脱鞋着装保守，对佛像保持尊重", src:"https://www.tourismthailand.org/Articles/etiquette-in-thailand" },
      { t:"皇室话题绝对回避（冒犯君主罪严苛）", src:"https://www.bbc.com/news/world-asia-29628191" },
    ],
  },
  { id:"bangkok", name:"曼谷", country:"泰国", region:"东南亚", lat:13.75, lng:100.50,
    sub:"国际都市 · 生活选择多元",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"ok" },
    fitNote:{
      lean:"$1,400 接近上限，但可行，需选好区域",
      regular:"Regular FIRE 理想都市选择，国际化资源丰富",
      fat:"Fat FIRE 在曼谷可享受顶级生活，亚洲枢纽",
      barista:"商业氛围浓，远程工作机会多",
      coast:"$1,400/月被动收入勉强够，需谨慎规划"
    },
    costs:[
      { label:"月均总计", val:"$1,400", src:"https://www.numbeo.com/cost-of-living/in/Bangkok" },
      { label:"住宿", val:"$600", src:"https://www.numbeo.com/cost-of-living/in/Bangkok" },
      { label:"餐饮", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Bangkok" },
      { label:"交通", val:"$100", src:"https://www.bts.co.th" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Bangkok" },
      { label:"医保", val:"$120", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"BTS/MRT 月票 $35", src:"https://www.bts.co.th" },
      { t:"Sukhumvit 区贵，Ari/Ladprao 性价比好", src:"https://nomadlist.com/bangkok" },
    ],
    visa:[
      { t:"泰国全国签证", d:"旅游签/精英签/LTR 同清迈", cl:"green", l:"✓", src:"https://www.thailandelite.com" },
    ],
    health:[
      { t:"Bumrungrad 国际医院，全亚洲最知名", src:"https://www.bumrungrad.com" },
    ],
    ins:[
      { t:"Bupa Thailand $80–150/月", src:"https://www.bupa.co.th" },
    ],
    safety:[
      { t:"交通拥堵是最大挑战，犯罪率低", src:"https://www.numbeo.com/crime/in/Bangkok" },
    ],
    culture:[
      { t:"比清迈更国际化，英语普及", src:"https://www.tourismthailand.org" },
    ],
  },
  { id:"ho_chi_minh", name:"胡志明市", country:"越南", region:"东南亚", lat:10.82, lng:106.63,
    sub:"超低成本 · 活力年轻城市",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"全球生活成本最低高品质旅居地之一",
      regular:"Regular FIRE 在越南可过非常高品质的生活",
      fat:"生活成本过低，但签证长期居留有限制",
      barista:"咖啡馆文化浓厚，远程工作绝佳",
      coast:"$700/月即可舒适生活，但需注意签证续签"
    },
    costs:[
      { label:"月均总计", val:"$700", src:"https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City" },
      { label:"住宿", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City" },
      { label:"餐饮", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City" },
      { label:"交通", val:"$60", src:"https://www.grab.com/vn" },
      { label:"娱乐", val:"$120", src:"https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City" },
      { label:"医保", val:"$80", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"街边越南粉 $1–2，咖啡 $0.5", src:"https://www.numbeo.com/cost-of-living/in/Ho-Chi-Minh-City" },
      { t:"摩托车抢包风险，手机不要外露", src:"https://travel.state.gov" },
    ],
    visa:[
      { t:"电子签证（E-Visa）", d:"90 天，境内可延", cl:"green", l:"✓ 方便", src:"https://www.evisa.gov.vn" },
      { t:"无 FIRE 长期签", d:"长居有限制", cl:"red", l:"✗ 长居挑战", src:"https://vietnam.gov.vn" },
    ],
    health:[
      { t:"FV Hospital/Vinmec 国际私立", src:"https://www.fvhospital.com" },
    ],
    ins:[
      { t:"SafetyWing $45/月强烈推荐", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"摩托车密度极高，过马路需小心", src:"https://www.numbeo.com/crime/in/Ho-Chi-Minh-City" },
    ],
    culture:[
      { t:"年轻一代英语进步飞速", src:"https://ef.com/epi" },
    ],
  },
  { id:"hanoi", name:"河内", country:"越南", region:"东南亚", lat:21.03, lng:105.85,
    sub:"千年古都 · 文化深度体验",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$650/月可舒适生活，全球最便宜首都之一",
      regular:"Regular FIRE 可过奢华生活",
      fat:"生活成本过低，但文化深度无可替代",
      barista:"老城区咖啡馆远程工作绝佳",
      coast:"成本极低，Coast FIRE 容易达成"
    },
    costs:[
      { label:"月均总计", val:"$650", src:"https://www.numbeo.com/cost-of-living/in/Hanoi" },
      { label:"住宿", val:"$220", src:"https://www.numbeo.com/cost-of-living/in/Hanoi" },
      { label:"餐饮", val:"$140", src:"https://www.numbeo.com/cost-of-living/in/Hanoi" },
      { label:"交通", val:"$50", src:"https://www.grab.com/vn" },
      { label:"娱乐", val:"$100", src:"https://www.numbeo.com/cost-of-living/in/Hanoi" },
      { label:"医保", val:"$80", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"老城区（Old Quarter）是文化心脏，但喧闹", src:"https://nomadlist.com/hanoi" },
      { t:"湖区（Tay Ho）外国人聚集，更安静", src:"https://nomadlist.com/hanoi" },
    ],
    visa:[
      { t:"电子签证 90 天", d:"境内可延", cl:"green", l:"✓", src:"https://www.evisa.gov.vn" },
    ],
    health:[
      { t:"Vinmec 河内院国际水准", src:"https://vinmec.com" },
    ],
    ins:[
      { t:"SafetyWing/国际医保必备", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"整体安全，扒手在景点存在", src:"https://www.numbeo.com/crime/in/Hanoi" },
    ],
    culture:[
      { t:"千年文化，比胡志明市更传统", src:"https://whc.unesco.org" },
    ],
  },
  { id:"bali", name:"巴厘岛", country:"印尼", region:"东南亚", lat:-8.41, lng:115.19,
    sub:"数字游民天堂 · 灵性旅居地",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,000/月可过精彩生活，乌布/Canggu 选择多",
      regular:"Regular FIRE 可享受顶级别墅生活",
      fat:"成本过低，但海岛风情独特",
      barista:"全球最大数字游民社区之一",
      coast:"$1,000/月被动收入即可舒适旅居"
    },
    costs:[
      { label:"月均总计", val:"$1,000", src:"https://www.numbeo.com/cost-of-living/in/Bali" },
      { label:"住宿", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Bali" },
      { label:"餐饮", val:"$220", src:"https://www.numbeo.com/cost-of-living/in/Bali" },
      { label:"交通", val:"$70", src:"https://www.grab.com/id" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Bali" },
      { label:"医保", val:"$110", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"Canggu 数字游民聚集，乌布更灵性", src:"https://nomadlist.com/canggu" },
      { t:"租摩托车 $50–80/月必需品", src:"https://www.balirentalmotorbike.com" },
    ],
    visa:[
      { t:"B211A 旅游签", d:"60 天，可延 4 次至 180 天", cl:"green", l:"✓ 方便", src:"https://www.imigrasi.go.id" },
      { t:"E33G 数字游民签", d:"1 年，需远程工作证明", cl:"yellow", l:"⚠ 需证明", src:"https://molina.imigrasi.go.id" },
    ],
    health:[
      { t:"BIMC Hospital 库塔分院，外籍人士首选", src:"https://www.bimcbali.com" },
    ],
    ins:[
      { t:"World Nomads/SafetyWing 必备", src:"https://www.worldnomads.com" },
    ],
    safety:[
      { t:"整体安全，骑摩托需谨慎", src:"https://www.numbeo.com/crime/in/Denpasar" },
    ],
    culture:[
      { t:"巴厘印度教文化深厚，仪式繁多", src:"https://www.indonesia.travel" },
    ],
  },
  { id:"penang", name:"槟城", country:"马来西亚", region:"东南亚", lat:5.41, lng:100.33,
    sub:"美食天堂 · MM2H 签证友好",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,000/月舒适生活，美食成本极低",
      regular:"Regular FIRE 可过奢侈海岛生活",
      fat:"生活成本偏低，但环境优美",
      barista:"英语普及，远程工作便利",
      coast:"MM2H 签证 + 低成本，Coast FIRE 极适合"
    },
    costs:[
      { label:"月均总计", val:"$1,000", src:"https://www.numbeo.com/cost-of-living/in/Penang" },
      { label:"住宿", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Penang" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Penang" },
      { label:"交通", val:"$80", src:"https://www.rapidkl.com.my" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Penang" },
      { label:"医保", val:"$120", src:"https://www.aia.com.my" },
    ],
    tips:[
      { t:"美食世界级，街边小贩 $2–3 一餐", src:"https://www.cnn.com/travel/article/penang-best-food-cities/index.html" },
      { t:"乔治市世界文化遗产，租房选择多", src:"https://whc.unesco.org/en/list/1223" },
    ],
    visa:[
      { t:"MM2H 第二家园", d:"定存 50 万令吉（$11k），10 年居留", cl:"green", l:"✓ FIRE 首选", src:"https://www.mm2h.gov.my" },
    ],
    health:[
      { t:"Gleneagles 槟城国际水准", src:"https://www.gleneagles.com.my/penang" },
    ],
    ins:[
      { t:"AIA/Prudential $60–150/月", src:"https://www.aia.com.my" },
    ],
    safety:[
      { t:"槟城整体非常安全", src:"https://www.numbeo.com/crime/in/George-Town-Penang-Malaysia" },
    ],
    culture:[
      { t:"华人占多数，华语广东话通用", src:"https://www.tourism.gov.my" },
    ],
  },
  { id:"manila", name:"马尼拉", country:"菲律宾", region:"东南亚", lat:14.60, lng:120.98,
    sub:"英语通用 · 海岛跳板",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,000/月可舒适生活，英语零障碍",
      regular:"Regular FIRE 可过非常体面的生活",
      fat:"生活成本偏低",
      barista:"英语普及，远程工作天堂",
      coast:"成本低，被动收入容易覆盖"
    },
    costs:[
      { label:"月均总计", val:"$1,000", src:"https://www.numbeo.com/cost-of-living/in/Manila" },
      { label:"住宿", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Manila" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Manila" },
      { label:"交通", val:"$80", src:"https://www.grab.com/ph" },
      { label:"娱乐", val:"$180", src:"https://www.numbeo.com/cost-of-living/in/Manila" },
      { label:"医保", val:"$140", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"BGC 是外籍人士首选区域，最安全", src:"https://nomadlist.com/manila" },
      { t:"7000+ 海岛，旅行成本极低", src:"https://www.philippines.travel" },
    ],
    visa:[
      { t:"SRRV 退休签", d:"$10k–50k 存款，永久居留", cl:"green", l:"✓ 退休友好", src:"https://www.pra.gov.ph" },
    ],
    health:[
      { t:"St. Luke's Medical Center 亚洲顶尖", src:"https://www.stlukes.com.ph" },
    ],
    ins:[
      { t:"SafetyWing/Cigna $45–150/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"避开特定贫民区，BGC/Makati 安全", src:"https://www.numbeo.com/crime/in/Manila" },
    ],
    culture:[
      { t:"英语官方语言之一，沟通无障碍", src:"https://ef.com/epi" },
    ],
  },
  { id:"taipei", name:"台北", country:"台湾", region:"东南亚", lat:25.03, lng:121.57,
    sub:"华语环境 · 全球最佳医保",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,500 接近上限，但医保极便宜可抵消",
      regular:"Regular FIRE 完美选择，华语 + 顶级医疗",
      fat:"Fat FIRE 在台北可过精致生活",
      barista:"国际化都市，远程工作便利",
      coast:"健保 $30–50/月 + 低成本，Coast FIRE 极佳"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"住宿", val:"$600", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"餐饮", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"交通", val:"$80", src:"https://english.metro.taipei" },
      { label:"娱乐", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"医保", val:"$50", src:"https://www.nhi.gov.tw" },
    ],
    tips:[
      { t:"健保月费 $30–50，全球最划算", src:"https://www.nhi.gov.tw" },
      { t:"夜市 $3–5 吃饱一餐", src:"https://www.taipeitravel.net" },
    ],
    visa:[
      { t:"Gold Card 数字游民签", d:"专业人才，1–3 年含工作权", cl:"yellow", l:"⚠ 技能门槛", src:"https://goldcard.nat.gov.tw" },
    ],
    health:[
      { t:"全民健保全球最佳之一，6 月后可加入", src:"https://www.nhi.gov.tw" },
    ],
    ins:[
      { t:"健保为主，富邦/国泰补充 $30–80/月", src:"https://www.cathaylife.com.tw" },
    ],
    safety:[
      { t:"亚洲最安全地区之一", src:"https://www.numbeo.com/crime/in/Taipei" },
    ],
    culture:[
      { t:"华语主流，热情好客", src:"https://www.taiwan.gov.tw" },
    ],
  },
  { id:"kuala_lumpur", name:"吉隆坡", country:"马来西亚", region:"东南亚", lat:3.14, lng:101.69,
    sub:"英语通用 · MM2H 签证",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,200 接近上限，但英语通用降低适应成本",
      regular:"Regular FIRE 极适合，MM2H 签证理想",
      fat:"Fat FIRE 在吉隆坡可享受国际化便利",
      barista:"英语普及 + 国际化，远程工作便利",
      coast:"MM2H + 低成本，Coast FIRE 极适合"
    },
    costs:[
      { label:"月均总计", val:"$1,200", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"住宿", val:"$450", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"餐饮", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"交通", val:"$100", src:"https://www.grab.com/my" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"医保", val:"$120", src:"https://www.aia.com.my" },
    ],
    tips:[
      { t:"MM2H 是 FIRE 长居最佳方案", src:"https://www.mm2h.gov.my" },
      { t:"Grab 市区 $2–5/次", src:"https://www.grab.com/my" },
    ],
    visa:[
      { t:"MM2H 第二家园", d:"定存 50 万令吉（$11k），10 年居留", cl:"green", l:"✓ FIRE 设计", src:"https://www.mm2h.gov.my" },
      { t:"DE Rantau 数字游民签", d:"月收入 $2,400+", cl:"yellow", l:"⚠ 收入门槛", src:"https://mdec.my/derantau" },
    ],
    health:[
      { t:"Gleneagles/Pantai 私立国际水准", src:"https://www.gleneagles.com.my" },
    ],
    ins:[
      { t:"AIA/Prudential $60–150/月", src:"https://www.aia.com.my" },
    ],
    safety:[
      { t:"整体安全，旅游区扒手注意", src:"https://www.numbeo.com/crime/in/Kuala-Lumpur" },
    ],
    culture:[
      { t:"华人 23%，华语广东话通用", src:"https://www.tourism.gov.my" },
    ],
  },
  { id:"singapore", name:"新加坡", country:"新加坡", region:"东南亚", lat:1.35, lng:103.82,
    sub:"亚洲枢纽 · 顶级安全和医疗",
    fit:{ lean:"poor", regular:"poor", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"$3,000 远超 Lean 预算，完全不适合",
      regular:"勉强可行，但生活质量受限",
      fat:"Fat FIRE 亚洲首选，世界级一切",
      barista:"成本高，需高收入兼职才可行",
      coast:"被动收入需 $3,000+，挑战极大"
    },
    costs:[
      { label:"月均总计", val:"$3,000", src:"https://www.numbeo.com/cost-of-living/in/Singapore" },
      { label:"住宿", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Singapore" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Singapore" },
      { label:"交通", val:"$150", src:"https://www.smrt.com.sg" },
      { label:"娱乐", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Singapore" },
      { label:"医保", val:"$300", src:"https://www.moh.gov.sg" },
    ],
    tips:[
      { t:"小贩中心 $3–5 吃饭，市区交通便利", src:"https://www.visitsingapore.com" },
      { t:"组屋市场租金低于公寓 30%", src:"https://www.hdb.gov.sg" },
    ],
    visa:[
      { t:"Global Investor Programme", d:"$2.5M 投资可获 PR", cl:"yellow", l:"⚠ 高门槛", src:"https://www.edb.gov.sg" },
    ],
    health:[
      { t:"亚洲顶级医疗，世界排名前 5", src:"https://www.moh.gov.sg" },
    ],
    ins:[
      { t:"国际医保 $200–500/月", src:"https://www.aia.com.sg" },
    ],
    safety:[
      { t:"全球最安全国家之一", src:"https://www.numbeo.com/crime/in/Singapore" },
    ],
    culture:[
      { t:"多元种族，英语为行政语言", src:"https://www.gov.sg" },
    ],
  },
  { id:"osaka", name:"大阪", country:"日本", region:"东南亚", lat:34.69, lng:135.50,
    sub:"文化深度 · 全球最安全",
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"$2,100 超出预算，且无 FIRE 签证",
      regular:"勉强可行，但签证最大挑战",
      fat:"Fat FIRE 文化体验地，需努力解决签证",
      barista:"高度人才签需技能",
      coast:"签证几乎无解，不推荐"
    },
    costs:[
      { label:"月均总计", val:"$2,100", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"住宿", val:"$800", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"交通", val:"$150", src:"https://www.osakametro.co.jp/en" },
      { label:"娱乐", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"医保", val:"$200", src:"https://www.mhlw.go.jp" },
    ],
    tips:[
      { t:"比东京便宜 30–40%，日本 FIRE 最佳选择", src:"https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Japan&city1=Osaka&country2=Japan&city2=Tokyo" },
    ],
    visa:[
      { t:"免签 90 天", d:"短期测试", cl:"green", l:"✓ 免签", src:"https://www.mofa.go.jp" },
      { t:"无 FIRE 签", d:"无被动收入/退休签", cl:"red", l:"✗ 长居挑战", src:"https://www.immi-moj.go.jp" },
    ],
    health:[
      { t:"国民健保 $100–200/月，居留 3 月可加入", src:"https://www.mhlw.go.jp" },
    ],
    ins:[
      { t:"过渡期 SafetyWing $45/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"全球最安全国家之一", src:"https://www.numbeo.com/crime/in/Osaka" },
    ],
    culture:[
      { t:"垃圾分类极严，公共安静", src:"https://www.jnto.go.jp" },
    ],
  },

  // EUROPE
  { id:"lisbon", name:"里斯本", country:"葡萄牙", region:"欧洲", lat:38.72, lng:-9.14,
    sub:"欧洲性价比之王 · D7 签证天堂",
    fit:{ lean:"poor", regular:"great", fat:"ok", barista:"great", coast:"ok" },
    fitNote:{
      lean:"$2,000 超 Lean 预算，需节俭",
      regular:"Regular FIRE 最佳欧洲选择，D7 签证为 FIRE 而生",
      fat:"成本可接受，但 Fat FIRE 可考虑更高端",
      barista:"D8 数字游民签 + 半退休理想",
      coast:"被动收入 $2,000+ 才舒适"
    },
    costs:[
      { label:"月均总计", val:"$2,000", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"住宿", val:"$900", src:"https://www.idealista.pt" },
      { label:"餐饮", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"交通", val:"$80", src:"https://www.carris.pt" },
      { label:"娱乐", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"医保", val:"$200", src:"https://www.advancedcarept.com" },
    ],
    tips:[
      { t:"D7 签证月收入 $1,100+ 即可申请", src:"https://www.sef.pt" },
      { t:"申根居留可自由往返 26 国", src:"https://ec.europa.eu/home-affairs/schengen-area_en" },
    ],
    visa:[
      { t:"D7 被动收入签", d:"月被动收入 $1,100+", cl:"green", l:"✓ FIRE 首选", src:"https://www.sef.pt" },
      { t:"D8 数字游民签", d:"月收入 $3,200+", cl:"yellow", l:"⚠ 收入门槛", src:"https://www.sef.pt" },
    ],
    health:[
      { t:"SNS 国家医疗 D7 后可加入，费用极低", src:"https://www.sns.gov.pt/en" },
    ],
    ins:[
      { t:"私立 Médis $50–150/月", src:"https://www.medis.pt" },
    ],
    safety:[
      { t:"全球最和平国家前 10", src:"https://www.visionofhumanity.org" },
    ],
    culture:[
      { t:"法多音乐 Alfama 区周末体验", src:"https://www.visitportugal.com" },
    ],
  },
  { id:"porto", name:"波尔图", country:"葡萄牙", region:"欧洲", lat:41.16, lng:-8.63,
    sub:"葡萄酒之都 · 比里斯本便宜",
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,600 比里斯本便宜 20%，Lean 边缘",
      regular:"Regular FIRE 极佳，欧洲最具性价比",
      fat:"Fat FIRE 可过非常精致的生活",
      barista:"D8 + 半退休理想",
      coast:"$1,600 被动收入即可舒适"
    },
    costs:[
      { label:"月均总计", val:"$1,600", src:"https://www.numbeo.com/cost-of-living/in/Porto" },
      { label:"住宿", val:"$700", src:"https://www.idealista.pt" },
      { label:"餐饮", val:"$320", src:"https://www.numbeo.com/cost-of-living/in/Porto" },
      { label:"交通", val:"$60", src:"https://www.metrodoporto.pt" },
      { label:"娱乐", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Porto" },
      { label:"医保", val:"$170", src:"https://www.advancedcarept.com" },
    ],
    tips:[
      { t:"波尔图比里斯本便宜 20%，生活品质相同", src:"https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Portugal&city1=Porto&country2=Portugal&city2=Lisbon" },
      { t:"葡萄酒、海鲜文化丰富", src:"https://www.visitportugal.com" },
    ],
    visa:[
      { t:"D7 被动收入签", d:"同葡萄牙全国", cl:"green", l:"✓ FIRE 首选", src:"https://www.sef.pt" },
    ],
    health:[
      { t:"SNS 国家医疗", src:"https://www.sns.gov.pt/en" },
    ],
    ins:[
      { t:"私立医保 $50–150/月", src:"https://www.medis.pt" },
    ],
    safety:[
      { t:"葡萄牙全国安全", src:"https://www.numbeo.com/crime/in/Porto" },
    ],
    culture:[
      { t:"葡萄酒文化历史悠久", src:"https://www.visitportoandnorth.travel" },
    ],
  },
  { id:"berlin", name:"柏林", country:"德国", region:"欧洲", lat:52.52, lng:13.40,
    sub:"创意之都 · 自由开放氛围",
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"great", coast:"poor" },
    fitNote:{
      lean:"$2,400 超 Lean 预算",
      regular:"勉强可行，柏林相对其他德国城市便宜",
      fat:"Fat FIRE 在柏林可享受顶级文化生活",
      barista:"自由职业签 + 半退休理想",
      coast:"被动收入需 $2,400+，挑战大"
    },
    costs:[
      { label:"月均总计", val:"$2,400", src:"https://www.numbeo.com/cost-of-living/in/Berlin" },
      { label:"住宿", val:"$1,100", src:"https://www.numbeo.com/cost-of-living/in/Berlin" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Berlin" },
      { label:"交通", val:"$100", src:"https://www.bvg.de" },
      { label:"娱乐", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Berlin" },
      { label:"医保", val:"$300", src:"https://www.tk.de" },
    ],
    tips:[
      { t:"自由职业签（Freiberufler）适合 FIRE", src:"https://service.berlin.de" },
      { t:"租房市场极紧张，提前规划", src:"https://www.immobilienscout24.de" },
    ],
    visa:[
      { t:"自由职业签", d:"需证明收入和客户", cl:"yellow", l:"⚠ 复杂", src:"https://service.berlin.de" },
    ],
    health:[
      { t:"公立 + 私立医保选择", src:"https://www.bundesgesundheitsministerium.de" },
    ],
    ins:[
      { t:"TK 公立 $200–400/月", src:"https://www.tk.de" },
    ],
    safety:[
      { t:"整体安全，部分区域夜间注意", src:"https://www.numbeo.com/crime/in/Berlin" },
    ],
    culture:[
      { t:"创意文化、夜生活、艺术之都", src:"https://www.visitberlin.de" },
    ],
  },
  { id:"amsterdam", name:"阿姆斯特丹", country:"荷兰", region:"欧洲", lat:52.37, lng:4.90,
    sub:"运河之城 · 国际化高质量",
    fit:{ lean:"poor", regular:"poor", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"成本远超预算",
      regular:"Regular 也偏紧，住房成本极高",
      fat:"Fat FIRE 可享欧洲精致生活",
      barista:"DAFT 创业签可行",
      coast:"被动收入压力大"
    },
    costs:[
      { label:"月均总计", val:"$3,200", src:"https://www.numbeo.com/cost-of-living/in/Amsterdam" },
      { label:"住宿", val:"$1,800", src:"https://www.pararius.com" },
      { label:"餐饮", val:"$600", src:"https://www.numbeo.com/cost-of-living/in/Amsterdam" },
      { label:"交通", val:"$120", src:"https://www.gvb.nl" },
      { label:"娱乐", val:"$450", src:"https://www.numbeo.com/cost-of-living/in/Amsterdam" },
      { label:"医保", val:"$250", src:"https://www.zorgwijzer.nl" },
    ],
    tips:[
      { t:"DAFT 美荷友好条约创业签 $4,500 投资", src:"https://ind.nl/en" },
      { t:"自行车文化，无需汽车", src:"https://www.iamsterdam.com" },
    ],
    visa:[
      { t:"DAFT 美籍创业签", d:"$4,500 商业投资", cl:"yellow", l:"⚠ 仅美籍", src:"https://ind.nl/en" },
    ],
    health:[
      { t:"强制基础医保约 $150/月", src:"https://www.government.nl/topics/health-insurance" },
    ],
    ins:[
      { t:"基础医保 + 补充 $50/月", src:"https://www.zorgwijzer.nl" },
    ],
    safety:[
      { t:"非常安全，自行车小偷常见", src:"https://www.numbeo.com/crime/in/Amsterdam" },
    ],
    culture:[
      { t:"英语普及度全欧最高", src:"https://ef.com/epi" },
    ],
  },
  { id:"barcelona", name:"巴塞罗那", country:"西班牙", region:"欧洲", lat:41.39, lng:2.16,
    sub:"地中海生活 · 加泰文化",
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"远超预算",
      regular:"勉强可行，非盈利签需月 $2,800+",
      fat:"Fat FIRE 理想欧洲选择",
      barista:"数字游民签可行",
      coast:"被动收入需 $2,400+"
    },
    costs:[
      { label:"月均总计", val:"$2,400", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"住宿", val:"$1,200", src:"https://www.idealista.com" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"交通", val:"$100", src:"https://www.tmb.cat" },
      { label:"娱乐", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"医保", val:"$200", src:"https://www.sanitas.es" },
    ],
    tips:[
      { t:"非盈利签需月收入 $2,800+", src:"https://www.exteriores.gob.es" },
      { t:"加泰语 + 西班牙语双语", src:"https://www.barcelona.cat/en" },
    ],
    visa:[
      { t:"非盈利活动签", d:"月 $2,800+，5 年永居", cl:"green", l:"✓ FIRE 路径", src:"https://www.exteriores.gob.es" },
      { t:"数字游民签 DNV", d:"月 $2,600+", cl:"yellow", l:"⚠ 需证明", src:"https://www.interior.gob.es" },
    ],
    health:[
      { t:"SNS 加入后几乎免费", src:"https://www.sanidad.gob.es" },
    ],
    ins:[
      { t:"Sanitas/DKV $80–150/月", src:"https://www.sanitas.es" },
    ],
    safety:[
      { t:"扒手问题严重，景点小心", src:"https://www.numbeo.com/crime/in/Barcelona" },
    ],
    culture:[
      { t:"晚餐 8–11pm，南欧节奏", src:"https://www.barcelona.cat/en" },
    ],
  },
  { id:"madrid", name:"马德里", country:"西班牙", region:"欧洲", lat:40.42, lng:-3.70,
    sub:"西班牙首都 · 文化艺术中心",
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"成本超预算",
      regular:"勉强可行，比巴塞便宜",
      fat:"Fat FIRE 可享精致都市生活",
      barista:"数字游民签可行",
      coast:"被动收入压力中等"
    },
    costs:[
      { label:"月均总计", val:"$2,000", src:"https://www.numbeo.com/cost-of-living/in/Madrid" },
      { label:"住宿", val:"$1,000", src:"https://www.idealista.com" },
      { label:"餐饮", val:"$450", src:"https://www.numbeo.com/cost-of-living/in/Madrid" },
      { label:"交通", val:"$80", src:"https://www.crtm.es" },
      { label:"娱乐", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Madrid" },
      { label:"医保", val:"$170", src:"https://www.sanitas.es" },
    ],
    tips:[
      { t:"普拉多博物馆每天 6–8pm 免费", src:"https://www.museodelprado.es" },
      { t:"晚餐文化极晚，10pm 才正常", src:"https://www.spain.info" },
    ],
    visa:[
      { t:"非盈利签 / 数字游民签", d:"同西班牙全国", cl:"green", l:"✓", src:"https://www.exteriores.gob.es" },
    ],
    health:[
      { t:"SNS 公立医疗", src:"https://www.sanidad.gob.es" },
    ],
    ins:[
      { t:"私立 $80–150/月", src:"https://www.sanitas.es" },
    ],
    safety:[
      { t:"比巴塞罗那安全", src:"https://www.numbeo.com/crime/in/Madrid" },
    ],
    culture:[
      { t:"皇家马德里、博物馆三角", src:"https://www.esmadrid.com" },
    ],
  },
  { id:"valletta", name:"瓦莱塔", country:"马耳他", region:"欧洲", lat:35.90, lng:14.51,
    sub:"地中海岛国 · 英语官方语言",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,800 边缘可行，英语零障碍",
      regular:"Regular FIRE 极适合，欧盟身份",
      fat:"Fat FIRE 海岛精致生活",
      barista:"游民签 + 半退休理想",
      coast:"$1,800 被动收入即可"
    },
    costs:[
      { label:"月均总计", val:"$1,800", src:"https://www.numbeo.com/cost-of-living/in/Valletta" },
      { label:"住宿", val:"$800", src:"https://www.maltapark.com" },
      { label:"餐饮", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Valletta" },
      { label:"交通", val:"$80", src:"https://www.publictransport.com.mt" },
      { label:"娱乐", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Valletta" },
      { label:"医保", val:"$240", src:"https://www.gov.mt/en/Services-And-Information/Health" },
    ],
    tips:[
      { t:"英语官方语言之一，零适应成本", src:"https://www.gov.mt" },
      { t:"游民签 Nomad Residence 月 $2,700+", src:"https://nomad.residencymalta.gov.mt" },
    ],
    visa:[
      { t:"游民居留签 Nomad", d:"月收入 $2,700+", cl:"yellow", l:"⚠ 需证明", src:"https://nomad.residencymalta.gov.mt" },
      { t:"退休签 MRP", d:"年金证明", cl:"green", l:"✓ 退休友好", src:"https://www.cfr.gov.mt" },
    ],
    health:[
      { t:"公立医保完善，欧盟标准", src:"https://www.gov.mt/en/Services-And-Information/Health" },
    ],
    ins:[
      { t:"国际医保 $100–200/月", src:"https://www.aviva.com" },
    ],
    safety:[
      { t:"全球最安全岛国之一", src:"https://www.numbeo.com/crime/in/Valletta" },
    ],
    culture:[
      { t:"地中海文化 + 英国遗产", src:"https://www.visitmalta.com" },
    ],
  },
  { id:"tbilisi", name:"第比利斯", country:"格鲁吉亚", region:"欧洲", lat:41.69, lng:44.83,
    sub:"365 天免签 · 极低税率",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$900/月完美适合，365 天免签零压力",
      regular:"绰绰有余，可过高品质生活",
      fat:"成本过低，但税务优化（20%）有价值",
      barista:"365 天免签 + 低税，半退休天堂",
      coast:"$1,000 被动收入即舒适，永久免签"
    },
    costs:[
      { label:"月均总计", val:"$900", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"住宿", val:"$350", src:"https://www.ss.ge" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"交通", val:"$50", src:"https://ttc.com.ge/en" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"医保", val:"$100", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"365 天免签，全球最宽松之一", src:"https://migration.gov.ge/en/visa-free-countries" },
      { t:"个人税 20%，小企业 1%", src:"https://rs.ge/en" },
    ],
    visa:[
      { t:"365 天免签", d:"美/欧/加等国免签", cl:"green", l:"✓ 全球最宽松", src:"https://migration.gov.ge/en/visa-free-countries" },
    ],
    health:[
      { t:"医疗仍在发展，复杂手术建议土耳其", src:"https://www.who.int/georgia" },
    ],
    ins:[
      { t:"SafetyWing $45/月必备", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"整体安全，避免阿布哈兹边境", src:"https://travel.state.gov" },
    ],
    culture:[
      { t:"葡萄酒发源地，热情好客", src:"https://georgia.travel" },
    ],
  },
  { id:"budapest", name:"布达佩斯", country:"匈牙利", region:"欧洲", lat:47.50, lng:19.05,
    sub:"多瑙河之都 · 中欧性价比",
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"ok" },
    fitNote:{
      lean:"$1,500 接近上限",
      regular:"Regular FIRE 中欧最佳选择",
      fat:"成本偏低，但签证有限",
      barista:"中欧商业氛围好",
      coast:"$1,500 被动收入勉强够"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"住宿", val:"$650", src:"https://www.ingatlan.com" },
      { label:"餐饮", val:"$320", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"交通", val:"$70", src:"https://bkk.hu/en" },
      { label:"娱乐", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"医保", val:"$180", src:"https://www.medicover.hu" },
    ],
    tips:[
      { t:"温泉浴场是日常消遣", src:"https://www.szechenyibath.com" },
    ],
    visa:[
      { t:"申根免签 90 天", d:"短期测试", cl:"green", l:"✓", src:"https://ec.europa.eu" },
      { t:"GRSP 居留签", d:"投资 $250k 基金，10 年", cl:"yellow", l:"⚠ 投资门槛", src:"https://www.gov.hu" },
    ],
    health:[
      { t:"私立 Medicover 英语完善", src:"https://www.medicover.hu" },
    ],
    ins:[
      { t:"Cigna/AXA $80–150/月", src:"https://www.cigna.com" },
    ],
    safety:[
      { t:"整体安全", src:"https://www.numbeo.com/crime/in/Budapest" },
    ],
    culture:[
      { t:"匈牙利语极难，年轻人英语普及", src:"https://ef.com/epi" },
    ],
  },
  { id:"prague", name:"布拉格", country:"捷克", region:"欧洲", lat:50.08, lng:14.44,
    sub:"百塔之城 · 中欧文化中心",
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"ok" },
    fitNote:{
      lean:"$1,700 边缘可行",
      regular:"Regular FIRE 中欧最佳选择之一",
      fat:"成本偏低",
      barista:"自由职业签 + 半退休理想",
      coast:"被动收入需 $1,700+"
    },
    costs:[
      { label:"月均总计", val:"$1,700", src:"https://www.numbeo.com/cost-of-living/in/Prague" },
      { label:"住宿", val:"$800", src:"https://www.sreality.cz" },
      { label:"餐饮", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Prague" },
      { label:"交通", val:"$50", src:"https://www.dpp.cz/en" },
      { label:"娱乐", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Prague" },
      { label:"医保", val:"$200", src:"https://www.vzp.cz" },
    ],
    tips:[
      { t:"Zivnostensky list 自由职业签易获得", src:"https://www.mvcr.cz/mvcren" },
      { t:"啤酒比水便宜（真的）", src:"https://www.czechtourism.com" },
    ],
    visa:[
      { t:"自由职业签（Zivno）", d:"需收入和注册", cl:"yellow", l:"⚠ 复杂", src:"https://www.mvcr.cz" },
    ],
    health:[
      { t:"VZP 公立医保 $200/月", src:"https://www.vzp.cz" },
    ],
    ins:[
      { t:"私立补充 $80–150/月", src:"https://www.cigna.com" },
    ],
    safety:[
      { t:"非常安全", src:"https://www.numbeo.com/crime/in/Prague" },
    ],
    culture:[
      { t:"中欧文化十字路口", src:"https://www.prague.eu" },
    ],
  },

  // LATIN AMERICA
  { id:"merida", name:"梅里达", country:"墨西哥", region:"拉丁美洲", lat:20.97, lng:-89.62,
    sub:"北美 FIRE 首选 · 最安全墨西哥城市",
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,300 接近上限，但临时居留签门槛低",
      regular:"Regular FIRE 完美，牙科医疗便宜",
      fat:"成本偏低",
      barista:"距美加近，时区友好",
      coast:"$1,300 被动收入即可"
    },
    costs:[
      { label:"月均总计", val:"$1,300", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"住宿", val:"$500", src:"https://www.inmuebles24.com" },
      { label:"餐饮", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"交通", val:"$80", src:"https://www.uber.com/mx" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"医保", val:"$150", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"墨西哥最安全城市", src:"https://mexiconewsdaily.com" },
      { t:"距坎昆 3 小时车程", src:"https://www.google.com/maps" },
    ],
    visa:[
      { t:"临时居留签", d:"月 $1,620+ 或资产 $27k+", cl:"green", l:"✓ FIRE 路径", src:"https://www.inm.gob.mx" },
    ],
    health:[
      { t:"Star Medica 英语服务", src:"https://www.starmedica.com" },
    ],
    ins:[
      { t:"SafetyWing $45–150/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"墨西哥治安最佳", src:"https://www.numbeo.com/crime/in/Merida" },
    ],
    culture:[
      { t:"玛雅文化底蕴", src:"https://www.yucatan.travel" },
    ],
  },
  { id:"mexico_city", name:"墨西哥城", country:"墨西哥", region:"拉丁美洲", lat:19.43, lng:-99.13,
    sub:"美洲文化大都会 · 数字游民热点",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,500 边缘，但 Roma/Condesa 区性价比高",
      regular:"Regular FIRE 完美都市选择",
      fat:"Fat FIRE 可过精致拉美生活",
      barista:"美东时区，远程工作天堂",
      coast:"$1,500 即可舒适"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Mexico-City" },
      { label:"住宿", val:"$700", src:"https://www.inmuebles24.com" },
      { label:"餐饮", val:"$320", src:"https://www.numbeo.com/cost-of-living/in/Mexico-City" },
      { label:"交通", val:"$80", src:"https://www.metro.cdmx.gob.mx" },
      { label:"娱乐", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Mexico-City" },
      { label:"医保", val:"$150", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"Roma/Condesa 是数字游民聚集地", src:"https://nomadlist.com/mexico-city" },
      { t:"街边塔可饼 $1，文化丰富", src:"https://www.cdmxtravel.com" },
    ],
    visa:[
      { t:"临时居留签", d:"同墨西哥全国", cl:"green", l:"✓ FIRE 路径", src:"https://www.inm.gob.mx" },
    ],
    health:[
      { t:"ABC Medical Center 国际水准", src:"https://www.abchospital.com" },
    ],
    ins:[
      { t:"SafetyWing/AXA $45–200/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"游客区安全，避开特定区域", src:"https://www.numbeo.com/crime/in/Mexico-City" },
    ],
    culture:[
      { t:"博物馆密度世界第一", src:"https://www.cdmxtravel.com" },
    ],
  },
  { id:"medellin", name:"麦德林", country:"哥伦比亚", region:"拉丁美洲", lat:6.25, lng:-75.57,
    sub:"永恒之春之城 · 退休签门槛极低",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"退休签月 $684+ 即可，Lean 最容易",
      regular:"绰绰有余，气候完美",
      fat:"成本低，可考虑更国际化城市",
      barista:"门槛极低 + 完美时区",
      coast:"退休签永久有效，Coast FIRE 极佳"
    },
    costs:[
      { label:"月均总计", val:"$1,200", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"住宿", val:"$450", src:"https://www.fincaraiz.com.co" },
      { label:"餐饮", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"交通", val:"$70", src:"https://www.metrodemedellin.gov.co" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"医保", val:"$150", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"全年气候 22–26°C 永恒之春", src:"https://en.wikipedia.org/wiki/Medell%C3%ADn#Climate" },
      { t:"退休签 $684+ 永久有效", src:"https://www.migracioncolombia.gov.co" },
    ],
    visa:[
      { t:"退休签 Pensionado", d:"月被动 $684+，永久", cl:"green", l:"✓ FIRE 设计", src:"https://www.migracioncolombia.gov.co" },
      { t:"数字游民签 DNV", d:"月 $684+，最长 2 年", cl:"green", l:"✓ 门槛极低", src:"https://www.migracioncolombia.gov.co" },
    ],
    health:[
      { t:"Clinica las Vegas 世界级", src:"https://www.clinicalasvegasmed.com" },
    ],
    ins:[
      { t:"SafetyWing/Cigna $45–150/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"安全大幅改善，El Poblado 区安全", src:"https://travel.state.gov" },
    ],
    culture:[
      { t:"Salsa 是日常社交", src:"https://www.colombia.co" },
    ],
  },
  { id:"buenos_aires", name:"布宜诺斯艾利斯", country:"阿根廷", region:"拉丁美洲", lat:-34.60, lng:-58.38,
    sub:"南美巴黎 · 文化艺术之都",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"比索贬值，蓝市汇率使生活成本极低",
      regular:"可过非常高品质生活",
      fat:"成本极低，但经济不稳定是风险",
      barista:"创意氛围浓，半退休理想",
      coast:"$800 被动收入舒适，需注意经济波动"
    },
    costs:[
      { label:"月均总计", val:"$800", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"住宿", val:"$280", src:"https://www.zonaprop.com.ar" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"交通", val:"$50", src:"https://www.buenosaires.gob.ar" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"医保", val:"$90", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"使用美元蓝市汇率折扣极大", src:"https://www.cronista.com" },
      { t:"Palermo/San Telmo 外国人区", src:"https://nomadlist.com/buenos-aires" },
    ],
    visa:[
      { t:"旅游签免签 90 天", d:"可延 90 天", cl:"green", l:"✓ 共 180", src:"https://www.migraciones.gov.ar" },
      { t:"退休签", d:"月收入 $1,200+，经济波动", cl:"yellow", l:"⚠ 经济风险", src:"https://www.migraciones.gov.ar" },
    ],
    health:[
      { t:"公立医院免费，私立 CEMIC 英语好", src:"https://www.cemic.edu.ar" },
    ],
    ins:[
      { t:"国际医保强烈推荐", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"扒手存在，Uber 较安全", src:"https://www.numbeo.com/crime/in/Buenos-Aires" },
    ],
    culture:[
      { t:"探戈、咖啡馆文化", src:"https://whc.unesco.org" },
    ],
  },
  { id:"santiago", name:"圣地亚哥", country:"智利", region:"拉丁美洲", lat:-33.45, lng:-70.66,
    sub:"安第斯山下 · 拉美最安全首都",
    fit:{ lean:"ok", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,500 边缘可行",
      regular:"Regular FIRE 拉美最佳选择之一",
      fat:"Fat FIRE 可过精致山城生活",
      barista:"基础设施好，远程工作便利",
      coast:"$1,500 被动收入即可"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Santiago" },
      { label:"住宿", val:"$650", src:"https://www.portalinmobiliario.com" },
      { label:"餐饮", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Santiago" },
      { label:"交通", val:"$70", src:"https://www.metro.cl" },
      { label:"娱乐", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Santiago" },
      { label:"医保", val:"$180", src:"https://www.fonasa.cl" },
    ],
    tips:[
      { t:"距安第斯滑雪场 1 小时", src:"https://chile.travel" },
      { t:"Providencia/Las Condes 外籍人士区", src:"https://nomadlist.com/santiago" },
    ],
    visa:[
      { t:"临时居留签", d:"需稳定收入证明", cl:"yellow", l:"⚠ 流程复杂", src:"https://www.serviciomigraciones.cl" },
    ],
    health:[
      { t:"Clinica Las Condes 拉美顶尖", src:"https://www.clinicalascondes.cl" },
    ],
    ins:[
      { t:"SafetyWing/Cigna $45–200/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"拉美最安全首都之一", src:"https://www.numbeo.com/crime/in/Santiago-de-Chile" },
    ],
    culture:[
      { t:"葡萄酒、海鲜文化", src:"https://chile.travel" },
    ],
  },
  { id:"lima", name:"利马", country:"秘鲁", region:"拉丁美洲", lat:-12.05, lng:-77.04,
    sub:"美食之都 · 太平洋海岸",
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,000 完美适合",
      regular:"Regular FIRE 极佳，美食世界级",
      fat:"成本偏低",
      barista:"基础设施完善",
      coast:"$1,000 被动收入即可"
    },
    costs:[
      { label:"月均总计", val:"$1,000", src:"https://www.numbeo.com/cost-of-living/in/Lima" },
      { label:"住宿", val:"$400", src:"https://urbania.pe" },
      { label:"餐饮", val:"$220", src:"https://www.numbeo.com/cost-of-living/in/Lima" },
      { label:"交通", val:"$60", src:"https://www.uber.com/pe" },
      { label:"娱乐", val:"$180", src:"https://www.numbeo.com/cost-of-living/in/Lima" },
      { label:"医保", val:"$140", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"Miraflores 海岸区是首选", src:"https://nomadlist.com/lima" },
      { t:"美食世界排名前列，Central 餐厅全球第一", src:"https://www.theworlds50best.com" },
    ],
    visa:[
      { t:"旅游签免签 183 天", d:"可延", cl:"green", l:"✓ 长免签", src:"https://www.gob.pe/migraciones" },
    ],
    health:[
      { t:"Clinica Anglo Americana 私立", src:"https://www.clinicaangloamericana.pe" },
    ],
    ins:[
      { t:"SafetyWing $45/月", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"Miraflores 安全，避特定区域", src:"https://www.numbeo.com/crime/in/Lima" },
    ],
    culture:[
      { t:"印加文化 + 美食圣地", src:"https://www.peru.travel" },
    ],
  },
  { id:"costa_rica", name:"圣何塞", country:"哥斯达黎加", region:"拉丁美洲", lat:9.93, lng:-84.09,
    sub:"生态天堂 · Pura Vida 文化",
    fit:{ lean:"poor", regular:"great", fat:"great", barista:"great", coast:"great" },
    fitNote:{
      lean:"$2,000 超 Lean 预算",
      regular:"Regular FIRE 完美，Pura Vida 文化",
      fat:"Fat FIRE 海岸 + 雨林精致生活",
      barista:"Rentista 签 + 半退休理想",
      coast:"$1,000 退休签 + 被动收入即可"
    },
    costs:[
      { label:"月均总计", val:"$2,000", src:"https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica" },
      { label:"住宿", val:"$900", src:"https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica" },
      { label:"餐饮", val:"$450", src:"https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica" },
      { label:"交通", val:"$100", src:"https://www.uber.com" },
      { label:"娱乐", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/San-Jose-Costa-Rica" },
      { label:"医保", val:"$200", src:"https://www.ccss.sa.cr" },
    ],
    tips:[
      { t:"Pura Vida 国家精神", src:"https://www.visitcostarica.com" },
      { t:"距海滩、雨林、火山极近", src:"https://www.visitcostarica.com" },
    ],
    visa:[
      { t:"退休签 Pensionado", d:"月 $1,000+ 永久", cl:"green", l:"✓ 退休友好", src:"https://www.migracion.go.cr" },
      { t:"Rentista 签", d:"月 $2,500+ 或定存 $60k", cl:"yellow", l:"⚠ 较高", src:"https://www.migracion.go.cr" },
    ],
    health:[
      { t:"CCSS 公立医疗中美洲最佳", src:"https://www.ccss.sa.cr" },
    ],
    ins:[
      { t:"CCSS 加入 $80–150/月", src:"https://www.ccss.sa.cr" },
    ],
    safety:[
      { t:"中美洲最安全国家", src:"https://www.numbeo.com/crime/in/San-Jose-Costa-Rica" },
    ],
    culture:[
      { t:"无常备军，环保中立", src:"https://www.visitcostarica.com" },
    ],
  },

  // MIDDLE EAST
  { id:"dubai", name:"迪拜", country:"阿联酋", region:"中东", lat:25.20, lng:55.27,
    sub:"零税率天堂 · Fat FIRE 首选",
    fit:{ lean:"poor", regular:"poor", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"远超预算",
      regular:"超出大部分 Regular 预算",
      fat:"Fat FIRE 首选 — 零所得税",
      barista:"成本过高",
      coast:"被动收入需 $4,000+"
    },
    costs:[
      { label:"月均总计", val:"$4,000", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"住宿", val:"$2,000", src:"https://www.propertyfinder.ae" },
      { label:"餐饮", val:"$700", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"交通", val:"$200", src:"https://www.rta.ae" },
      { label:"娱乐", val:"$600", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"医保", val:"$350", src:"https://www.dha.gov.ae" },
    ],
    tips:[
      { t:"个人所得税为零", src:"https://u.ae/en" },
      { t:"虚拟工作签需月 $5,000+", src:"https://gdrfad.gov.ae/en/articles/remote-work-visa" },
    ],
    visa:[
      { t:"虚拟工作签", d:"月 $5,000+", cl:"yellow", l:"⚠ 收入门槛", src:"https://gdrfad.gov.ae/en/articles/remote-work-visa" },
      { t:"退休签", d:"55+，资产 $545k+", cl:"yellow", l:"⚠ 高门槛", src:"https://gdrfad.gov.ae" },
    ],
    health:[
      { t:"Cleveland Clinic 世界级", src:"https://my.clevelandclinic.ae" },
    ],
    ins:[
      { t:"Bupa/Daman 高端 $300–600/月", src:"https://www.daman.ae" },
    ],
    safety:[
      { t:"全球最安全城市之一", src:"https://www.numbeo.com/crime/in/Dubai" },
    ],
    culture:[
      { t:"伊斯兰文化，斋月需注意", src:"https://u.ae/en" },
    ],
  },
];

// ─── FIRE TYPE CONFIG ────────────────────────────────────────────────────────
const FIRE_TYPES = {
  lean:    { label:"Lean FIRE",    range:"$1,500–2,000/月", icon:"🌱" },
  regular: { label:"Regular FIRE", range:"$2,000–4,000/月", icon:"🔥" },
  fat:     { label:"Fat FIRE",     range:"$4,000+/月",      icon:"💎" },
  barista: { label:"Barista FIRE", range:"半退休 + 兼职",   icon:"☕" },
  coast:   { label:"Coast FIRE",   range:"被动收入为主",    icon:"🌊" },
};

const FIT_CONFIG = {
  great: { label:"非常适合", color:"#7dd3a8", glow:"emeraldGlow", bg:"rgba(125,211,168,0.08)", border:"rgba(125,211,168,0.4)" },
  ok:    { label:"勉强可行", color:"#7ba6d4", glow:"sapphireGlow", bg:"rgba(123,166,212,0.08)", border:"rgba(123,166,212,0.4)" },
  poor:  { label:"不推荐",   color:"#c45c6e", glow:null, bg:"rgba(196,92,110,0.08)", border:"rgba(196,92,110,0.4)" },
};

const TAG_STYLE = {
  green:  { background:"rgba(125,211,168,0.15)", color:"#7dd3a8", border:"rgba(125,211,168,0.3)" },
  yellow: { background:"rgba(212,175,55,0.15)",  color:"#d4af37", border:"rgba(212,175,55,0.3)" },
  red:    { background:"rgba(196,92,110,0.15)",  color:"#c45c6e", border:"rgba(196,92,110,0.3)" },
};

const TABS = [
  { key:0, label:"成本" },
  { key:1, label:"签证" },
  { key:2, label:"医保" },
  { key:3, label:"安全" },
];

export default function App() {
  const [fireType, setFireType] = useState("lean");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [25, 20],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: true,
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
      glow.style.cssText = `
        position:absolute;inset:0;border-radius:50%;
        transition:all 0.3s ease;
      `;

      const main = document.createElement("div");
      main.style.cssText = `
        position:absolute;top:50%;left:50%;
        width:9px;height:9px;border-radius:50%;
        transform:translate(-50%,-50%);
        transition:all 0.3s ease;
      `;

      wrapper.appendChild(glow);
      wrapper.appendChild(main);

      const icon = L.divIcon({ html: wrapper, className:"", iconSize:[30,30], iconAnchor:[15,15] });
      const marker = L.marker([city.lat, city.lng], { icon })
        .addTo(map)
        .bindTooltip(city.name, {
          permanent: false,
          direction: "top",
          className: "lux-tooltip",
          offset: [0, -8],
        });

      marker.on("click", () => selectCity(city));
      markersRef.current[city.id] = { marker, glow, main };
    });

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Update markers by fit
  useEffect(() => {
    CITIES.forEach(city => {
      const m = markersRef.current[city.id];
      if (!m) return;
      const fitKey = city.fit[fireType];
      const fit = FIT_CONFIG[fitKey];
      const isSelected = selected?.id === city.id;

      if (fitKey === "great") {
        m.glow.style.background = `radial-gradient(circle, ${fit.color}55 0%, transparent 70%)`;
        m.main.style.background = fit.color;
        m.main.style.boxShadow = `0 0 8px ${fit.color}99`;
        m.main.style.width = isSelected ? "13px" : "9px";
        m.main.style.height = isSelected ? "13px" : "9px";
      } else if (fitKey === "ok") {
        m.glow.style.background = `radial-gradient(circle, ${fit.color}33 0%, transparent 70%)`;
        m.main.style.background = fit.color;
        m.main.style.boxShadow = `0 0 4px ${fit.color}66`;
        m.main.style.opacity = "0.85";
        m.main.style.width = isSelected ? "11px" : "7px";
        m.main.style.height = isSelected ? "11px" : "7px";
      } else {
        m.glow.style.background = "transparent";
        m.main.style.background = "transparent";
        m.main.style.border = `1.5px solid ${fit.color}`;
        m.main.style.opacity = "0.6";
        m.main.style.width = isSelected ? "10px" : "7px";
        m.main.style.height = isSelected ? "10px" : "7px";
        m.main.style.boxShadow = "none";
      }

      if (isSelected) {
        m.main.style.boxShadow += `, 0 0 0 2px #d4af37`;
      }
    });
  }, [fireType, selected]);

  function selectCity(city) {
    setSelected(city);
    setActiveTab(0);
    setAiText("");
    setAiLoading(false);
    leafletMap.current?.flyTo([city.lat, city.lng], Math.max(leafletMap.current.getZoom(), 4), { duration: 0.8 });
  }

  async function askAI() {
    if (aiLoading || !selected) return;
    setAiLoading(true);
    setAiText("");
    const p = FIRE_TYPES[fireType];
    const fit = FIT_CONFIG[selected.fit[fireType]];
    const prompt = `你是 FIRE 财务独立提前退休专家。
用户是 ${p.label} 类型（目标 ${p.range}），考虑在 ${selected.country} · ${selected.name} 旅居。
该城市对 ${p.label} 的适合度评级是：${fit.label}。
月均生活成本约 ${selected.costs[0].val}。

请用中文提供个性化分析（约 200 字），涵盖：
1) 详细解释为什么这个城市对 ${p.label} 是"${fit.label}"
2) 最重要的签证建议（1–2 条具体方案）
3) 医保最优策略
4) 一个常被忽略但极有价值的实用提示

语气像有丰富经验的旅居 FIRE 族前辈，真实接地气。`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setAiText("错误：" + (data.error || "未知错误"));
        setAiLoading(false);
        return;
      }
      const text = data.text;
      let i = 0;
      const iv = setInterval(() => {
        setAiText(t => t + text[i]);
        i++;
        if (i >= text.length) { clearInterval(iv); setAiLoading(false); }
      }, 14);
    } catch {
      setAiText("网络问题，请稍后重试。");
      setAiLoading(false);
    }
  }

  const fit = selected ? FIT_CONFIG[selected.fit[fireType]] : null;
  const fitNote = selected ? selected.fitNote[fireType] : null;

  function renderTabContent() {
    if (!selected) return null;
    const styles = {
      sec: { fontSize:9, letterSpacing:3, color:"#d4af37", textTransform:"uppercase", marginBottom:14, marginTop:0, fontWeight:400 },
      row: { padding:"10px 0", borderBottom:"0.5px solid rgba(212,175,55,0.08)", fontSize:12, color:"#a8a59f", lineHeight:1.7, display:"flex", gap:10, alignItems:"flex-start", fontWeight:300 },
      arr: { color:"#d4af37", fontSize:11, lineHeight:1.5, flexShrink:0 },
      link: { color:"#6b6864", fontSize:10, textDecoration:"none", flexShrink:0 },
    };

    const renderList = (items) => items.map((item, i) => (
      <div key={i} style={styles.row}>
        <span style={styles.arr}>—</span>
        <span style={{ flex:1 }}>{item.t || item}</span>
        {item.src && <a href={item.src} target="_blank" rel="noopener noreferrer" style={styles.link}>↗</a>}
      </div>
    ));

    if (activeTab === 0) return (
      <div>
        <div style={styles.sec}>省钱贴士</div>
        {renderList(selected.tips)}
      </div>
    );
    if (activeTab === 1) return (
      <div>
        <div style={styles.sec}>签证类型</div>
        {selected.visa.map((v, i) => {
          const ts = TAG_STYLE[v.cl] || TAG_STYLE.yellow;
          return (
            <div key={i} style={styles.row}>
              <span style={styles.arr}>—</span>
              <div style={{ flex:1 }}>
                <strong style={{ color:"#e8e6df", fontWeight:500 }}>{v.t}</strong>
                <br/><span>{v.d}</span><br/>
                <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:100, fontSize:9, fontWeight:500, marginTop:5, background:ts.background, color:ts.color, border:`0.5px solid ${ts.border}`, letterSpacing:1, textTransform:"uppercase" }}>{v.l}</span>
              </div>
              {v.src && <a href={v.src} target="_blank" rel="noopener noreferrer" style={styles.link}>↗</a>}
            </div>
          );
        })}
      </div>
    );
    if (activeTab === 2) return (
      <div>
        <div style={styles.sec}>医疗体系</div>
        {renderList(selected.health)}
        <div style={{ ...styles.sec, marginTop:18 }}>保险建议</div>
        {renderList(selected.ins)}
      </div>
    );
    if (activeTab === 3) return (
      <div>
        <div style={styles.sec}>安全状况</div>
        {renderList(selected.safety)}
        <div style={{ ...styles.sec, marginTop:18 }}>文化考量</div>
        {renderList(selected.culture)}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0e0e10", fontFamily:"'Inter','PingFang SC','Microsoft YaHei',system-ui,sans-serif", color:"#e8e6df", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        .lux-tooltip { background:rgba(14,14,16,0.95)!important; border:0.5px solid rgba(212,175,55,0.3)!important; color:#e8e6df!important; font-family:'Inter',system-ui,sans-serif!important; font-size:11px!important; padding:5px 12px!important; border-radius:4px!important; box-shadow:0 4px 16px rgba(0,0,0,0.5)!important; letter-spacing:0.3px!important; }
        .lux-tooltip::before { display:none!important; }
        .leaflet-control-zoom a { background:#131315!important; color:#d4af37!important; border:0.5px solid rgba(212,175,55,0.2)!important; font-family:'Inter',sans-serif!important; }
        .leaflet-control-zoom a:hover { background:#1a1a1c!important; }
        .leaflet-control-attribution { background:rgba(14,14,16,0.85)!important; color:#6b6864!important; font-size:9px!important; }
        .leaflet-control-attribution a { color:#8a8884!important; }
        .leaflet-container { background:#050810!important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.2); border-radius:2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", borderBottom:"0.5px solid rgba(212,175,55,0.12)", background:"linear-gradient(180deg,#131315 0%,#0e0e10 100%)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:38, height:38, border:"0.5px solid rgba(212,175,55,0.4)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <div style={{ position:"absolute", inset:4, border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:"50%" }}/>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#d4af37" strokeWidth="0.8" opacity="0.7"/>
              <path d="M12 3 Q 7 12 12 21 Q 17 12 12 3 Z" stroke="#d4af37" strokeWidth="0.6" fill="none" opacity="0.5"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="#d4af37" strokeWidth="0.6" opacity="0.5"/>
              <circle cx="12" cy="12" r="1.2" fill="#d4af37"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, letterSpacing:1, color:"#d4af37" }}>
              FIRE<span style={{ fontStyle:"italic", fontWeight:400, color:"#e8e6df" }}>nomad</span>
            </div>
            <div style={{ fontSize:9, letterSpacing:4, color:"#6b6864", textTransform:"uppercase", marginTop:2, fontWeight:300 }}>独立旅居图鉴 · {CITIES.length} 城市</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:0, border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:100, overflow:"hidden", background:"#131315" }}>
          {Object.entries(FIRE_TYPES).map(([k, v], i) => (
            <button key={k} onClick={() => setFireType(k)} style={{
              padding:"6px 14px",
              border:"none",
              borderRight: i < 4 ? "0.5px solid rgba(212,175,55,0.08)" : "none",
              background: fireType===k ? "linear-gradient(180deg,#d4af37 0%,#b8941f 100%)" : "transparent",
              color: fireType===k ? "#0e0e10" : "#6b6864",
              fontSize:11, fontWeight: fireType===k ? 500 : 400,
              cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3,
              transition:"all 0.2s",
            }}>
              {v.label.replace(" FIRE","")}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:10, color:"#6b6864", letterSpacing:2, textTransform:"uppercase", fontWeight:300 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#d4af37", boxShadow:"0 0 8px rgba(212,175,55,0.6)" }}/>
          AI · LIVE
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, position:"relative", background:"#050810" }}>
          <div ref={mapRef} style={{ width:"100%", height:"100%" }}/>

          <div style={{ position:"absolute", bottom:18, left:18, background:"rgba(14,14,16,0.92)", border:"0.5px solid rgba(212,175,55,0.18)", borderRadius:"var(--border-radius-md, 8px)", padding:"12px 16px", backdropFilter:"blur(10px)", zIndex:1000 }}>
            <div style={{ fontSize:9, letterSpacing:3, color:"#6b6864", textTransform:"uppercase", marginBottom:9, fontWeight:300 }}>
              {FIRE_TYPES[fireType].label} 适合度
            </div>
            {Object.entries(FIT_CONFIG).map(([k,v]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:9, fontSize:11, color:"#a8a59f", marginBottom:5, fontWeight:300 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:k==="poor"?"transparent":v.color, border:k==="poor"?`1px solid ${v.color}`:"none" }}/>
                {v.label}
              </div>
            ))}
          </div>

          {!selected && (
            <div style={{ position:"absolute", top:18, left:"50%", transform:"translateX(-50%)", background:"rgba(14,14,16,0.85)", border:"0.5px solid rgba(212,175,55,0.2)", borderRadius:100, padding:"7px 18px", fontSize:10, color:"#8a8884", letterSpacing:1.5, textTransform:"uppercase", fontWeight:300, backdropFilter:"blur(8px)", zIndex:1000, pointerEvents:"none" }}>
              点击城市 · 滚轮缩放 · 拖拽
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div style={{ width: selected ? 360 : 0, background:"#0e0e10", borderLeft:"0.5px solid rgba(212,175,55,0.12)", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.3s ease", flexShrink:0 }}>
          {selected && (
            <div style={{ width:360, display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              <div style={{ padding:"22px 26px 18px", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0, position:"relative" }}>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:18, right:20, width:22, height:22, borderRadius:"50%", background:"transparent", border:"0.5px solid rgba(212,175,55,0.3)", color:"#8a8884", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

                <div style={{ fontSize:9, letterSpacing:4, color:"#6b6864", textTransform:"uppercase", marginBottom:8, fontWeight:300 }}>
                  {selected.country} · {selected.region}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:500, color:"#e8e6df", letterSpacing:0.5, lineHeight:1.1 }}>
                  {selected.name}
                </div>
                <div style={{ fontSize:11, color:"#8a8884", marginTop:8, letterSpacing:0.3, fontWeight:300, lineHeight:1.5 }}>
                  {selected.sub}
                </div>

                <div style={{ height:0.5, background:"linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.3) 50%,transparent 100%)", margin:"16px 0" }}/>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:10, letterSpacing:1.5, color:"#8a8884", textTransform:"uppercase", fontWeight:400 }}>
                    {FIRE_TYPES[fireType].icon} {FIRE_TYPES[fireType].label}
                  </span>
                  <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", fontWeight:500, border:`0.5px solid ${fit.border}`, padding:"3px 10px", borderRadius:100, color:fit.color, background:fit.bg }}>
                    {fit.label}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"#a8a59f", lineHeight:1.7, fontWeight:300 }}>{fitNote}</div>
              </div>

              {/* Cost grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, padding:1, background:"rgba(212,175,55,0.08)", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {selected.costs.map((c) => (
                  <div key={c.label} style={{ background:"#0e0e10", padding:"14px 16px", position:"relative" }}>
                    <div style={{ fontSize:8, letterSpacing:2.5, color:"#6b6864", textTransform:"uppercase", marginBottom:6, fontWeight:300 }}>{c.label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, color:"#d4af37", letterSpacing:0.5 }}>{c.val}</div>
                    <a href={c.src} target="_blank" rel="noopener noreferrer" style={{ position:"absolute", top:10, right:12, fontSize:9, color:"#6b6864", textDecoration:"none" }}>↗</a>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                    flex:1, padding:"12px 4px",
                    fontSize:10, letterSpacing:2.5, textTransform:"uppercase",
                    color: activeTab===t.key ? "#d4af37" : "#6b6864",
                    cursor:"pointer",
                    border:"none",
                    borderBottom: activeTab===t.key ? "1px solid #d4af37" : "1px solid transparent",
                    background:"none", fontFamily:"inherit", fontWeight:400, textAlign:"center",
                    transition:"all 0.2s",
                  }}>{t.label}</button>
                ))}
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"18px 26px" }}>
                {renderTabContent()}
              </div>

              <div style={{ padding:"18px 26px 22px", borderTop:"0.5px solid rgba(212,175,55,0.1)", flexShrink:0 }}>
                <button onClick={askAI} disabled={aiLoading} style={{
                  width:"100%", padding:13,
                  background:"transparent",
                  color:"#d4af37",
                  border:"0.5px solid rgba(212,175,55,0.4)",
                  borderRadius:2,
                  fontFamily:"inherit", fontWeight:400, fontSize:10,
                  letterSpacing:3, textTransform:"uppercase",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  opacity: aiLoading ? 0.5 : 1,
                  transition:"all 0.3s",
                }}>
                  {aiLoading ? "✦  分析中  ✦" : "✦  请 AI 个性化分析  ✦"}
                </button>
                {(aiText || aiLoading) && (
                  <div style={{ marginTop:12, padding:"14px 16px", background:"rgba(212,175,55,0.04)", border:"0.5px solid rgba(212,175,55,0.15)", borderRadius:2, fontSize:12, lineHeight:1.85, color:"#c8c5bd", whiteSpace:"pre-wrap", maxHeight:220, overflowY:"auto", fontWeight:300 }}>
                    {aiText}
                    {aiLoading && <span style={{ color:"#d4af37" }}>▋</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
