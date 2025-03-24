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
  
  // 获取年份后两位
  const shortYear = year.toString().slice(-2);
  
  // 周数计算 (ISO标准，每年第一个星期四所在的周为第1周)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = Math.floor((date - firstDayOfYear) / 86400000);
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // 计算季度
  const quarter = Math.ceil(month / 3);
  const cnQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  // 年份+季度组合
  const yearQuarter = `${shortYear}${cnQuarters[quarter - 1]}`;
  
  // 格式化月和日（补零）
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  
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
    quarter,
    shortYear,
    yearQuarter,
    cnQuarter: cnQuarters[quarter - 1],
    formattedMonth,
    formattedDay,
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
  
  // 如果是渐变测试，直接返回一个简单的渐变测试示例
  if (type === 'gradient-test') {
    const colors = color && color.includes('+') ? color.split('+') : ['#ff0000', '#0000ff'];
    const startColor = getColorValue(colors[0].trim());
    const endColor = getColorValue(colors[1].trim());
    
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="testGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="512" height="512" fill="url(#testGradient)" />
      <text x="256" y="256" text-anchor="middle" fill="white" font-size="24">渐变测试</text>
    </svg>`;
  }
  
  // 设置颜色
  let headerColor = '#cf5659'; // 默认红色
  let accentColor = '#f3aab9'; // 默认点缀色
  let gradientHeader = false;
  let gradientDef = '';
  
  // 处理颜色设置
  if (color && color.includes('+')) {
    // 处理渐变色
    const colors = color.split('+');
    if (colors.length >= 2) {
      const startColor = getColorValue(colors[0].trim());
      const endColor = getColorValue(colors[1].trim());
      accentColor = lightenColor(endColor, 30);
      
      // 为每个实例创建唯一ID，防止缓存问题
      const gradientId = `gradient_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // 设置渐变标志和定义
      gradientHeader = true;
      gradientDef = `
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>`;
      
      // 引用渐变
      headerColor = `url(#${gradientId})`;
    }
  } else {
    // 单色处理
    switch (color) {
      case 'green':
        headerColor = '#3cb371';
        accentColor = '#a0d9b4';
        break;
      case 'pink':
        headerColor = '#ff69b4';
        accentColor = '#ffb6e1';
        break;
      case 'yellow':
        headerColor = '#ffd700';
        accentColor = '#ffe97f';
        break;
      case 'blue':
        headerColor = '#5aa9e6';
        accentColor = '#3a79b6';
        break;
    }
  }
  
  // 直接构建完整SVG
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-label="Calendar" role="img" viewBox="0 0 512 512" width="100%" height="100%" style="cursor: default">`;
  
  // 插入渐变定义(必须在使用前定义)
  if (gradientHeader) {
    svgContent += gradientDef;
  }
  
  // 添加基础图形
  svgContent += `
    <path d="m512,455c0,32 -25,57 -57,57l-398,0c-32,0 -57,-25 -57,-57l0,-327c0,-31 25,-57 57,-57l398,0c32,0 57,26 57,57l0,327z" fill="#efefef"/>
    <path d="m484,0l-47,0l-409,0c-15,0 -28,13 -28,28l0,157l512,0l0,-157c0,-15 -13,-28 -28,-28z" fill="${headerColor}"/>`;
  
  // 根据类型添加不同内容
  switch (type) {
    case 'day':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="month" x="32" y="142" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="100px" style="text-anchor: left">${dateInfo.cnMonth}</text>
      <text id="day" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="256px" style="text-anchor: middle">${dateInfo.day}</text>
      <text id="weekday" x="256" y="480" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="64px" style="text-anchor: middle">${dateInfo.cnWeekday}</text>`;
      break;
    
    case 'week':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="yearq" x="256" y="150" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="120px" style="text-anchor: middle">${dateInfo.yearQuarter}</text>
      <text id="weekNum" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="184px" style="text-anchor: middle">${dateInfo.weekNum}周</text>`;
      break;
    
    case 'month':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="year" x="32" y="150" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="120px" style="text-anchor: left">${dateInfo.year}</text>
      <text id="monthName" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="180px" style="text-anchor: middle">${dateInfo.cnMonth}</text>`;
      break;
    
    case 'year':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="yearnum" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="200px" style="text-anchor: middle">${dateInfo.year}</text>`;
      break;
    
    case 'quarter':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="year" x="32" y="150" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="120px" style="text-anchor: left">${dateInfo.year}</text>
      <text id="quarterName" x="256" y="440" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="280px" style="text-anchor: middle">${dateInfo.cnQuarter}</text>`;
      break;
    
    case 'text':
        // 根据文本长度调整字体大小和布局
        const text = content || 'TEXT';
        const textLength = text.length;
        
        // 限制最大字符数为6
        const displayText = textLength > 6 ? text.substring(0, 6) : text;
        const displayLength = displayText.length;
        
        let fontSize;
        let textContent;
        
        if (displayLength <= 3) {
            // 1-3个字符，单行显示，垂直居中
            fontSize = displayLength === 1 ? 280 : (displayLength === 2 ? 220 : 160);
            textContent = displayText;
            
            // 单行文本居中
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 508 506" version="1.1">
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(0.000000, 2.000000)">
                      <path d="M504,448.085714 C504,479.47619 479.390625,504 447.890625,504 L56.109375,504 C24.609375,504 0,479.47619 0,448.085714 L0,127.314286 C0,107.04127 0,87.9365079 0,70 L504,70 C504,87.9365079 504,107.04127 504,127.314286 L504,448.085714 Z" fill="#EFEFEF" fill-rule="nonzero"/>
                      <text font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="400" fill="${headerColor}" text-anchor="middle" dominant-baseline="central" x="252" y="290">${textContent}</text>
                      <path d="M476.4375,0 L430.171875,0 L27.5625,0 C12.796875,0 0,11.8976351 0,25.6256757 L0,75 L504,75 L504,25.6256757 C504,11.8976351 491.203125,0 476.4375,0 Z" fill="${headerColor}" fill-rule="nonzero"/>
                  </g>
              </g>`;
        } else {
            // 4-6个字符，分成两行显示
            fontSize = displayLength < 5 ? 180 : 140;
            
            // 计算每行显示的字符数，尽量平均分配
            const firstLineLength = Math.ceil(displayLength / 2);
            const firstLine = displayText.substring(0, firstLineLength);
            const secondLine = displayText.substring(firstLineLength);
            
            // 多行文本居中 - 使用不同的方法构建SVG
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 508 506" version="1.1">
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(0.000000, 2.000000)">
                      <path d="M504,448.085714 C504,479.47619 479.390625,504 447.890625,504 L56.109375,504 C24.609375,504 0,479.47619 0,448.085714 L0,127.314286 C0,107.04127 0,87.9365079 0,70 L504,70 C504,87.9365079 504,107.04127 504,127.314286 L504,448.085714 Z" fill="#EFEFEF" fill-rule="nonzero"/>
                      
                      <!-- 第一行文本 -->
                      <text font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="400" fill="${headerColor}" text-anchor="middle" x="252" y="${310 - fontSize * 0.25}">${firstLine}</text>
                      
                      <!-- 第二行文本 -->
                      <text font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="400" fill="${headerColor}" text-anchor="middle" x="252" y="${310 + fontSize * 0.75}">${secondLine}</text>
                      
                      <path d="M476.4375,0 L430.171875,0 L27.5625,0 C12.796875,0 0,11.8976351 0,25.6256757 L0,75 L504,75 L504,25.6256757 C504,11.8976351 491.203125,0 476.4375,0 Z" fill="${headerColor}" fill-rule="nonzero"/>
                  </g>
              </g>`;
        }
        break;
    
    case 'pass':
      // 修改为显示目标日期和倒计时天数
      if (!date) {
        return { error: "pass类型需要指定目标日期" };
      }
      
      // 为pass类型移除SVG中的圆点
      svgContent = svgContent.replace(/<g fill="${accentColor}">[\s\S]*?<\/g>/g, '');
      
      const targetDate = new Date(date);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;
      const targetDay = targetDate.getDate();
      const formattedTargetMonth = targetMonth < 10 ? `0${targetMonth}` : `${targetMonth}`;
      const formattedTargetDay = targetDay < 10 ? `0${targetDay}` : `${targetDay}`;
      const daysLeft = dateInfo.getDaysUntil(date);
      
      svgContent += `
      <text id="year" fill="#FFFFFF" fill-rule="nonzero" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="62" font-weight="normal"><tspan x="54" y="82">${targetYear}</tspan></text>
      <text id="month-day" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', 'Arial'" font-size="78" font-weight="normal" fill="#FFFFFF"><tspan x="54" y="160">${formattedTargetMonth}-${formattedTargetDay}</tspan></text>
      <text id="desc" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', 'Arial'" font-size="62" font-weight="normal" fill="#FFFFFF"><tspan x="334" y="153">还有</tspan></text>
      <text id="days" x="256" y="440" fill="#66757F" fill-rule="nonzero" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="260" font-weight="normal" style="text-anchor: middle">${daysLeft}</text>`;
      break;
    
    case 'weekq':
      // 添加装饰圆点
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="yearq" x="32" y="150" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="120px" style="text-anchor: left">${dateInfo.yearQuarter}</text>
      <text id="weekNum" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="184px" style="text-anchor: middle">${dateInfo.weekNum}周</text>`;
      break;
    
    default:
      // 默认使用day类型
      svgContent += `
      <g fill="${accentColor}">
          <circle cx="462" cy="136" r="14"/>
          <circle cx="462" cy="94" r="14"/>
          <circle cx="419" cy="136" r="14"/>
          <circle cx="419" cy="94" r="14"/>
          <circle cx="376" cy="136" r="14"/>
          <circle cx="376" cy="94" r="14"/>
      </g>
      <text id="month" x="32" y="142" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="100px" style="text-anchor: left">${dateInfo.cnMonth}</text>
      <text id="day" x="256" y="400" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="256px" style="text-anchor: middle">${dateInfo.day}</text>
      <text id="weekday" x="256" y="480" fill="#66757f" font-family="-apple-system, BlinkMacSystemFont, 'Noto Sans', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="64px" style="text-anchor: middle">${dateInfo.cnWeekday}</text>`;
  }
  
  // 结束SVG
  svgContent += `</svg>`;
  return svgContent;
}

// 获取颜色值，支持命名颜色和十六进制值
function getColorValue(color) {
  // 处理已命名的颜色
  const colorMap = {
    'red': '#cf5659',
    'green': '#3cb371',
    'pink': '#ed6ea0',
    'yellow': '#ffd700',
    'blue': '#5aa9e6',
    'cyan': '#00ffff',
    'purple': '#800080',
    'orange': '#ffa500',
    'lime': '#00ff00',
    'teal': '#008080'
  };
  
  // 如果是预定义颜色，返回其十六进制值
  if (colorMap[color.toLowerCase()]) {
    return colorMap[color.toLowerCase()];
  }
  
  // 如果已经是十六进制格式，直接返回
  if (color.startsWith('#')) {
    return color;
  }
  
  // 尝试解析为十六进制
  try {
    // 支持简写，如"f00"转为"#ff0000"
    if (/^[0-9a-f]{3}$/i.test(color)) {
      const r = color.charAt(0);
      const g = color.charAt(1);
      const b = color.charAt(2);
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    
    // 支持6位十六进制
    if (/^[0-9a-f]{6}$/i.test(color)) {
      return `#${color}`;
    }
  } catch (e) {
    // 解析失败时返回默认红色
    return '#cf5659';
  }
  
  // 默认返回红色
  return '#cf5659';
}

// 函数用于使颜色变亮
function lightenColor(hex, percent) {
  // 去掉#号
  hex = hex.replace('#', '');
  
  // 将十六进制转换为RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 使颜色变亮
  const lightenR = Math.min(255, r + (255 - r) * percent / 100);
  const lightenG = Math.min(255, g + (255 - g) * percent / 100);
  const lightenB = Math.min(255, b + (255 - b) * percent / 100);
  
  // 转回十六进制
  const lightenHex = '#' + 
    Math.round(lightenR).toString(16).padStart(2, '0') +
    Math.round(lightenG).toString(16).padStart(2, '0') +
    Math.round(lightenB).toString(16).padStart(2, '0');
  
  return lightenHex;
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
        <td>day, week, weekq, month, year, quarter, text, pass</td>
        <td>day</td>
      </tr>
      <tr>
        <td>color</td>
        <td>图标颜色</td>
        <td>red, green, pink, yellow, blue 或 颜色1+颜色2 渐变格式</td>
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
      <p>3. 显示蓝色到粉色渐变的季度:</p>
      <p><a href="/?type=quarter&color=blue+pink" target="_blank">${req.protocol}://${req.get('host')}/?type=quarter&color=blue+pink</a></p>
    </div>
    <div class="example">
      <p>4. 显示绿色主题的自定义文字:</p>
      <p><a href="/?type=text&content=笔记&color=green" target="_blank">${req.protocol}://${req.get('host')}/?type=text&content=笔记&color=green</a></p>
    </div>
    <div class="example">
      <p>5. 显示距离2026年1月1日的倒计时:</p>
      <p><a href="/?type=pass&date=2026-01-01" target="_blank">${req.protocol}://${req.get('host')}/?type=pass&date=2026-01-01</a></p>
    </div>
    <div class="example">
      <p>6. 显示特定日期:</p>
      <p><a href="/?date=2026-01-01" target="_blank">${req.protocol}://${req.get('host')}/?date=2026-01-01</a></p>
    </div>
    <div class="example">
      <p>7. 显示带季度信息的周数:</p>
      <p><a href="/?type=weekq" target="_blank">${req.protocol}://${req.get('host')}/?type=weekq</a></p>
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
  
  // 修复：从原始URL中获取color参数，处理+号问题
  const colorParam = req.originalUrl.match(/color=([^&]+)/);
  const color = colorParam ? decodeURIComponent(colorParam[1].replace(/\+/g, '%2B')) : 'red';
  const date = req.query.date || '';
  
  // // 添加日志输出
  // console.log('请求参数:', {
  //   originalUrl: req.originalUrl,
  //   type,
  //   content,
  //   originalColor: req.query.color,
  //   parsedColor: color,
  //   date
  // });
  
  // 生成SVG
  const result = generateSVG(type, content, color, date);
  
  // 如果有错误，返回错误信息
  if (result.error) {
    return res.status(400).send(result.error);
  }
  
  // 设置响应头
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // 直接发送结果，不进行重定向
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