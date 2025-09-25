// 公共数据源文件，用于存储学校、MBTI和职业的数据

// 学校数据源
export const schoolList = [
  "复旦大学",
  "同济大学",
  "上海交通大学",
  "华东理工大学",
  "上海理工大学",
  "上海海事大学",
  "东华大学",
  "上海电力大学",
  "上海应用技术大学",
  "上海健康医学院",
  "上海海洋大学",
  "上海中医药大学",
  "华东师范大学",
  "上海师范大学",
  "上海外国语大学",
  "上海财经大学",
  "上海对外经贸大学",
  "上海海关学院",
  "华东政法大学",
  "上海体育大学",
  "上海音乐学院",
  "上海戏剧学院",
  "上海大学",
  "上海公安学院",
  "上海工程技术大学",
  "上海立信会计金融学院",
  "上海电机学院",
  "上海杉达学院",
  "上海政法学院",
  "上海第二工业大学",
  "上海商学院",
  "上海立达学院",
  "上海建桥学院",
  "上海兴伟学院",
  "上海视觉艺术学院",
  "上海科技大学",
  "上海纽约大学",
  "上海中侨职业技术大学"
];

// MBTI数据源
export const mbtiList = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

// 职业数据源
export const occupationCategories = {
  "常见职业范围": {
    "专业技术类": [
      "学生", "其他", "医生", "护士", "药剂师", "营养师", "心理咨询师",
      "机械工程师", "电气工程师", "软件工程师", "数据分析师",
      "科学家", "研究员", "大学教师",
      "律师", "法官", "法律顾问",
      "会计师", "审计师", "金融分析师", "税务师"
    ],
    "商业管理类": [
      "企业经理", "项目经理", "人力资源经理", "运营总监",
      "市场专员", "销售经理", "品牌策划师", "电商运营",
      "创业企业家", "企业合伙人"
    ],
    "服务类": [
      "客服专员", "客户关系经理",
      "中小学教师", "培训讲师", "早教老师",
      "酒店经理", "导游", "餐厅经理", "乘务员",
      "社工", "社区工作者", "公益项目专员"
    ],
    "创意设计类": [
      "平面设计师", "室内设计师", "服装设计师", "插画师",
      "记者", "编辑", "摄影师", "视频剪辑师", "主持人",
      "作家", "编剧", "文案策划"
    ],
    "技能操作类": [
      "技术工人", "生产线操作员", "质检员",
      "建筑工人", "施工员", "装修师傅",
      "货车司机", "客车司机", "飞行员", "船员",
      "农民", "养殖技术员"
    ],
    "公共事业类": [
      "公务员", "事业单位职员", "警察", "消防员", "军人"
    ]
  }
};

// 将嵌套的职业数据转换为扁平的列表
export function getOccupationList(): string[] {
  const occupationList: string[] = [];

  for (const category in occupationCategories["常见职业范围"]) {
    const jobs = occupationCategories["常见职业范围"][category as keyof (typeof occupationCategories)["常见职业范围"]];
    jobs.forEach(job => {
      occupationList.push(job);
    });
  }

  return occupationList;
}

// 将列表转换为选项格式
export function convertToOptions(list: string[]): Option[] {
  return list.map((item, index) => ({
    label: item,
    value: index.toString(),
  }));
}

// 获取学校选项
export function getSchoolOptions(): Option[] {
  return convertToOptions(schoolList);
}

// 获取MBTI选项
export function getMbtiOptions(): Option[] {
  return convertToOptions(mbtiList);
}

// 获取职业选项
export function getOccupationOptions(): Option[] {
  return convertToOptions(getOccupationList());
}