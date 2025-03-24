// api/info.js - 信息页面API路由
export default function handler(req, res) {
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
      <p>基本URL格式：<code>${req.headers.host}/api/?type=类型&color=颜色&date=日期&content=内容</code></p>
      
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
        <p><a href="/api/" target="_blank">https://${req.headers.host}/api/</a></p>
      </div>
      <div class="example">
        <p>2. 显示蓝色主题的周数:</p>
        <p><a href="/api/?type=week&color=blue" target="_blank">https://${req.headers.host}/api/?type=week&color=blue</a></p>
      </div>
      <div class="example">
        <p>3. 显示绿色主题的自定义文字:</p>
        <p><a href="/api/?type=text&content=笔记&color=green" target="_blank">https://${req.headers.host}/api/?type=text&content=笔记&color=green</a></p>
      </div>
      <div class="example">
        <p>4. 显示距离2026年1月1日的倒计时:</p>
        <p><a href="/api/?type=pass&date=2026-01-01" target="_blank">https://${req.headers.host}/api/?type=pass&date=2026-01-01</a></p>
      </div>
      <div class="example">
        <p>5. 显示特定日期:</p>
        <p><a href="/api/?date=2026-01-01" target="_blank">https://${req.headers.host}/api/?date=2026-01-01</a></p>
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
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }