// api/index.js - 使用Vercel API路由方式
const getDateInfo = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // 获取年、月、日、星期几
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.getDay();
  
  // 周数计算 (ISO标准，每年第一个星期四所在的周为第1周)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = Math.floor((date - firstDayOfYear) / 86400000);
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // 距离指定日期的天数
  const getDaysUntil = (targetDate) => {
    const target = new Date(targetDate);
    const timeDiff = target.getTime() - new Date().getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  // 中文月份和星期
  const cnMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const cnWeekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  
  return {
    year,
    month,
    day,
    weekday,
    weekNum,
    cnMonth: cnMonths[month - 1],
    cnWeekday: cnWeekdays[weekday],
    getDaysUntil
  };
};

// 生成不同类型的SVG
const generateSVG = (type, content, color, date) => {
  const dateInfo = getDateInfo(date);
  if (!dateInfo && (type !== 'text')) {
    return { error: "无效的日期格式" };
  }
  
  // 根据传入的颜色设置填充色
  let fillColor = '#cf5659'; // 默认红色
  switch (color) {
    case 'green':
      fillColor = '#3cb371';
      break;
    case 'pink':
      fillColor = '#ff69b4';
      break;
    case 'yellow':
      fillColor = '#ffd700';
      break;
    case 'blue':
      fillColor = '#4682b4';
      break;
  }
  
  // SVG基础模板
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Calendar" role="img" viewBox="0 0 512 512" width="100%" height="100%" style="cursor: default">
    <path d="m512,455c0,32 -25,57 -57,57l-398,0c-32,0 -57,-25 -57,-57l0,-327c0,-31 25,-57 57,-57l398,0c32,0 57,26 57,57l0,327z" fill="#efefef"/>
    <path d="m484,0l-47,0l-409,0c-15,0 -28,13 -28,28l0,157l512,0l0,-157c0,-15 -13,-28 -28,-28z" fill="${fillColor}"/>
    <g fill="#f3aab9">
      <circle cx="462" cy="136" r="14"/>
      <circle cx="462" cy="94" r="14"/>
      <circle cx="419" cy="136" r="14"/>
      <circle cx="419" cy="94" r="14"/>
      <circle cx="376" cy="136" r="14"/>
      <circle cx="376" cy="94" r="14"/>
    </g>`;
  
  // 根据类型生成不同内容
  switch (type) {
    case 'day':
      svgContent += `
      <text id="month" x="32" y="142" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="100px" style="text-anchor: left">${dateInfo.cnMonth}</text>
      <text id="day" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="256px" style="text-anchor: middle">${dateInfo.day}</text>
      <text id="weekday" x="256" y="480" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="64px" style="text-anchor: middle">${dateInfo.cnWeekday}</text>`;
      break;
    
    case 'week':
      svgContent += `
      <text id="weektext" x="256" y="160" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="80px" style="text-anchor: middle">第</text>
      <text id="weeknum" x="256" y="340" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="240px" style="text-anchor: middle">${dateInfo.weekNum}</text>
      <text id="weektext2" x="256" y="460" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="80px" style="text-anchor: middle">周</text>`;
      break;
    
    case 'month':
      svgContent += `
      <text id="monthtext" x="256" y="160" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="80px" style="text-anchor: middle">月份</text>
      <text id="monthnum" x="256" y="340" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="240px" style="text-anchor: middle">${dateInfo.month}</text>
      <text id="year" x="256" y="460" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="60px" style="text-anchor: middle">${dateInfo.year}</text>`;
      break;
    
    case 'year':
      svgContent += `
      <text id="yeartext" x="256" y="160" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="80px" style="text-anchor: middle">年份</text>
      <text id="yearnum" x="256" y="380" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="200px" style="text-anchor: middle">${dateInfo.year}</text>`;
      break;
    
    case 'text':
      // 根据传入的content参数显示文字
      const text = content || 'TEXT';
      svgContent += `
      <text id="customtext" x="256" y="320" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="200px" style="text-anchor: middle">${text}</text>`;
      break;
    
    case 'pass':
      if (!date) {
        return { error: "pass类型需要指定目标日期" };
      }
      const daysLeft = dateInfo.getDaysUntil(date);
      svgContent += `
      <text id="passtitle" x="256" y="140" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="70px" style="text-anchor: middle">倒计时</text>
      <text id="daysnum" x="256" y="340" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="200px" style="text-anchor: middle">${daysLeft}</text>
      <text id="daystext" x="256" y="460" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="80px" style="text-anchor: middle">天</text>`;
      break;
    
    default:
      // 默认使用day类型
      svgContent += `
      <text id="month" x="32" y="142" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="100px" style="text-anchor: left">${dateInfo.cnMonth}</text>
      <text id="day" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="256px" style="text-anchor: middle">${dateInfo.day}</text>
      <text id="weekday" x="256" y="480" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="64px" style="text-anchor: middle">${dateInfo.cnWeekday}</text>`;
  }
  
  // 关闭SVG标签
  svgContent += `\n</svg>`;
  
  return svgContent;
};

// API处理函数
export default function handler(req, res) {
  // CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 获取查询参数
  const { type = 'day', content = '', color = 'red', date = '' } = req.query;
  
  // 生成SVG
  const result = generateSVG(type, content, color, date);
  
  // 如果有错误，返回错误信息
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  // 设置响应头并返回SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).send(result);
}