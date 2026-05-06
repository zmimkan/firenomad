import { useState, useRef } from "react";

const CITIES = [
  { id:"chiang_mai", name:"清迈", flag:"🇹🇭", country:"泰国", sub:"东南亚FIRE族首选", x:67, y:120, tier:"budget",
    costs:["$900","$300","$200","$80","$150","$100"],
    tips:["本地市场食材便宜40–60%，自煮省更多","租摩托车$60–80/月，比Grab省一半","避开尼曼路，古城内找房省$100–150/月","本地SIM卡$15/月含60GB流量"],
    visa:[{t:"旅游签",d:"落地免签30天，可延至90天",cl:"green",l:"✓ 免签"},{t:"泰精英签",d:"一次性$15k–30k，可住5–20年",cl:"green",l:"✓ 长居首选"},{t:"LTR长期签",d:"年收入$80k或资产$250k+，10年有效",cl:"yellow",l:"⚠ 有门槛"}],
    health:["Bangkok Hospital国际私立，英语服务完善","诊所看诊$20–50，比欧美便宜80%","牙科/眼科性价比极高"],
    ins:["SafetyWing $45/月，全球覆盖","Cigna/Aetna $80–200/月保障更全","退休签(OA)需投保$2.4k门诊+$8.9k住院"],
    safety:["泰国最安全城市，外国人犯罪目标极少","主要风险：交通事故，务必戴安全帽","骗局：出租车带路骗局，用Bolt/Grab叫车"],
    culture:["入庙需脱鞋着装保守","皇室话题绝对回避（冒犯君主罪严苛）","华人社区发达，中文餐馆众多"] },

  { id:"bangkok", name:"曼谷", flag:"🇹🇭", country:"泰国", sub:"国际都市·生活选择多元", x:68, y:130, tier:"budget",
    costs:["$1,400","$600","$300","$100","$200","$120"],
    tips:["BTS/MRT地铁月票$35，出行方便","Ari/Ladprao区比Sukhumvit性价比好","Barista FIRE在曼谷商业资源最丰富"],
    visa:[{t:"泰国全国签证",d:"旅游签/精英签/LTR，与清迈完全相同",cl:"green",l:"✓ 同全国"}],
    health:["Bumrungrad国际医院，全亚洲最知名","医疗旅游目的地，心脏/整形科国际级"],
    ins:["Bupa Thailand本地保单$80–150/月"],
    safety:["交通拥堵是最大危险，犯罪率低","Grab远比街头打车安全"],
    culture:["比清迈更国际化，英语服务更普及","夜生活繁华，注意控制支出"] },

  { id:"osaka", name:"大阪", flag:"🇯🇵", country:"日本", sub:"文化深度·全球最安全城市", x:430, y:105, tier:"mid",
    costs:["$2,100","$800","$500","$150","$300","$200"],
    tips:["比东京便宜30–40%，是日本FIRE最佳选择","ICOCA交通卡折扣票价","超市打烊前折扣熟食省30–50%"],
    visa:[{t:"免签90天",d:"大多数国家适用，短期测试首选",cl:"green",l:"✓ 免签"},{t:"⚠ 无专属FIRE签",d:"日本目前无被动收入/退休签",cl:"red",l:"✗ 长居最大挑战"}],
    health:["国民健保外籍长期居留者可加入$100–200/月","保障70%，医疗体系世界一流"],
    ins:["国民健保（3个月以上居留必加）","过渡期SafetyWing $45/月"],
    safety:["全球最安全国家之一，失物可找回","地震频繁，Yahoo!防灾速报App推荐"],
    culture:["公共场所保持安静，电车不接电话","垃圾分类极严格","基础日语非常有帮助"] },

  { id:"kuala_lumpur", name:"吉隆坡", flag:"🇲🇾", country:"马来西亚", sub:"英语通用·MM2H签证", x:382, y:148, tier:"budget",
    costs:["$1,200","$450","$250","$100","$200","$120"],
    tips:["MM2H第二家园签是FIRE族长居最佳方案","英语极普及，适应成本最低","Grab打车市区$2–5/次极便宜"],
    visa:[{t:"MM2H第二家园",d:"定存50万令吉（约$11k），住10年",cl:"green",l:"✓ 专为FIRE设计"},{t:"DE Rantau数字游民签",d:"月收入$2,400+，12个月可续",cl:"yellow",l:"⚠ 需收入证明"},{t:"旅游签",d:"大多数国家免签90天",cl:"green",l:"✓ 免签"}],
    health:["Gleneagles/Pantai私立医院国际水准","公立医院便宜但等待时间长"],
    ins:["AIA/Prudential大马保单$60–150/月","MM2H申请无强制医保要求"],
    safety:["整体安全，旅游区和公交站扒手注意"],
    culture:["华人约23%，华语/广东话通用","清真Halal主流，猪肉在华人餐厅可找"] },

  { id:"taipei", name:"台北", flag:"🇹🇼", country:"台湾", sub:"华语环境·全球最佳医保之一", x:422, y:108, tier:"mid",
    costs:["$1,500","$600","$350","$80","$250","$150"],
    tips:["悠游卡MRT约$0.5–1.5/次","夜市$3–5吃饱一餐","台湾健保月费仅$30–50，全球最划算之一"],
    visa:[{t:"免签90天",d:"多数国家适用",cl:"green",l:"✓ 免签"},{t:"Gold Card数字游民签",d:"需专业技能，1–3年含工作权",cl:"yellow",l:"⚠ 有技能门槛"}],
    health:["全民健保全球最佳体系之一，月费$30–50","工作/居留满6个月可加入"],
    ins:["全民健保符合资格后优先加入","国泰/富邦补充实支实付$30–80/月"],
    safety:["亚洲最安全地区之一","地震频繁，台湾防灾App推荐"],
    culture:["华语主流，热情好客","夜市/小吃文化极丰富"] },

  { id:"bali", name:"峇里岛", flag:"🇮🇩", country:"印尼", sub:"热带天堂·数字游民圣地", x:405, y:158, tier:"budget",
    costs:["$800","$300","$180","$70","$130","$90"],
    tips:["Canggu/Ubud是数字游民聚集地","租摩托车约$80/月，必备","本地warungs饮食$2–4/餐"],
    visa:[{t:"落地签E-VOA",d:"30天可延30天，总60天",cl:"green",l:"✓ 方便"},{t:"数字游民签B211A",d:"60天可续，单次$35",cl:"yellow",l:"⚠ 需频繁续签"}],
    health:["BIMC Hospital外籍人士主要医院","严重病症需转新加坡/澳大利亚"],
    ins:["SafetyWing $45/月必备","医疗撤离险强烈推荐"],
    safety:["整体安全，摩托车事故是外国人受伤主因"],
    culture:["印度教文化，入庙需穿沙龙","数字游民社区成熟，外国人融入容易"] },

  { id:"singapore", name:"新加坡", flag:"🇸🇬", country:"新加坡", sub:"亚洲金融枢纽·Fat FIRE基地", x:390, y:155, tier:"premium",
    costs:["$3,500","$1,800","$600","$150","$500","$300"],
    tips:["Fat FIRE在东南亚的医疗/法律/金融枢纽","组屋小贩中心$3–6/餐，高价中的平民选择","医疗/教育/基础设施东南亚无出其右"],
    visa:[{t:"旅游免签30天",d:"适合短期停留",cl:"green",l:"✓ 免签"},{t:"全球投资者计划GIP",d:"$2.5M投资，快速取得PR",cl:"yellow",l:"⚠ 门槛极高"}],
    health:["全亚洲最佳医疗体系，世界级","SGH/NUH/Raffles顶级选择"],
    ins:["外籍AIA/Prudential $200–400/月","Fat FIRE族BUPA/Aetna $300–600/月"],
    safety:["全球最安全城市之一","法规极严：禁口香糖/乱丢垃圾高额罚款"],
    culture:["多元种族，英语是行政语言","效率文化极强，守时/遵规则是基本礼仪"] },

  { id:"lisbon", name:"里斯本", flag:"🇵🇹", country:"葡萄牙", sub:"欧洲最具性价比·D7签首选", x:138, y:99, tier:"mid",
    costs:["$2,000","$900","$400","$80","$350","$200"],
    tips:["D7被动收入签专为FIRE族，需月收入$1,100+","申根居留，自由往返26国","NHR税制前10年税务优惠，需专业税顾问"],
    visa:[{t:"D7被动收入签",d:"月被动收入$1,100+，FIRE首选",cl:"green",l:"✓ 专为FIRE设计"},{t:"D8数字游民签",d:"月收入$3,200+，Barista FIRE适用",cl:"yellow",l:"⚠ 收入门槛"},{t:"黄金签证",d:"投资€500k+基金，5年可永居",cl:"yellow",l:"⚠ 高资产"}],
    health:["SNS国家医疗注册后费用极低","私立Luz Saude英语服务优秀"],
    ins:["SNS国家医疗（D7签注册后）","私立补充Médis $50–150/月"],
    safety:["全球最和平国家前10","里斯本扒手多，旅游景点尤其注意"],
    culture:["法多音乐文化，Alfama区周末体验","午餐是正餐，1–3pm本地餐厅营业"] },

  { id:"barcelona", name:"巴塞罗那", flag:"🇪🇸", country:"西班牙", sub:"地中海生活·加泰文化", x:158, y:89, tier:"mid",
    costs:["$2,400","$1,200","$500","$100","$350","$200"],
    tips:["非盈利活动签（Non-Lucrative）需月收入$2,800+","比马德里贵20%，但海滩文化值得","2024年严控旅游公寓，提前规划找房"],
    visa:[{t:"非盈利活动签",d:"月$2,800+，5年后永居",cl:"green",l:"✓ FIRE主要路径"},{t:"数字游民签DNV",d:"2023年新推，月$2,600+",cl:"yellow",l:"⚠ 需收入证明"},{t:"黄金签证",d:"2024年巴塞罗那已停止新申请",cl:"red",l:"✗ 已停止"}],
    health:["SNS加入后几乎免费","Sanitas/Quirónsalud私立英语服务佳"],
    ins:["Sanitas/DKV $80–150/月"],
    safety:["扒手问题全欧最严重之一","兰布拉大道/地铁/旅游景点特别注意"],
    culture:["西班牙语+加泰语双语城市","晚餐8–11pm，南欧生活节奏"] },

  { id:"tbilisi", name:"第比利斯", flag:"🇬🇪", country:"格鲁吉亚", sub:"365天免签·极低税率", x:258, y:89, tier:"budget",
    costs:["$900","$350","$200","$50","$150","$100"],
    tips:["大多数国家公民365天无签居留","个人所得税仅20%，税务极友好","数字游民新热点，基础设施快速提升"],
    visa:[{t:"365天免签",d:"美/欧/加等公民无需签证",cl:"green",l:"✓ 全球最宽松之一"},{t:"小型企业注册",d:"极简便，利润税1%（小企业）",cl:"green",l:"✓ 税务优化工具"}],
    health:["医疗仍在发展，复杂手术建议去土耳其","第比利斯私立诊所看诊约$15–30"],
    ins:["SafetyWing强烈推荐（$45/月）","建议加购含医疗撤离险"],
    safety:["整体安全，外国人普遍感觉良好","阿布哈兹/南奥塞梯边境地区避免前往"],
    culture:["热情好客，Tamada祝酒词传统精彩","葡萄酒文化：世界最古老产地"] },

  { id:"budapest", name:"布达佩斯", flag:"🇭🇺", country:"匈牙利", sub:"多瑙河畔·中欧性价比之选", x:195, y:83, tier:"mid",
    costs:["$1,500","$650","$320","$70","$280","$160"],
    tips:["比西欧便宜30–40%，文化资源不减","GRSP投资$250k可获10年居留许可","温泉浴场文化独特（塞切尼/盖勒特）"],
    visa:[{t:"申根免签90天",d:"短期测试首选",cl:"green",l:"✓"},{t:"GRSP居留签",d:"投资$250k匈牙利基金，10年居留",cl:"yellow",l:"⚠ 投资门槛"}],
    health:["私立Duna Medical/Medicover英语完善","看诊$30–60"],
    ins:["Cigna/AXA $80–150/月"],
    safety:["整体安全，扒手主要在旅游区/地铁"],
    culture:["匈牙利语极难，英语年轻人普及","温泉浴场是日常消遣"] },

  { id:"merida", name:"梅里达", flag:"🇲🇽", country:"墨西哥", sub:"北美FIRE族首选·最安全墨西哥城市", x:100, y:122, tier:"budget",
    costs:["$1,300","$500","$300","$80","$200","$150"],
    tips:["连续评为墨西哥最安全城市","临时居留签需月收入$1,620或资产$27k","距坎昆3小时，旅行极便利"],
    visa:[{t:"旅游签FMM",d:"最长180天，免签入境",cl:"green",l:"✓ 最多180天"},{t:"临时居留签",d:"月收入$1,620+或资产$27k+，1–4年",cl:"green",l:"✓ FIRE常用路径"}],
    health:["Star Medica私立医院英语服务","牙科旅游盛行，质量高价格低"],
    ins:["SafetyWing/CIGNA $45–150/月","AXA/GNP墨西哥保单$80–200/月"],
    safety:["梅里达治安在墨西哥最佳","当地人友善，外国人受欢迎"],
    culture:["玛雅文化底蕴，节庆精彩","西班牙语是唯一通用语"] },

  { id:"medellin", name:"麦德林", flag:"🇨🇴", country:"哥伦比亚", sub:"永恒春天之城·快速崛起", x:118, y:148, tier:"budget",
    costs:["$1,200","$450","$280","$70","$200","$150"],
    tips:["全年气候如春（22–26°C）","退休签（Pensionado）月被动收入$684+即可","El Poblado/Laureles是外国人首选安全区域"],
    visa:[{t:"旅游签免签90天",d:"可延至180天",cl:"green",l:"✓ 免签"},{t:"退休签Pensionado",d:"月被动收入$684+，永久有效",cl:"green",l:"✓ 专为FIRE族"},{t:"数字游民签DNV",d:"月收入$684+，最长2年",cl:"green",l:"✓ 门槛极低"}],
    health:["Clinica las Vegas世界级水准","医疗旅游热门，整形外科国际知名"],
    ins:["SafetyWing/Cigna $45–150/月","EPS哥伦比亚医疗居留后可加入$60–150/月"],
    safety:["安全状况大幅改善，但仍需保持警觉","InDrive/Uber叫车而非街头招手"],
    culture:["热情外向，Salsa舞蹈是日常社交","西班牙语唯一通用语，口音清晰"] },

  { id:"buenos_aires", name:"布宜诺斯艾利斯", flag:"🇦🇷", country:"阿根廷", sub:"南美巴黎·文化艺术之都", x:128, y:188, tier:"budget",
    costs:["$800","$280","$200","$50","$150","$90"],
    tips:["比索贬值，美元蓝市汇率折扣极大","Palermo/San Telmo是外国人最受欢迎区域","阿根廷烤肉（Asado）是世界级体验"],
    visa:[{t:"旅游签免签90天",d:"可延签一次（共180天）",cl:"green",l:"✓ 共180天"},{t:"退休/被动收入签",d:"需月收入约$1,200+",cl:"yellow",l:"⚠ 经济波动风险"}],
    health:["公立医院对所有人免费（含外国人）","私立CEMIC英语服务好"],
    ins:["国际医保强烈推荐"],
    safety:["扒手和强抢问题存在，Uber较安全"],
    culture:["探戈文化发源地，书店/咖啡馆极盛"] },

  { id:"dubai", name:"迪拜", flag:"🇦🇪", country:"UAE", sub:"免税天堂·Fat FIRE枢纽", x:286, y:116, tier:"premium",
    costs:["$4,000","$2,000","$700","$200","$600","$350"],
    tips:["个人所得税为零，Fat FIRE税务优化极佳","虚拟工作签证适合远程工作者","迪拜是中东/非洲的绝佳区域枢纽"],
    visa:[{t:"虚拟工作签证",d:"1年，需月收入$5,000+",cl:"yellow",l:"⚠ 收入门槛"},{t:"退休签",d:"55岁以上，资产$545k+",cl:"yellow",l:"⚠ 高门槛"},{t:"黄金签证",d:"投资$545k+不动产，10年居留",cl:"yellow",l:"⚠ 投资门槛"}],
    health:["Cleveland Clinic/Mediclinic世界级","医疗费用昂贵，医保必备"],
    ins:["居留者强制医保$200–500/月","Bupa/Daman高端医保是Fat FIRE首选"],
    safety:["全球最安全城市之一","文化禁忌严格：公开亲密/酒驾有法律风险"],
    culture:["伊斯兰文化，斋月期间白天不公开饮食","极度国际化（90%+为外籍人士）"] },

  { id:"marrakech", name:"马拉喀什", flag:"🇲🇦", country:"摩洛哥", sub:"北非异域风情·低成本旅居", x:150, y:112, tier:"budget",
    costs:["$800","$280","$180","$60","$140","$90"],
    tips:["旧城区（麦地那）体验最纯正阿拉伯/柏柏尔文化","外国人区（吉利兹）有现代设施","法语比英语更通用"],
    visa:[{t:"旅游免签90天",d:"多数国家适用",cl:"green",l:"✓ 免签"},{t:"长期居留",d:"需证明稳定收入来源",cl:"yellow",l:"⚠ 流程繁琐"}],
    health:["公立医院设施老旧","大型手术建议转西班牙/法国"],
    ins:["国际医保含医疗撤离险强烈推荐"],
    safety:["旅游区扒手存在，整体对外国人友善"],
    culture:["伊斯兰文化，斋月白天不公开饮食","哈玛广场夜市是世界级体验"] },

  { id:"krakow", name:"克拉科夫", flag:"🇵🇱", country:"波兰", sub:"欧洲隐藏宝石·高性价比", x:196, y:78, tier:"budget",
    costs:["$1,300","$500","$300","$60","$250","$150"],
    tips:["欧盟最低生活成本国家之一","历史古城，世界文化遗产","可从葡萄牙/西班牙获EU居留后迁入"],
    visa:[{t:"申根免签90天",d:"短期测试首选",cl:"green",l:"✓ 短期"},{t:"⚠ 无专属FIRE签",d:"需工作/投资证明",cl:"red",l:"✗ 签证是挑战"}],
    health:["私立Medicover/LUX MED英语服务好","看诊$20–40"],
    ins:["Cigna/AXA $80–150/月"],
    safety:["欧洲最安全国家之一，犯罪率极低"],
    culture:["天主教文化深厚","波兰美食物美价廉：饺子/罗宋汤"] },

  { id:"costa_rica", name:"圣何塞", flag:"🇨🇷", country:"哥斯达黎加", sub:"生态天堂·稳定民主国家", x:104, y:137, tier:"mid",
    costs:["$2,000","$800","$400","$100","$350","$200"],
    tips:["Pura Vida文化，生活节奏放松幸福感高","退休签需月被动收入$1,000+，相对容易","热带雨林/海滩/火山一应俱全"],
    visa:[{t:"旅游签免签90天",cl:"green",l:"✓"},{t:"退休签Pensionado",d:"月被动收入$1,000+",cl:"green",l:"✓ 专为退休族"},{t:"Rentista签",d:"月收入$2,500+",cl:"yellow",l:"⚠ 门槛较高"}],
    health:["CCSS公立医疗中美洲最佳，退休签可加入","私立CIMA/Clinica Biblica国际水准"],
    ins:["退休签强制加入CCSS（$80–150/月）"],
    safety:["中美洲最稳定安全的国家"],
    culture:["Pura Vida是国家精神——乐观从容","西班牙语主流，旅游区英语通用"] },
];

const FIRE_TYPES = {
  lean:    { label:"Lean FIRE",    range:"$1,500–2,000/月", icon:"🌱" },
  regular: { label:"Regular FIRE", range:"$2,000–4,000/月", icon:"🔥" },
  fat:     { label:"Fat FIRE",     range:"$4,000+/月",      icon:"💎" },
  barista: { label:"Barista FIRE", range:"半退休+兼职",      icon:"☕" },
  coast:   { label:"Coast FIRE",   range:"被动收入为主",     icon:"🌊" },
};

const TIER_COLOR = { budget:"#1d9e75", mid:"#ba7517", premium:"#7f77dd" };
const TIER_LABEL = { budget:"超值 <$1,500", mid:"中等 $1.5k–3.5k", premium:"高端 $3,500+" };
const COST_LABELS = ["月均总计","住宿","餐饮","交通","娱乐","医保估算"];
const TABS = ["💰 成本","🛂 签证","🏥 医保","🛡️ 安全"];

const TAG_STYLE = {
  green:  { background:"#e1f5ee", color:"#085041" },
  yellow: { background:"#faeeda", color:"#633806" },
  red:    { background:"#fcebeb", color:"#501313" },
};

export default function App() {
  const [fireType, setFireType] = useState("lean");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const svgRef = useRef(null);

  const W = 520, H = 300;
  function toXY(xPct, yPct) {
    return { cx: (xPct / 100) * W, cy: (yPct / 100) * H };
  }

  function selectCity(city) {
    setSelected(city);
    setActiveTab(0);
    setAiText("");
    setAiLoading(false);
  }

  async function askAI() {
    if (aiLoading || !selected) return;
    setAiLoading(true);
    setAiText("");
    const p = FIRE_TYPES[fireType];
    const prompt = `你是FIRE财务独立提前退休专家。用户是${p.label}类型（目标${p.range}），考虑在${selected.flag}${selected.country}·${selected.name}旅居。月均成本约${selected.costs[0]}。请用中文提供个性化分析（约200字），涵盖：1) 适合度评估 2) 最重要的签证建议 3) 医保最优策略 4) 一个被忽略的重要提示。语气像有经验的旅居前辈，真实接地气。`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "无法获取建议，请稍后再试。";
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

  function renderTabContent() {
    if (!selected) return null;
    const c = selected;
    if (activeTab === 0) return (
      <div>
        <div style={sectionTitle}>省钱贴士</div>
        {c.tips.map((t, i) => <div key={i} style={infoRow}><span style={arrow}>›</span><span>{t}</span></div>)}
      </div>
    );
    if (activeTab === 1) return (
      <div>
        <div style={sectionTitle}>签证类型</div>
        {c.visa.map((v, i) => (
          <div key={i} style={infoRow}>
            <span style={arrow}>›</span>
            <div>
              <strong style={{ color:"#dde6f0" }}>{v.t}</strong>
              {v.d && <><br /><span>{v.d}</span></>}
              <br />
              <span style={{ ...TAG_STYLE[v.cl], display:"inline-block", padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600, marginTop:4 }}>{v.l}</span>
            </div>
          </div>
        ))}
      </div>
    );
    if (activeTab === 2) return (
      <div>
        <div style={sectionTitle}>医疗体系</div>
        {c.health.map((h, i) => <div key={i} style={infoRow}><span style={arrow}>›</span><span>{h}</span></div>)}
        <div style={{ ...sectionTitle, marginTop:16 }}>保险建议</div>
        {c.ins.map((v, i) => <div key={i} style={infoRow}><span style={arrow}>›</span><span>{v}</span></div>)}
      </div>
    );
    if (activeTab === 3) return (
      <div>
        <div style={sectionTitle}>安全状况</div>
        {c.safety.map((t, i) => <div key={i} style={infoRow}><span style={arrow}>›</span><span>{t}</span></div>)}
        <div style={{ ...sectionTitle, marginTop:16 }}>文化考量</div>
        {c.culture.map((t, i) => <div key={i} style={infoRow}><span style={arrow}>›</span><span>{t}</span></div>)}
      </div>
    );
  }

  // Styles
  const sectionTitle = { fontSize:10, letterSpacing:2, color:"#3dd6b5", textTransform:"uppercase", marginBottom:8 };
  const infoRow = { padding:"7px 0", borderBottom:"1px solid #1e2a35", fontSize:13, color:"#8b9ab0", lineHeight:1.6, display:"flex", gap:8, alignItems:"flex-start" };
  const arrow = { color:"#ba7517", fontSize:16, lineHeight:"1.2", flexShrink:0 };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0b0f14", fontFamily:"'DM Sans', system-ui, sans-serif", color:"#dde6f0", overflow:"hidden" }}>
      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid #1e2a35", background:"#0b0f14", flexShrink:0, flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:20, color:"#d4a843" }}>
            FIRE<span style={{ color:"#3dd6b5" }}>Nomad</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:2, color:"#7a8899", textTransform:"uppercase", marginTop:1 }}>世界旅居地图 · {CITIES.length}个城市</div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {Object.entries(FIRE_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setFireType(k)} style={{
              padding:"4px 12px", borderRadius:20, border:`1px solid ${fireType===k ? "#d4a843" : "#1e2a35"}`,
              background: fireType===k ? "rgba(212,168,67,0.15)" : "transparent",
              color: fireType===k ? "#f0c96e" : "#7a8899",
              cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap"
            }}>
              {v.icon} {v.label.replace(" FIRE", "")}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#3dd6b5", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#3dd6b5", display:"inline-block" }} />
          AI实时生成
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* MAP */}
        <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#0d1520" }}>
          <svg
            ref={svgRef}
            style={{ width:"100%", height:"100%", cursor:"default" }}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ocean */}
            <rect width={W} height={H} fill="#0d1a28" />
            {/* Grid */}
            {[...Array(8)].map((_, i) => <line key={`h${i}`} x1={0} y1={(i+1)*H/9} x2={W} y2={(i+1)*H/9} stroke="#132030" strokeWidth="0.4"/>)}
            {[...Array(11)].map((_, i) => <line key={`v${i}`} x1={(i+1)*W/12} y1={0} x2={(i+1)*W/12} y2={H} stroke="#132030" strokeWidth="0.4"/>)}

            {/* Continents */}
            {[
              "55,16 105,12 118,20 122,32 112,42 95,46 78,42 62,48 52,42 44,32 46,22",
              "78,46 92,44 90,56 84,60 78,54",
              "76,60 104,56 115,62 118,80 110,96 95,100 78,92 68,78 70,66",
              "145,10 175,9 188,14 192,25 178,32 160,34 144,30 136,22",
              "136,23 148,32 145,36 138,34 133,28",
              "137,33 168,31 185,37 190,54 185,70 165,78 145,74 134,60 132,44",
              "188,27 205,22 222,28 220,44 210,52 196,48 183,38",
              "220,6 300,5 312,13 308,24 278,28 228,26 218,16",
              "208,29 242,26 258,34 252,46 242,50 224,46 205,38",
              "258,6 340,5 358,12 355,24 330,26 278,28 260,18",
              "318,30 360,26 375,32 372,46 352,52 326,48 314,40",
              "322,20 370,17 390,22 388,34 364,38 336,35 320,28",
              "384,20 396,18 404,24 400,32 390,30",
              "346,46 362,43 366,52 360,56 348,54",
              "332,50 360,47 364,55 356,59 336,57",
              "354,72 404,65 424,72 426,86 412,96 388,98 358,88 346,78",
            ].map((pts, i) => (
              <polygon key={i} points={pts} fill="#112233" stroke="#1a3344" strokeWidth="0.6"/>
            ))}

            {/* City markers */}
            {CITIES.map(city => {
              const pos = toXY(city.x, city.y);
              const isSelected = selected?.id === city.id;
              const col = TIER_COLOR[city.tier];
              return (
                <g key={city.id} onClick={() => selectCity(city)} style={{ cursor:"pointer" }}>
                  {isSelected && <circle cx={pos.cx} cy={pos.cy} r={10} fill={col} opacity={0.2} />}
                  <circle cx={pos.cx} cy={pos.cy} r={isSelected ? 6 : 4}
                    fill={isSelected ? col : `${col}55`} stroke={col} strokeWidth={isSelected ? 1.5 : 1} />
                  {isSelected && <circle cx={pos.cx} cy={pos.cy} r={9} fill="none" stroke={col} strokeWidth="0.8" opacity="0.5" strokeDasharray="2 2"/>}
                  <text x={pos.cx} y={pos.cy - 8} textAnchor="middle"
                    fontSize={isSelected ? "6.5" : "5.5"}
                    fill={isSelected ? col : "#7a8899"}
                    fontWeight={isSelected ? "700" : "400"}
                    style={{ pointerEvents:"none", fontFamily:"system-ui" }}>
                    {city.flag}{city.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hint */}
          {!selected && (
            <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(11,15,20,0.85)", border:"1px solid #1e2a35", borderRadius:20, padding:"5px 14px", fontSize:11, color:"#7a8899", whiteSpace:"nowrap", pointerEvents:"none" }}>
              🌍 点击任意城市标记查看旅居资料
            </div>
          )}

          {/* Legend */}
          <div style={{ position:"absolute", bottom:14, left:14, background:"rgba(11,15,20,0.9)", border:"1px solid #1e2a35", borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#7a8899", textTransform:"uppercase", marginBottom:6 }}>成本指数</div>
            {Object.entries(TIER_LABEL).map(([k, label]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#7a8899", marginBottom:4 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:TIER_COLOR[k], flexShrink:0 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* SIDE PANEL */}
        <div style={{ width: selected ? 320 : 0, background:"#111820", borderLeft:"1px solid #1e2a35", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.3s ease", flexShrink:0 }}>
          {selected && (
            <div style={{ width:320, display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
              {/* Panel header */}
              <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #1e2a35", flexShrink:0, position:"relative" }}>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:10, right:12, width:24, height:24, borderRadius:"50%", background:"#1a2230", border:"1px solid #1e2a35", color:"#7a8899", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, color:"#dde6f0", paddingRight:30 }}>
                  {selected.flag} {selected.country} · {selected.name}
                </div>
                <div style={{ fontSize:12, color:"#7a8899", marginTop:3 }}>{selected.sub}</div>
                <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(212,168,67,0.07)", border:"1px solid rgba(212,168,67,0.2)", borderRadius:8, fontSize:11, color:"#7a8899", lineHeight:1.5 }}>
                  {FIRE_TYPES[fireType].icon} <strong style={{ color:"#d4a843" }}>{FIRE_TYPES[fireType].label}</strong>（{FIRE_TYPES[fireType].range}）× {selected.name}
                </div>
              </div>

              {/* Cost mini grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, padding:"10px 16px", borderBottom:"1px solid #1e2a35", flexShrink:0 }}>
                {COST_LABELS.map((l, i) => (
                  <div key={l} style={{ background:"#1a2230", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, letterSpacing:1.5, color:"#7a8899", textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                    <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:17, color:"#f0c96e" }}>{selected.costs[i]}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:"1px solid #1e2a35", flexShrink:0 }}>
                {TABS.map((t, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    flex:1, padding:"8px 2px", fontSize:10, color: activeTab===i ? "#d4a843" : "#7a8899",
                    cursor:"pointer", borderBottom: activeTab===i ? "2px solid #d4a843" : "2px solid transparent",
                    background:"none", border:"none", borderBottom: activeTab===i ? "2px solid #d4a843" : "2px solid transparent",
                    fontFamily:"inherit", fontWeight:600, textAlign:"center"
                  }}>{t}</button>
                ))}
              </div>

              {/* Scroll area */}
              <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
                {renderTabContent()}
              </div>

              {/* AI */}
              <div style={{ padding:"10px 16px 14px", borderTop:"1px solid #1e2a35", flexShrink:0 }}>
                <button onClick={askAI} disabled={aiLoading} style={{
                  width:"100%", padding:"9px", background:"linear-gradient(135deg,#d4a843,#b8892f)",
                  color:"#0b0f14", border:"none", borderRadius:8, fontFamily:"inherit", fontWeight:700, fontSize:12, cursor: aiLoading ? "not-allowed" : "pointer", opacity: aiLoading ? 0.7 : 1
                }}>
                  {aiLoading ? "⏳ AI分析中..." : "✦ 问AI：这里适合我的FIRE计划吗？"}
                </button>
                {(aiText || aiLoading) && (
                  <div style={{ marginTop:8, padding:"10px 12px", background:"rgba(61,214,181,0.05)", border:"1px solid rgba(61,214,181,0.2)", borderRadius:8, fontSize:12, lineHeight:1.75, color:"#c8d8e8", whiteSpace:"pre-wrap", maxHeight:180, overflowY:"auto" }}>
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
