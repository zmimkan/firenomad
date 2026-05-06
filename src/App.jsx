import { useState, useEffect, useRef } from "react";

// ─── CITY DATA ────────────────────────────────────────────────────────────────
// fit: how well each FIRE type suits this city
// lean/regular/fat/barista/coast = "great" | "ok" | "poor"
// monthlyMin: realistic minimum for each FIRE type in this city
const CITIES = [
  {
    id:"chiang_mai", name:"清迈", flag:"🇹🇭", country:"泰国", lat:18.79, lng:98.98,
    sub:"东南亚FIRE族首选·数字游民天堂",
    baseCost:900,
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"月均$900，完全在预算内，是全球Lean FIRE最佳目的地之一",
      regular:"月均$900-1,400，Regular FIRE绰绰有余，可升级住宿和生活品质",
      fat:"生活成本过低，Fat FIRE族资产闲置，建议新加坡/迪拜作为枢纽",
      barista:"数字游民社区发达，半退休边工作边生活极理想",
      coast:"被动收入$1,500/月即可舒适生活，Coast FIRE很容易覆盖"
    },
    costs:[
      { label:"月均总计", val:"$900", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"住宿", val:"$300", src:"https://www.expatistan.com/cost-of-living/chiang-mai" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"交通", val:"$80", src:"https://www.grab.com" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { label:"医保估算", val:"$100", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"本地市场食材便宜40-60%，自煮省更多", src:"https://www.numbeo.com/cost-of-living/in/Chiang-Mai" },
      { t:"租摩托车$60-80/月，比Grab省一半", src:"https://www.expatistan.com/cost-of-living/chiang-mai" },
      { t:"避开尼曼路，古城内找房省$100-150/月", src:"https://www.facebook.com/groups/chiangmaiexpats" },
    ],
    visa:[
      { t:"旅游签", d:"落地免签30天，可延至90天", cl:"green", l:"✓ 免签", src:"https://www.thaievisa.go.th" },
      { t:"泰精英签", d:"一次性$15k-30k，可住5-20年，FIRE族长居首选", cl:"green", l:"✓ 长居首选", src:"https://www.thailandelite.com" },
      { t:"LTR长期签", d:"年收入$80k或资产$250k+，10年有效", cl:"yellow", l:"⚠ 有门槛", src:"https://ltr.boi.go.th" },
    ],
    health:[
      { t:"Bangkok Hospital清迈院，国际私立，英语服务完善", src:"https://www.bangkokhospital.com/chiangmai" },
      { t:"诊所看诊$20-50，比欧美便宜80%", src:"https://www.internationalinsurance.com/thailand/health-insurance.php" },
      { t:"牙科/眼科性价比极高，医疗旅游热门目的地", src:"https://www.mdtourismthailand.org" },
    ],
    ins:[
      { t:"SafetyWing $45/月，全球覆盖，最受FIRE族欢迎", src:"https://safetywing.com/nomad-insurance" },
      { t:"Cigna/Aetna $80-200/月，保障更全面", src:"https://www.cigna.com/international" },
      { t:"退休签(OA)需投保：$2.4k门诊+$8.9k住院", src:"https://www.immigration.go.th" },
    ],
    safety:[
      { t:"泰国最安全城市，外国人犯罪目标极少", src:"https://www.numbeo.com/crime/in/Chiang-Mai" },
      { t:"主要风险：交通事故，务必戴安全帽", src:"https://www.who.int/thailand/news/detail/road-safety" },
    ],
    culture:[
      { t:"入庙需脱鞋着装保守，对佛像保持尊重", src:"https://www.tourismthailand.org/Articles/etiquette-in-thailand" },
      { t:"皇室话题绝对回避，冒犯君主罪可判入狱", src:"https://www.bbc.com/news/world-asia-29628191" },
      { t:"清迈华人社区发达，中文餐馆/学校众多", src:"https://www.chiangmaiexpats.com" },
    ],
  },
  {
    id:"lisbon", name:"里斯本", flag:"🇵🇹", country:"葡萄牙", lat:38.72, lng:-9.14,
    sub:"欧洲最具性价比·D7签证天堂",
    baseCost:2000,
    fit:{ lean:"poor", regular:"great", fat:"ok", barista:"great", coast:"ok" },
    fitNote:{
      lean:"月均$2,000超出Lean FIRE预算，生活需相当节俭，建议改考虑东欧或东南亚",
      regular:"Regular FIRE最佳欧洲选择，D7签证专为被动收入设计，申根区自由行",
      fat:"生活成本可接受，但Fat FIRE族可考虑瑞士/摩纳哥获得更高地位",
      barista:"D8数字游民签+半退休收入，非常适合，欧洲生活质量高",
      coast:"需要月被动收入$2,000+才能舒适生活，Coast FIRE需确认收入是否足够"
    },
    costs:[
      { label:"月均总计", val:"$2,000", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"住宿", val:"$900", src:"https://www.idealista.pt" },
      { label:"餐饮", val:"$400", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"交通", val:"$80", src:"https://www.carris.pt" },
      { label:"娱乐", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Lisbon" },
      { label:"医保估算", val:"$200", src:"https://www.advancedcarept.com" },
    ],
    tips:[
      { t:"D7被动收入签专为FIRE族设计，月收入$1,100+即可申请", src:"https://www.sef.pt/en/pages/homepage.aspx" },
      { t:"申根区居留，可自由往返26个欧洲国家", src:"https://ec.europa.eu/home-affairs/schengen-area_en" },
      { t:"NHR税制前10年税务优惠，需专业税务顾问规划", src:"https://www.pwc.pt/en/fiscalidade/nhr.html" },
    ],
    visa:[
      { t:"D7被动收入签", d:"月被动收入$1,100+，5年后可申请永居", cl:"green", l:"✓ FIRE首选", src:"https://www.sef.pt/en/pages/conteudo-detalhe.aspx?nID=100" },
      { t:"D8数字游民签", d:"月收入$3,200+，Barista FIRE适用", cl:"yellow", l:"⚠ 收入门槛", src:"https://www.sef.pt" },
      { t:"黄金签证", d:"投资50万欧元+基金，5年可永居", cl:"yellow", l:"⚠ 高资产门槛", src:"https://www.sef.pt/en/pages/conteudo-detalhe.aspx?nID=97" },
    ],
    health:[
      { t:"SNS国家医疗系统注册后费用极低，D7签持有者可加入", src:"https://www.sns.gov.pt/en/" },
      { t:"私立Luz Saude医院网络，英语服务完善", src:"https://www.luzsaude.pt/en/" },
      { t:"欧盟成员国医疗水准，公立等待时间较长", src:"https://ec.europa.eu/health/state/glance_en" },
    ],
    ins:[
      { t:"SNS国家医疗（D7签注册后，费用极低）", src:"https://www.sns.gov.pt/en/" },
      { t:"私立补充Médis/AdvanceCare $50-150/月", src:"https://www.medis.pt" },
      { t:"申请签证前需购买全面旅行医保（最低3万欧元保额）", src:"https://www.sef.pt" },
    ],
    safety:[
      { t:"全球和平指数前10名，欧洲最安全国家之一", src:"https://www.visionofhumanity.org/maps/#/" },
      { t:"里斯本扒手问题较突出，28号电车/旅游景点尤其注意", src:"https://www.numbeo.com/crime/in/Lisbon" },
    ],
    culture:[
      { t:"法多音乐文化深入人心，Alfama区周末可体验现场", src:"https://whc.unesco.org/en/list/1481" },
      { t:"午餐是正餐，1-3pm多数本地餐厅营业，晚餐通常8pm后", src:"https://www.visitportugal.com" },
      { t:"英语在年轻一代普及，旅游区服务人员英语通", src:"https://ef.com/epi" },
    ],
  },
  {
    id:"barcelona", name:"巴塞罗那", flag:"🇪🇸", country:"西班牙", lat:41.39, lng:2.16,
    sub:"地中海生活·加泰文化之都",
    baseCost:2400,
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"月均$2,400远超Lean FIRE预算，不推荐",
      regular:"勉强可行，非盈利签需月收入$2,800+，生活需较节俭",
      fat:"Fat FIRE理想欧洲生活地，地中海气候+文化+美食+海滩",
      barista:"西班牙数字游民签+半退休收入，生活质量极高",
      coast:"被动收入需超过$2,400才够，Coast FIRE挑战较大"
    },
    costs:[
      { label:"月均总计", val:"$2,400", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"住宿", val:"$1,200", src:"https://www.idealista.com/en/news/residential-rental-spain/barcelona" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"交通", val:"$100", src:"https://www.tmb.cat" },
      { label:"娱乐", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Barcelona" },
      { label:"医保估算", val:"$200", src:"https://www.sanitas.es" },
    ],
    tips:[
      { t:"非盈利活动签（Non-Lucrative）需证明月收入$2,800+", src:"https://www.exteriores.gob.es/Consulados/MIAMI/en/ServiciosConsulares/Pages/index.aspx?scco=Estados+Unidos&scd=14&scca=Visas&scs=Non-lucrative+Residence+Visa" },
      { t:"比马德里生活成本高约20%，但海滩文化值得", src:"https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Spain&city1=Barcelona&country2=Spain&city2=Madrid" },
      { t:"2024年严格管控旅游公寓，找房需提前规划", src:"https://www.barcelona.cat/habitatge" },
    ],
    visa:[
      { t:"非盈利活动签", d:"月$2,800+，每年续签，5年后永居", cl:"green", l:"✓ FIRE主要路径", src:"https://www.exteriores.gob.es" },
      { t:"数字游民签DNV", d:"2023年新推，月$2,600+，1年可续", cl:"yellow", l:"⚠ 需收入证明", src:"https://www.interior.gob.es/opencms/es/prensa/notas-de-prensa/2023/05/1213_notaprensa.html" },
      { t:"黄金签证", d:"2024年巴塞罗那已停止新申请", cl:"red", l:"✗ 已停止", src:"https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-3996" },
    ],
    health:[
      { t:"SNS国家医疗系统，非盈利签持有者通常可加入", src:"https://www.sanidad.gob.es/en/home.htm" },
      { t:"私立Sanitas/Quironsalud英语服务完善", src:"https://www.sanitas.es/sanitas/seguros/es/particulares/index.html" },
    ],
    ins:[
      { t:"Sanitas/DKV私立保险 $80-150/月", src:"https://www.sanitas.es" },
      { t:"申请Non-Lucrative签时需提供私人医保证明", src:"https://www.exteriores.gob.es" },
    ],
    safety:[
      { t:"扒手问题全欧最严重之一，兰布拉大道/地铁需特别注意", src:"https://www.numbeo.com/crime/in/Barcelona" },
      { t:"整体人身安全良好，暴力犯罪少", src:"https://www.osac.gov/Country/Spain/Content/Detail/Report/47c8c8b8" },
    ],
    culture:[
      { t:"西班牙语+加泰语双语城市，英语在旅游区通用", src:"https://www.barcelona.cat/en/" },
      { t:"晚餐8-11pm才是正常时间，南欧生活节奏慢", src:"https://www.spain.info/en/culture/" },
    ],
  },
  {
    id:"tbilisi", name:"第比利斯", flag:"🇬🇪", country:"格鲁吉亚", lat:41.69, lng:44.83,
    sub:"365天免签·极低税率新兴热点",
    baseCost:900,
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"月均$900，完全适合Lean FIRE，365天免签无签证压力",
      regular:"生活成本低，Regular FIRE预算绰绰有余，可过高品质生活",
      fat:"生活成本过低，资产未充分利用，但税务优化（20%个人税）对Fat FIRE很有价值",
      barista:"365天免签+低税率，半退休工作无需担心签证",
      coast:"$1,000/月被动收入即可舒适生活，Coast FIRE非常适合"
    },
    costs:[
      { label:"月均总计", val:"$900", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"住宿", val:"$350", src:"https://www.ss.ge" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"交通", val:"$50", src:"https://ttc.com.ge/en" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Tbilisi" },
      { label:"医保估算", val:"$100", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"大多数国家公民365天无签居留，全球最宽松之一", src:"https://migration.gov.ge/en/visa-free-countries" },
      { t:"个人所得税仅20%，小企业利润税1%，税务极友好", src:"https://rs.ge/en" },
      { t:"第比利斯快速成为数字游民新热点，co-working发达", src:"https://nomadlist.com/tbilisi" },
    ],
    visa:[
      { t:"365天免签", d:"美/欧/加等大多数国家公民无需签证", cl:"green", l:"✓ 全球最宽松之一", src:"https://migration.gov.ge/en/visa-free-countries" },
      { t:"临时居留许可", d:"需有经济活动证明，可申请1-6年", cl:"yellow", l:"⚠ 需经济证明", src:"https://migration.gov.ge" },
    ],
    health:[
      { t:"格鲁吉亚医疗仍在发展中，主要城市有可接受的私立医院", src:"https://www.who.int/georgia" },
      { t:"复杂手术建议转土耳其/德国，医疗撤离险必备", src:"https://safetywing.com" },
    ],
    ins:[
      { t:"SafetyWing $45/月，在格鲁吉亚不可或缺", src:"https://safetywing.com/nomad-insurance" },
      { t:"强烈建议购买含医疗撤离的保险方案", src:"https://www.cigna.com/international" },
    ],
    safety:[
      { t:"整体安全，外国人普遍感觉安全，街头犯罪少", src:"https://www.numbeo.com/crime/in/Tbilisi" },
      { t:"阿布哈兹/南奥塞梯边境地区避免前往", src:"https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Georgia.html" },
    ],
    culture:[
      { t:"热情好客，Tamada祝酒词传统让宴会充满仪式感", src:"https://whc.unesco.org/en/list/1916" },
      { t:"格鲁吉亚是世界上最古老的葡萄酒产地，酒文化是重要社交仪式", src:"https://www.atlasobscura.com/articles/georgia-wine-history" },
    ],
  },
  {
    id:"budapest", name:"布达佩斯", flag:"🇭🇺", country:"匈牙利", lat:47.50, lng:19.05,
    sub:"多瑙河畔·中欧最具性价比城市",
    baseCost:1500,
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"ok" },
    fitNote:{
      lean:"$1,500接近Lean FIRE上限，需节俭，但欧洲文化体验无价",
      regular:"Regular FIRE非常合适，比西欧便宜30-40%，欧盟生活质量",
      fat:"生活成本偏低，Fat FIRE族可过非常舒适的生活，但签证较难",
      barista:"中欧商业氛围好，半退休+当地兼职可行",
      coast:"$1,500/月被动收入刚好覆盖，Coast FIRE可行但较紧张"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"住宿", val:"$650", src:"https://www.ingatlan.com" },
      { label:"餐饮", val:"$320", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"交通", val:"$70", src:"https://bkk.hu/en/" },
      { label:"娱乐", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Budapest" },
      { label:"医保估算", val:"$160", src:"https://www.cigna.com/international" },
    ],
    tips:[
      { t:"比西欧便宜30-40%，文化资源（博物馆/歌剧院）极丰富", src:"https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Hungary&city1=Budapest&country2=Austria&city2=Vienna" },
      { t:"GRSP计划投资$250k匈牙利基金可获10年居留许可", src:"https://www.gov.hu/en/news/2023-11-01-the-guest-investor-program" },
      { t:"温泉浴场文化独特，塞切尼/盖勒特浴场月票约$30", src:"https://www.szechenyibath.com" },
    ],
    visa:[
      { t:"申根免签90天", d:"欧盟外公民180天内可免签90天", cl:"green", l:"✓ 短期免签", src:"https://ec.europa.eu/home-affairs/schengen-area_en" },
      { t:"GRSP客户居留签", d:"投资$250k匈牙利房地产基金，10年居留", cl:"yellow", l:"⚠ 投资门槛", src:"https://www.gov.hu/en" },
    ],
    health:[
      { t:"私立Duna Medical/Medicover英语服务完善，看诊$30-60", src:"https://www.medicover.hu/en" },
      { t:"公立医疗可用但设施较老，英语有限", src:"https://www.who.int/hungary" },
    ],
    ins:[
      { t:"Cigna/AXA国际医保约$80-150/月", src:"https://www.cigna.com/international" },
      { t:"Medicover私立补充保险$50-100/月", src:"https://www.medicover.hu/en" },
    ],
    safety:[
      { t:"整体安全，扒手主要在旅游区和地铁，注意财物", src:"https://www.numbeo.com/crime/in/Budapest" },
    ],
    culture:[
      { t:"匈牙利语与欧洲其他语言无关联，英语在年轻人中普及", src:"https://ef.com/epi" },
      { t:"温泉浴场是日常消遣，不只是旅游景点，当地人每周常去", src:"https://www.szechenyibath.com" },
    ],
  },
  {
    id:"osaka", name:"大阪", flag:"🇯🇵", country:"日本", lat:34.69, lng:135.50,
    sub:"文化深度体验·全球最安全城市",
    baseCost:2100,
    fit:{ lean:"poor", regular:"ok", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"月均$2,100超出预算，且无专属FIRE签证，Lean FIRE不推荐",
      regular:"可行但签证是最大挑战，无被动收入/退休签，需持续解决居留问题",
      fat:"Fat FIRE理想亚洲文化体验地，安全/医疗/文化无与伦比，签证需努力解决",
      barista:"高度人才签可行，适合有专业技能的Barista FIRE族",
      coast:"签证问题几乎无解，Coast FIRE不推荐"
    },
    costs:[
      { label:"月均总计", val:"$2,100", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"住宿", val:"$800", src:"https://www.suumo.jp" },
      { label:"餐饮", val:"$500", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"交通", val:"$150", src:"https://www.osakametro.co.jp/en" },
      { label:"娱乐", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Osaka" },
      { label:"医保估算", val:"$200", src:"https://www.mhlw.go.jp/english" },
    ],
    tips:[
      { t:"大阪比东京便宜30-40%，是日本FIRE族最佳选择", src:"https://www.numbeo.com/cost-of-living/compare_cities.jsp?country1=Japan&city1=Osaka&country2=Japan&city2=Tokyo" },
      { t:"ICOCA交通卡自动享受折扣票价，大幅节省出行费", src:"https://www.westjr.co.jp/global/en/ticket/icoca" },
      { t:"超市接近打烊时折扣熟食可省30-50%食物支出", src:"https://www.japantimes.co.jp/life/2019/02/03/food/discount-supermarket-shopping-japan" },
    ],
    visa:[
      { t:"免签90天", d:"大多数国家适用，适合短期测试", cl:"green", l:"✓ 免签", src:"https://www.mofa.go.jp/j_info/visit/visa" },
      { t:"高度人才签", d:"积分制，需专业技能/学历/收入", cl:"yellow", l:"⚠ 有条件", src:"https://www.immi-moj.go.jp/english/visa/hishu.html" },
      { t:"无专属FIRE签", d:"日本目前无被动收入/退休签类别", cl:"red", l:"✗ 长居最大挑战", src:"https://www.immi-moj.go.jp/english" },
    ],
    health:[
      { t:"国民健保（国民健康保険）外籍长居者可加入，月$100-200", src:"https://www.mhlw.go.jp/english/policy/health-medical/health-insurance/index.html" },
      { t:"保障覆盖率70%，重大疾病有高额疗养费制度上限保护", src:"https://www.mhlw.go.jp/english" },
    ],
    ins:[
      { t:"国民健保（3个月以上居留后必须加入）", src:"https://www.city.osaka.lg.jp/shimin/page/0000006893.html" },
      { t:"短期居留期间用SafetyWing $45/月过渡", src:"https://safetywing.com" },
    ],
    safety:[
      { t:"全球最安全国家之一，失物招领率极高", src:"https://www.numbeo.com/crime/in/Osaka" },
      { t:"地震频繁，Yahoo!防灾速报App（日文）强烈推荐", src:"https://emg.yahoo.co.jp" },
    ],
    culture:[
      { t:"公共场所保持安静，电车不接电话，遵守规则是基本礼仪", src:"https://www.jnto.go.jp/eng/arrange/practical/japanese-etiquette.html" },
      { t:"垃圾分类极严格，分类错误会被退回，需认真学习", src:"https://www.city.osaka.lg.jp/kankyo" },
    ],
  },
  {
    id:"kuala_lumpur", name:"吉隆坡", flag:"🇲🇾", country:"马来西亚", lat:3.14, lng:101.69,
    sub:"英语通用·MM2H签证友好",
    baseCost:1200,
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,200接近预算上限，需较节俭，但英语通用适应成本最低",
      regular:"Regular FIRE非常适合，MM2H签证专为被动收入族设计",
      fat:"生活成本偏低，但东南亚金融枢纽，高净值资产管理方便",
      barista:"英语普及+国际化环境，半退休工作机会多",
      coast:"MM2H签证+低生活成本，Coast FIRE极适合"
    },
    costs:[
      { label:"月均总计", val:"$1,200", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"住宿", val:"$450", src:"https://www.propertyguru.com.my" },
      { label:"餐饮", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"交通", val:"$100", src:"https://www.grab.com/my" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Kuala-Lumpur" },
      { label:"医保估算", val:"$120", src:"https://www.aia.com.my" },
    ],
    tips:[
      { t:"MM2H（第二家园）签证专为退休/被动收入族设计，定存约$11k", src:"https://www.mm2h.gov.my" },
      { t:"英语极普及，全马来西亚与东南亚文化多元融合，适应成本极低", src:"https://ef.com/epi" },
      { t:"Grab打车极便宜，市区出行约$2-5/次", src:"https://www.grab.com/my" },
    ],
    visa:[
      { t:"MM2H第二家园", d:"定存50万令吉（约$11k），可住10年", cl:"green", l:"✓ 专为FIRE设计", src:"https://www.mm2h.gov.my" },
      { t:"DE Rantau数字游民签", d:"月收入$2,400+，12个月可续", cl:"yellow", l:"⚠ 需收入证明", src:"https://mdec.my/derantau" },
      { t:"旅游签", d:"大多数国家免签90天", cl:"green", l:"✓ 免签", src:"https://www.imi.gov.my" },
    ],
    health:[
      { t:"Gleneagles/Pantai私立医院国际水准，英语服务完善", src:"https://www.gleneagles.com.my" },
      { t:"公立医院便宜但等待时间长，外籍人士多选私立", src:"https://www.moh.gov.my" },
    ],
    ins:[
      { t:"AIA/Prudential大马保单$60-150/月，英文理赔方便", src:"https://www.aia.com.my" },
      { t:"MM2H申请本身无强制医保要求，但强烈建议购买", src:"https://www.mm2h.gov.my" },
    ],
    safety:[
      { t:"吉隆坡整体安全，扒手在旅游区和公交站较多", src:"https://www.numbeo.com/crime/in/Kuala-Lumpur" },
    ],
    culture:[
      { t:"华人约23%，华语/广东话通用，华人社区成熟", src:"https://www.dosm.gov.my" },
      { t:"清真Halal主流，但华人区猪肉餐厅易找，饮食多元", src:"https://www.tourismmalaysia.gov.my" },
    ],
  },
  {
    id:"taipei", name:"台北", flag:"🇹🇼", country:"台湾", lat:25.03, lng:121.57,
    sub:"华语环境·全球最佳医保体系",
    baseCost:1500,
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,500接近预算上限，台湾健保极划算，但需解决签证长居问题",
      regular:"华语环境+顶级医保+高生活质量，Regular FIRE极适合",
      fat:"生活成本偏低，Fat FIRE可过非常舒适的生活，文化适应成本最低",
      barista:"Gold Card数字游民签适合有专业技能者，半退休理想",
      coast:"台湾健保+低生活成本，$1,500/月被动收入即可舒适生活"
    },
    costs:[
      { label:"月均总计", val:"$1,500", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"住宿", val:"$600", src:"https://www.591.com.tw" },
      { label:"餐饮", val:"$350", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"交通", val:"$80", src:"https://www.metro.taipei" },
      { label:"娱乐", val:"$250", src:"https://www.numbeo.com/cost-of-living/in/Taipei" },
      { label:"医保估算", val:"$150", src:"https://www.nhi.gov.tw/en" },
    ],
    tips:[
      { t:"悠游卡搭MRT约$0.5-1.5/次，大众运输极方便", src:"https://www.metro.taipei/en" },
      { t:"夜市文化丰富，$3-5可吃饱一餐，夜市是日常生活而非旅游景点", src:"https://travel.taipei/en" },
      { t:"台湾全民健保月费仅$30-50，全球最划算医保体系之一", src:"https://www.nhi.gov.tw/en" },
    ],
    visa:[
      { t:"免签90天", d:"多数国家适用，可申请延签", cl:"green", l:"✓ 免签", src:"https://www.boca.gov.tw/cp-220-4904-73ad8-2.html" },
      { t:"Gold Card数字游民签", d:"需专业技能认证，1-3年含工作权", cl:"yellow", l:"⚠ 有技能门槛", src:"https://goldcard.nat.gov.tw/en" },
    ],
    health:[
      { t:"全民健保全球最佳医疗体系之一，工作/居留满6个月可加入", src:"https://www.nhi.gov.tw/en" },
      { t:"门诊等待时间短，中英双语服务，月费仅$30-50", src:"https://www.nhi.gov.tw/en/Content_List.aspx?n=9B03C1A2F77ED6B9" },
    ],
    ins:[
      { t:"全民健保符合资格后优先加入，全球最划算医保", src:"https://www.nhi.gov.tw/en" },
      { t:"国泰/富邦补充实支实付保险$30-80/月，覆盖健保不含项目", src:"https://www.cathaylife.com.tw/cathaylife/en" },
    ],
    safety:[
      { t:"亚洲最安全地区之一，外国人犯罪率极低", src:"https://www.numbeo.com/crime/in/Taipei" },
      { t:"地震频繁，台湾防灾App（中文）和政府警报系统完善", src:"https://www.nfa.gov.tw/cht/index.php?code=list&flag=detail&ids=18&article_id=3" },
    ],
    culture:[
      { t:"华语主流，热情好客，外国人受欢迎，文化适应成本最低", src:"https://travel.taipei/en" },
      { t:"夜市/小吃/手摇茶饮文化极丰富，生活品质高", src:"https://www.taiwan.net.tw/m1.aspx?sNo=0002138" },
    ],
  },
  {
    id:"merida", name:"梅里达", flag:"🇲🇽", country:"墨西哥", lat:20.97, lng:-89.62,
    sub:"北美FIRE族首选·最安全墨西哥城市",
    baseCost:1300,
    fit:{ lean:"ok", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"$1,300接近Lean FIRE上限，但墨西哥临时居留签条件友好，可行",
      regular:"Regular FIRE极适合，临时居留签门槛低，牙科旅游省钱",
      fat:"生活成本低，但Fat FIRE族可考虑更国际化的城市",
      barista:"距美国/加拿大近，时区友好，半退休远程工作理想",
      coast:"$1,300/月被动收入即可舒适生活，临时居留签相对容易"
    },
    costs:[
      { label:"月均总计", val:"$1,300", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"住宿", val:"$500", src:"https://www.inmuebles24.com" },
      { label:"餐饮", val:"$300", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"交通", val:"$80", src:"https://www.uber.com/mx" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Merida" },
      { label:"医保估算", val:"$150", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"梅里达连续评为墨西哥最安全城市，外籍人士密度高", src:"https://mexiconewsdaily.com/news/merida-safest-city" },
      { t:"临时居留签需证明月收入$1,620或资产$27k，门槛相对低", src:"https://consulmex.sre.gob.mx" },
      { t:"距坎昆仅3小时车程，加勒比海度假极便利", src:"https://www.google.com/maps" },
    ],
    visa:[
      { t:"旅游签FMM", d:"最长180天，大多数国家免签入境", cl:"green", l:"✓ 最多180天", src:"https://www.inm.gob.mx" },
      { t:"临时居留签", d:"月收入$1,620+或资产$27k+，有效1-4年", cl:"green", l:"✓ FIRE常用路径", src:"https://www.inm.gob.mx/gobmx/word/index.php/residencia-temporal" },
    ],
    health:[
      { t:"Star Medica/Centro Medico私立医院英语服务，看诊$20-40", src:"https://www.starmedica.com" },
      { t:"牙科旅游盛行，质量高+价格低，很多美国FIRE族专程前来", src:"https://www.dentistsinmexico.com" },
    ],
    ins:[
      { t:"SafetyWing/CIGNA国际医保$45-150/月", src:"https://safetywing.com" },
      { t:"AXA/GNP墨西哥本地保单$80-200/月，覆盖全国私立医院", src:"https://www.gnp.com.mx" },
    ],
    safety:[
      { t:"梅里达治安在墨西哥最佳，与其他地区形成鲜明对比", src:"https://www.numbeo.com/crime/in/Merida" },
      { t:"当地人友善，外国人受欢迎，外籍社区成熟", src:"https://www.internationaliving.com/countries/mexico/merida" },
    ],
    culture:[
      { t:"玛雅文化底蕴深厚，当地节庆和仪式独特精彩", src:"https://www.yucatan.travel/en" },
      { t:"西班牙语是唯一通用语，学习西语是必要投资", src:"https://ef.com/epi" },
    ],
  },
  {
    id:"medellin", name:"麦德林", flag:"🇨🇴", country:"哥伦比亚", lat:6.25, lng:-75.57,
    sub:"永恒春天之城·退休签门槛极低",
    baseCost:1200,
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"退休签月被动收入$684+即可，Lean FIRE在哥伦比亚最容易实现",
      regular:"Regular FIRE绰绰有余，生活品质高，气候完美",
      fat:"生活成本低，但Fat FIRE族可考虑更国际化城市",
      barista:"数字游民签门槛极低（月$684），半退休工作无压力",
      coast:"$1,200/月被动收入舒适生活，退休签永久有效，Coast FIRE极适合"
    },
    costs:[
      { label:"月均总计", val:"$1,200", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"住宿", val:"$450", src:"https://www.fincaraiz.com.co" },
      { label:"餐饮", val:"$280", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"交通", val:"$70", src:"https://www.metro.gov.co" },
      { label:"娱乐", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Medellin" },
      { label:"医保估算", val:"$150", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"全年气候如春（22-26°C），被誉为永恒春天之城", src:"https://en.wikipedia.org/wiki/Medell%C3%ADn#Climate" },
      { t:"退休签（Pensionado）月被动收入$684+即可，永久有效", src:"https://www.migracioncolombia.gov.co" },
      { t:"El Poblado/Laureles区是外国人首选安全区域", src:"https://nomadlist.com/medellin" },
    ],
    visa:[
      { t:"旅游签免签90天", d:"可延至180天", cl:"green", l:"✓ 免签", src:"https://www.migracioncolombia.gov.co" },
      { t:"退休签Pensionado", d:"月被动收入$684+，永久有效，全球最低门槛之一", cl:"green", l:"✓ 专为FIRE族", src:"https://www.migracioncolombia.gov.co/visas/visas-tipo-v/visa-pensionado" },
      { t:"数字游民签DNV", d:"月收入$684+，最长2年", cl:"green", l:"✓ 门槛极低", src:"https://www.migracioncolombia.gov.co" },
    ],
    health:[
      { t:"Clinica las Vegas/El Rosario私立医院世界级水准", src:"https://www.clinicalasvegasmed.com" },
      { t:"医疗旅游热门目的地，整形外科国际知名，价格是美国1/5", src:"https://www.medicaltourism.com/destinations/colombia" },
    ],
    ins:[
      { t:"SafetyWing/Cigna国际医保$45-150/月", src:"https://safetywing.com" },
      { t:"哥伦比亚EPS医疗系统获居留后可加入，月$60-150", src:"https://www.minsalud.gov.co" },
    ],
    safety:[
      { t:"安全状况大幅改善，但仍需保持警觉，使用Uber/InDrive叫车", src:"https://www.numbeo.com/crime/in/Medellin" },
      { t:"El Poblado区对外国人相对安全，避免夜间前往非旅游区", src:"https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Colombia.html" },
    ],
    culture:[
      { t:"热情外向，Salsa舞蹈是日常社交，学几步会让你融入更快", src:"https://www.colombia.co/en/colombia-culture" },
      { t:"麦德林西班牙语口音清晰，是学西语的理想地方", src:"https://www.bbc.com/travel/article/20191014-the-city-thats-become-a-spanish-learning-destination" },
    ],
  },
  {
    id:"dubai", name:"迪拜", flag:"🇦🇪", country:"UAE", lat:25.20, lng:55.27,
    sub:"零税率天堂·Fat FIRE首选枢纽",
    baseCost:4000,
    fit:{ lean:"poor", regular:"poor", fat:"great", barista:"ok", coast:"poor" },
    fitNote:{
      lean:"月均$4,000远超Lean FIRE预算，完全不适合",
      regular:"$4,000超出大部分Regular FIRE预算，不推荐",
      fat:"Fat FIRE首选——零个人所得税，资产管理便利，世界级医疗安全",
      barista:"生活成本过高，半退休收入难以覆盖，不推荐",
      coast:"被动收入需$4,000+才够，Coast FIRE挑战极大"
    },
    costs:[
      { label:"月均总计", val:"$4,000", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"住宿", val:"$2,000", src:"https://www.propertyfinder.ae" },
      { label:"餐饮", val:"$700", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"交通", val:"$200", src:"https://www.rta.ae" },
      { label:"娱乐", val:"$600", src:"https://www.numbeo.com/cost-of-living/in/Dubai" },
      { label:"医保估算", val:"$350", src:"https://www.dha.gov.ae" },
    ],
    tips:[
      { t:"个人所得税为零，Fat FIRE税务优化极具吸引力", src:"https://u.ae/en/information-and-services/finance-and-investment/taxes-in-uae" },
      { t:"虚拟工作签证1年，需月收入$5,000+，适合远程工作者", src:"https://gdrfad.gov.ae/en/articles/remote-work-visa" },
      { t:"迪拜是中东/非洲/亚洲的绝佳金融枢纽", src:"https://www.difc.ae" },
    ],
    visa:[
      { t:"虚拟工作签证", d:"1年，需月收入$5,000+，可续签", cl:"yellow", l:"⚠ 收入门槛", src:"https://gdrfad.gov.ae/en/articles/remote-work-visa" },
      { t:"退休签", d:"55岁以上，资产$545k+或月收入$5,450+", cl:"yellow", l:"⚠ 高门槛", src:"https://gdrfad.gov.ae/en/articles/retirement-visa" },
      { t:"黄金签证", d:"投资$545k+不动产，10年居留", cl:"yellow", l:"⚠ 投资门槛", src:"https://gcp.gov.ae/en/Pages/GoldenVisa.aspx" },
    ],
    health:[
      { t:"Cleveland Clinic/Mediclinic迪拜，亚洲最先进医疗设施之一", src:"https://my.clevelandclinic.ae" },
      { t:"迪拜居留者强制医保，费用$200-500/月", src:"https://www.dha.gov.ae/en/DubaiHealthInsurance" },
    ],
    ins:[
      { t:"Bupa/Daman高端医保是Fat FIRE族首选，英语理赔", src:"https://www.daman.ae" },
      { t:"迪拜居留者依法强制购买医保，需雇主或个人购买", src:"https://www.dha.gov.ae/en/DubaiHealthInsurance" },
    ],
    safety:[
      { t:"全球最安全城市之一，犯罪率接近零", src:"https://www.numbeo.com/crime/in/Dubai" },
      { t:"文化禁忌严格：公开亲密/同性恋/酒驾有法律风险", src:"https://u.ae/en/information-and-services/social-affairs/moral-conduct" },
    ],
    culture:[
      { t:"伊斯兰文化为主，斋月期间白天公开饮食受限制", src:"https://u.ae/en/information-and-services/social-affairs/ramadan" },
      { t:"极度国际化（90%+为外籍人士），英语是日常工作语言", src:"https://www.government.ae/en/information-and-services/social-affairs/emirates-and-expatriates" },
    ],
  },
  {
    id:"buenos_aires", name:"布宜诺斯艾利斯", flag:"🇦🇷", country:"阿根廷", lat:-34.60, lng:-58.38,
    sub:"南美巴黎·文化艺术之都",
    baseCost:800,
    fit:{ lean:"great", regular:"great", fat:"ok", barista:"great", coast:"great" },
    fitNote:{
      lean:"比索贬值+蓝市汇率，Lean FIRE实际生活成本可低至$600-800",
      regular:"Regular FIRE可过非常高品质的生活，文化艺术气息浓厚",
      fat:"生活成本极低，但经济不稳定是Fat FIRE族的顾虑",
      barista:"文化创意氛围浓厚，半退休做创意/咨询工作极适合",
      coast:"$800/月被动收入可过舒适生活，但经济波动需注意"
    },
    costs:[
      { label:"月均总计", val:"$800", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"住宿", val:"$280", src:"https://www.zonaprop.com.ar" },
      { label:"餐饮", val:"$200", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"交通", val:"$50", src:"https://www.buenosaires.gob.ar/movilidad/transporte-publico" },
      { label:"娱乐", val:"$150", src:"https://www.numbeo.com/cost-of-living/in/Buenos-Aires" },
      { label:"医保估算", val:"$90", src:"https://safetywing.com" },
    ],
    tips:[
      { t:"比索贬值严重，使用美元换蓝市汇率可获极大折扣", src:"https://www.cronista.com/finanzas-mercados/dolar-blue" },
      { t:"Palermo/San Telmo区是外国人最受欢迎区域", src:"https://nomadlist.com/buenos-aires" },
      { t:"阿根廷烤肉（Asado）文化是世界级体验", src:"https://en.wikipedia.org/wiki/Asado" },
    ],
    visa:[
      { t:"旅游签免签90天", d:"可延签一次（共180天），大多数国家适用", cl:"green", l:"✓ 共180天", src:"https://www.migraciones.gov.ar" },
      { t:"退休/被动收入签", d:"需月收入约$1,200+，经济不稳定增加复杂性", cl:"yellow", l:"⚠ 经济波动风险", src:"https://www.migraciones.gov.ar/rentista" },
    ],
    health:[
      { t:"公立医院对所有人免费（包括外国人），质量参差不齐", src:"https://www.buenosaires.gob.ar/salud" },
      { t:"私立CEMIC/Sanatorio Mater Dei英语服务良好", src:"https://www.cemic.edu.ar" },
    ],
    ins:[
      { t:"国际医保强烈推荐，经济不稳定影响本地理赔", src:"https://safetywing.com" },
      { t:"SafetyWing/Cigna $45-150/月，优先选国际保险", src:"https://safetywing.com/nomad-insurance" },
    ],
    safety:[
      { t:"扒手和摩托车抢包问题存在，使用Uber较安全", src:"https://www.numbeo.com/crime/in/Buenos-Aires" },
      { t:"经济动荡偶有社会抗议，关注新闻动态", src:"https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Argentina.html" },
    ],
    culture:[
      { t:"探戈文化发源地，书店和咖啡馆文化极盛，被称为南美巴黎", src:"https://whc.unesco.org/en/list/1185" },
      { t:"西班牙语Rioplatense方言，y/ll发音特殊，学西语的好地方", src:"https://en.wikipedia.org/wiki/Rioplatense_Spanish" },
    ],
  },
];

const FIRE_TYPES = {
  lean:    { label:"Lean FIRE",    range:"$1,500-2,000/月", icon:"🌱", maxBudget:2000, color:"#1d9e75" },
  regular: { label:"Regular FIRE", range:"$2,000-4,000/月", icon:"🔥", maxBudget:4000, color:"#ba7517" },
  fat:     { label:"Fat FIRE",     range:"$4,000+/月",      icon:"💎", maxBudget:99999, color:"#7f77dd" },
  barista: { label:"Barista FIRE", range:"半退休+兼职",      icon:"☕", maxBudget:3000, color:"#e07b39" },
  coast:   { label:"Coast FIRE",   range:"被动收入为主",     icon:"🌊", maxBudget:2500, color:"#2ea8c7" },
};

const FIT_CONFIG = {
  great: { label:"非常适合", color:"#1d9e75", bg:"rgba(29,158,117,0.12)", border:"rgba(29,158,117,0.3)" },
  ok:    { label:"勉强可行", color:"#ba7517", bg:"rgba(186,117,23,0.12)", border:"rgba(186,117,23,0.3)" },
  poor:  { label:"不推荐",   color:"#e85d6a", bg:"rgba(232,93,106,0.12)", border:"rgba(232,93,106,0.3)" },
};

const TAG_STYLE = {
  green:  { background:"#e1f5ee", color:"#085041" },
  yellow: { background:"#faeeda", color:"#633806" },
  red:    { background:"#fcebeb", color:"#501313" },
};

const TABS = ["💰 成本","🛂 签证","🏥 医保","🛡️ 安全"];

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

    const map = L.map(mapRef.current, {
      center: [20, 20],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Style map dark
    mapRef.current.style.filter = "brightness(0.5) saturate(0.3) hue-rotate(180deg)";

    leafletMap.current = map;

    // Add markers
    CITIES.forEach(city => {
      const markerEl = document.createElement("div");
      markerEl.style.cssText = `
        width:14px;height:14px;border-radius:50%;
        background:rgba(29,158,117,0.5);border:2px solid #1d9e75;
        cursor:pointer;transition:all 0.2s;
        box-shadow:0 0 6px rgba(29,158,117,0.4);
      `;
      markerEl.dataset.id = city.id;

      const icon = L.divIcon({ html: markerEl, className:"", iconSize:[14,14], iconAnchor:[7,7] });
      const marker = L.marker([city.lat, city.lng], { icon })
        .addTo(map)
        .bindTooltip(`${city.flag} ${city.name}`, {
          permanent: false,
          direction: "top",
          className: "fire-tooltip",
          offset: [0, -10],
        });

      marker.on("click", () => selectCity(city));
      markersRef.current[city.id] = { marker, el: markerEl };
    });

    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // Update marker styles when fireType or selected changes
  useEffect(() => {
    CITIES.forEach(city => {
      const m = markersRef.current[city.id];
      if (!m) return;
      const fit = city.fit[fireType];
      const col = fit === "great" ? "#1d9e75" : fit === "ok" ? "#ba7517" : "#e85d6a";
      const isSelected = selected?.id === city.id;
      m.el.style.width = isSelected ? "18px" : "12px";
      m.el.style.height = isSelected ? "18px" : "12px";
      m.el.style.background = isSelected ? col : `${col}55`;
      m.el.style.borderColor = col;
      m.el.style.boxShadow = isSelected ? `0 0 12px ${col}` : `0 0 4px ${col}66`;
      m.el.style.marginTop = isSelected ? "-3px" : "0";
      m.el.style.marginLeft = isSelected ? "-3px" : "0";
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
    const prompt = `你是FIRE财务独立提前退休专家。
用户是${p.label}类型（目标${p.range}），考虑在${selected.flag}${selected.country}·${selected.name}旅居。
该城市对${p.label}的适合度评级是：${fit.label}。
月均生活成本约${selected.costs[0].val}。

请用中文提供个性化分析（约200字），涵盖：
1) 详细解释为什么这个城市对${p.label}是"${fit.label}"
2) 最重要的签证建议（1-2条具体方案）
3) 医保最优策略
4) 一个常被忽略但极有价值的实用提示

语气像有丰富经验的旅居FIRE族前辈，真实接地气。`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const text = data.text || "无法获取建议，请稍后再试。";
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
    const ss = {
      sec: { fontSize:10, letterSpacing:2, color:"#3dd6b5", textTransform:"uppercase", marginBottom:8, marginTop:0 },
      row: { padding:"7px 0", borderBottom:"1px solid #1e2a35", fontSize:12, color:"#8b9ab0", lineHeight:1.55, display:"flex", gap:8, alignItems:"flex-start" },
      arr: { color:"#ba7517", fontSize:14, lineHeight:"1.2", flexShrink:0 },
      link: { color:"#3dd6b5", fontSize:10, textDecoration:"none", marginLeft:4, opacity:0.7, flexShrink:0 },
    };

    const renderList = (items) => items.map((item, i) => (
      <div key={i} style={ss.row}>
        <span style={ss.arr}>›</span>
        <span style={{ flex:1 }}>{item.t || item.d || item}</span>
        {item.src && (
          <a href={item.src} target="_blank" rel="noopener noreferrer" style={ss.link} title="查看来源">↗</a>
        )}
      </div>
    ));

    if (activeTab === 0) return (
      <div>
        <div style={ss.sec}>省钱贴士</div>
        {renderList(selected.tips)}
      </div>
    );
    if (activeTab === 1) return (
      <div>
        <div style={ss.sec}>签证类型</div>
        {selected.visa.map((v, i) => (
          <div key={i} style={ss.row}>
            <span style={ss.arr}>›</span>
            <div style={{ flex:1 }}>
              <strong style={{ color:"#dde6f0" }}>{v.t}</strong>
              <br/><span>{v.d}</span><br/>
              <span style={{ ...TAG_STYLE[v.cl], display:"inline-block", padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:600, marginTop:4 }}>{v.l}</span>
            </div>
            {v.src && <a href={v.src} target="_blank" rel="noopener noreferrer" style={ss.link} title="官方来源">↗</a>}
          </div>
        ))}
      </div>
    );
    if (activeTab === 2) return (
      <div>
        <div style={ss.sec}>医疗体系</div>
        {renderList(selected.health)}
        <div style={{ ...ss.sec, marginTop:14 }}>保险建议</div>
        {renderList(selected.ins)}
      </div>
    );
    if (activeTab === 3) return (
      <div>
        <div style={ss.sec}>安全状况</div>
        {renderList(selected.safety)}
        <div style={{ ...ss.sec, marginTop:14 }}>文化考量</div>
        {renderList(selected.culture)}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0b0f14", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#dde6f0", overflow:"hidden" }}>
      {/* Leaflet tooltip style */}
      <style>{`
        .fire-tooltip { background:rgba(11,15,20,0.95)!important; border:1px solid #1e2a35!important; color:#dde6f0!important; font-family:'DM Sans',system-ui,sans-serif!important; font-size:12px!important; padding:4px 10px!important; border-radius:6px!important; box-shadow:0 4px 12px rgba(0,0,0,0.4)!important; }
        .fire-tooltip::before { display:none!important; }
        .leaflet-control-zoom a { background:#111820!important; color:#d4a843!important; border-color:#1e2a35!important; }
        .leaflet-control-attribution { background:rgba(11,15,20,0.8)!important; color:#7a8899!important; font-size:9px!important; }
        .leaflet-control-attribution a { color:#7a8899!important; }
      `}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid #1e2a35", background:"#0b0f14", flexShrink:0, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, color:"#d4a843" }}>
            FIRE<span style={{ color:"#3dd6b5" }}>Nomad</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:2, color:"#7a8899", textTransform:"uppercase", marginTop:1 }}>世界旅居地图 · {CITIES.length}个城市</div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {Object.entries(FIRE_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setFireType(k)} style={{
              padding:"4px 12px", borderRadius:20,
              border:`1px solid ${fireType===k ? v.color : "#1e2a35"}`,
              background: fireType===k ? `${v.color}22` : "transparent",
              color: fireType===k ? v.color : "#7a8899",
              cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap"
            }}>
              {v.icon} {v.label.replace(" FIRE","")}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#3dd6b5", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#3dd6b5", display:"inline-block" }}/>
          AI实时生成
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* MAP */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <div ref={mapRef} style={{ width:"100%", height:"100%" }}/>

          {/* Legend */}
          <div style={{ position:"absolute", bottom:14, left:14, background:"rgba(11,15,20,0.92)", border:"1px solid #1e2a35", borderRadius:8, padding:"10px 14px", zIndex:1000 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#7a8899", textTransform:"uppercase", marginBottom:6 }}>
              标记颜色 = {FIRE_TYPES[fireType].label} 适合度
            </div>
            {Object.entries(FIT_CONFIG).map(([k,v]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#7a8899", marginBottom:3 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:v.color, flexShrink:0 }}/>
                {v.label}
              </div>
            ))}
          </div>

          {!selected && (
            <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(11,15,20,0.88)", border:"1px solid #1e2a35", borderRadius:20, padding:"5px 16px", fontSize:11, color:"#7a8899", whiteSpace:"nowrap", zIndex:1000, pointerEvents:"none" }}>
              🌍 点击城市标记 · 滚轮缩放 · 拖拽移动
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div style={{ width: selected ? 330 : 0, background:"#111820", borderLeft:"1px solid #1e2a35", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.3s ease", flexShrink:0 }}>
          {selected && (
            <div style={{ width:330, display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"14px 18px 10px", borderBottom:"1px solid #1e2a35", flexShrink:0, position:"relative" }}>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:10, right:12, width:24, height:24, borderRadius:"50%", background:"#1a2230", border:"1px solid #1e2a35", color:"#7a8899", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:19, color:"#dde6f0", paddingRight:30 }}>
                  {selected.flag} {selected.country} · {selected.name}
                </div>
                <div style={{ fontSize:11, color:"#7a8899", marginTop:2 }}>{selected.sub}</div>

                {/* FIRE Match Badge */}
                <div style={{ marginTop:10, padding:"8px 12px", background: fit.bg, border:`1px solid ${fit.border}`, borderRadius:8, fontSize:11, lineHeight:1.5 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"#7a8899" }}>{FIRE_TYPES[fireType].icon} {FIRE_TYPES[fireType].label}（{FIRE_TYPES[fireType].range}）</span>
                    <span style={{ color: fit.color, fontWeight:700, fontSize:12, background:`${fit.color}22`, padding:"1px 8px", borderRadius:10 }}>{fit.label}</span>
                  </div>
                  <div style={{ color:"#8b9ab0", fontSize:11 }}>{fitNote}</div>
                </div>
              </div>

              {/* Cost grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, padding:"10px 14px", borderBottom:"1px solid #1e2a35", flexShrink:0 }}>
                {selected.costs.map((c) => (
                  <div key={c.label} style={{ background:"#1a2230", borderRadius:7, padding:"7px 9px", position:"relative" }}>
                    <div style={{ fontSize:9, letterSpacing:1.5, color:"#7a8899", textTransform:"uppercase", marginBottom:2 }}>{c.label}</div>
                    <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:16, color:"#f0c96e" }}>{c.val}</div>
                    <a href={c.src} target="_blank" rel="noopener noreferrer"
                      style={{ position:"absolute", top:5, right:6, fontSize:9, color:"#3dd6b5", textDecoration:"none", opacity:0.6 }}
                      title="数据来源">↗</a>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:"1px solid #1e2a35", flexShrink:0 }}>
                {TABS.map((t, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    flex:1, padding:"7px 2px", fontSize:10,
                    color: activeTab===i ? "#d4a843" : "#7a8899",
                    cursor:"pointer",
                    borderBottom: activeTab===i ? "2px solid #d4a843" : "2px solid transparent",
                    borderTop:"none", borderLeft:"none", borderRight:"none",
                    background:"none", fontFamily:"inherit", fontWeight:600, textAlign:"center"
                  }}>{t}</button>
                ))}
              </div>

              {/* Scroll */}
              <div style={{ flex:1, overflowY:"auto", padding:"10px 14px" }}>
                {renderTabContent()}
              </div>

              {/* AI */}
              <div style={{ padding:"10px 14px 12px", borderTop:"1px solid #1e2a35", flexShrink:0 }}>
                <button onClick={askAI} disabled={aiLoading} style={{
                  width:"100%", padding:"9px",
                  background:"linear-gradient(135deg,#d4a843,#b8892f)",
                  color:"#0b0f14", border:"none", borderRadius:8,
                  fontFamily:"inherit", fontWeight:700, fontSize:12,
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  opacity: aiLoading ? 0.7 : 1
                }}>
                  {aiLoading ? "⏳ AI分析中..." : `✦ 为什么${selected.name}${fit.label === "非常适合" ? "非常适合" : fit.label === "勉强可行" ? "只是勉强适合" : "不适合"}我的${FIRE_TYPES[fireType].label}？`}
                </button>
                {(aiText || aiLoading) && (
                  <div style={{ marginTop:8, padding:"10px 12px", background:"rgba(61,214,181,0.05)", border:"1px solid rgba(61,214,181,0.2)", borderRadius:8, fontSize:12, lineHeight:1.75, color:"#c8d8e8", whiteSpace:"pre-wrap", maxHeight:200, overflowY:"auto" }}>
                    {aiText}
                    {aiLoading && <span style={{ color:"#3dd6b5" }}>▋</span>}
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
