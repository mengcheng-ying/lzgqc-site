/**
 * 百度链接自动推送脚本（龙之谷启程官网专用）
 * 每次推送到 main 后自动运行，把 sitemap 中的链接推送给百度加快收录
 * 需要在仓库 Settings -> Secrets and variables -> Actions 中配置 BAIDU_PUSH_TOKEN
 */
const fs = require('fs');

const SITE = 'lzgqc.mengchen.me';
const TOKEN = process.env.BAIDU_TOKEN;

if (!TOKEN) {
  console.log('⏭ 未配置 BAIDU_PUSH_TOKEN 密钥，本次跳过百度推送。');
  console.log('  配置方法：仓库 Settings -> Secrets and variables -> Actions -> New repository secret');
  process.exit(0);
}

// ===== 收集 sitemap 中的全部链接 =====
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

if (urls.length === 0) {
  console.log('⏭ sitemap 中没有链接，跳过推送。');
  process.exit(0);
}

console.log('本次推送 ' + urls.length + ' 条链接到百度...');
console.log(urls.join('\n'));

// ===== 调用百度推送 API =====
fetch('http://data.zz.baidu.com/urls?site=' + SITE + '&token=' + TOKEN, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: urls.join('\n')
})
  .then(async res => {
    const text = await res.text();
    console.log('百度返回：' + text);
    if (text.includes('"success"')) {
      const m = text.match(/"success":\s*(\d+)/);
      console.log('✅ 推送成功，百度已接收 ' + (m ? m[1] : urls.length) + ' 条链接');
    } else if (text.includes('over quota')) {
      console.log('⚠️ 今日配额已用完，配额每日重置，明天自动恢复。');
    } else {
      console.log('⚠️ 百度返回异常，请检查 BAIDU_PUSH_TOKEN 与站点 ' + SITE);
    }
  })
  .catch(err => {
    console.error('❌ 推送请求失败：' + err.message);
    process.exit(1);
  });
