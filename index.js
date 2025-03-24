// index.js - Notion动态图标服务主文件
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 允许跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 获取日期相关信息的工具函数
function getDateInfo(dateStr) {
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
}

// 生成不同类型的SVG
function generateSVG(type, content, color, date) {
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
}

// 设置主页路由显示使用说明
app.get('/info', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notion动态图标服务</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { color: #cf5659; }
      h2 { color: #4682b4; margin-top: 30px; }
      code { background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
      table { border-collapse: collapse; width: 100%; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
      th { background-color: #f5f5f5; }
      .example { margin: 10px 0; }
      .example a { color: #4682b4; text-decoration: none; }
      .example a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Notion动态图标服务</h1>
    <p>这是一个为Notion页面提供动态图标的服务。您可以使用不同的参数来生成不同类型的图标。</p>
    
    <h2>使用方法</h2>
    <p>基本URL格式：<code>${req.protocol}://${req.get('host')}/?type=类型&color=颜色&date=日期&content=内容</code></p>
    
    <h2>支持的参数</h2>
    <table>
      <tr>
        <th>参数</th>
        <th>说明</th>
        <th>可选值</th>
        <th>默认值</th>
      </tr>
      <tr>
        <td>type</td>
        <td>图标类型</td>
        <td>day, week, month, year, text, pass</td>
        <td>day</td>
      </tr>
      <tr>
        <td>color</td>
        <td>图标颜色</td>
        <td>red, green, pink, yellow, blue</td>
        <td>red</td>
      </tr>
      <tr>
        <td>date</td>
        <td>指定日期</td>
        <td>YYYY-MM-DD格式</td>
        <td>当前日期</td>
      </tr>
      <tr>
        <td>content</td>
        <td>文本内容</td>
        <td>任意文本</td>
        <td>TEXT</td>
      </tr>
    </table>
    
    <h2>示例</h2>
    <div class="example">
      <p>1. 显示当天日期（默认）:</p>
      <p><a href="/?type=day" target="_blank">${req.protocol}://${req.get('host')}/?type=day</a></p>
    </div>
    <div class="example">
      <p>2. 显示蓝色主题的周数:</p>
      <p><a href="/?type=week&color=blue" target="_blank">${req.protocol}://${req.get('host')}/?type=week&color=blue</a></p>
    </div>
    <div class="example">
      <p>3. 显示绿色主题的自定义文字:</p>
      <p><a href="/?type=text&content=笔记&color=green" target="_blank">${req.protocol}://${req.get('host')}/?type=text&content=笔记&color=green</a></p>
    </div>
    <div class="example">
      <p>4. 显示距离2026年1月1日的倒计时:</p>
      <p><a href="/?type=pass&date=2026-01-01" target="_blank">${req.protocol}://${req.get('host')}/?type=pass&date=2026-01-01</a></p>
    </div>
    <div class="example">
      <p>5. 显示特定日期:</p>
      <p><a href="/?date=2026-01-01" target="_blank">${req.protocol}://${req.get('host')}/?date=2026-01-01</a></p>
    </div>
    
    <h2>在Notion中使用</h2>
    <p>1. 在Notion页面，鼠标悬停在图标或封面上</p>
    <p>2. 点击"Change"</p>
    <p>3. 选择"Link"选项</p>
    <p>4. 粘贴你的动态图标URL</p>
    <p>5. 点击"Submit"应用变更</p>
    
    <footer style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
      <p>© ${new Date().getFullYear()} Notion动态图标服务</p>
    </footer>
  </body>
  </html>
  `;
  
  res.send(html);
});

// 设置路由
app.get('/', (req, res) => {
  // 获取查询参数
  const type = req.query.type || 'day';
  const content = req.query.content || '';
  const color = req.query.color || 'red';
  const date = req.query.date || '';
  
  // 生成SVG
  const result = generateSVG(type, content, color, date);
  
  // 如果有错误，返回错误信息
  if (result.error) {
    return res.status(400).send(result.error);
  }
  
  // 设置响应头并返回SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(result);
});

// 设置404页面
app.use((req, res) => {
  res.status(404).redirect('/info');
});

// 启动服务
app.listen(port, () => {
  console.log(`动态图标服务已启动，监听端口: ${port}`);
});

// 导出app用于Vercel
module.exports = app;