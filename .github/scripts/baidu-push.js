/**
 * 百度链接自动推送脚本（龙之谷启程官网专用）
 * 每次推送到 main 后自动运行，把本次变更页面的链接推送给百度，加快收录
 * 需要在仓库 Settings -> Secrets and variables -> Actions 中配置 BAIDU_PUSH_TOKEN
 *
 * 推送策略（节省每日配额）：
 *  - push 事件：只推送本次提交中变更的 HTML 页面对应的链接
 *  - sitemap.xml 变更（新增页面）或手动触发：推送全量链接
 */
const fs = require('fs');

const SITE = 'lzgqc.mengchen.me';
const BASE = 'https://' + SITE + '/';
const TOKEN = process.env.BAIDU_TOKEN;

if (!TOKEN) {
  console.log('⏭ 未配置 BAIDU_PUSH_TOKEN 密钥，本次跳过百度推送。');
  console.log('  配置方法：仓库 Settings -> Secrets and variables -> Actions -> New repository secret');
  process.exit(0);
}

// ===== 解析本次 push 事件中变更的文件 =====
let changedFiles = null;
try {
  if (process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const set = new Set();
    (event.commits || []).forEach(c => {
      [].concat(c.added || [], c.modified || []).forEach(f => set.add(f));
    });
    changedFiles = set;
  }
} catch (e) {
  changedFiles = null;
}

// ===== 收集 sitemap 中的全部链接 =====
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const allUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

if (allUrls.length === 0) {
  console.log('⏭ sitemap 中没有链接，跳过推送。');
  process.exit(0);
}

// sitemap 链接 -> 对应仓库文件名
function urlToFile(u) {
  const f = u.replace(BASE, '');
  return f === '' ? 'index.html' : f;
}

// ===== 决定本次推送哪些链接 =====
let urls;
if (!changedFiles || changedFiles.has('sitemap.xml')) {
  urls = allUrls;
  console.log('推送模式：全量（' + urls.length + ' 条' + (changedFiles && changedFiles.has('sitemap.xml') ? '，sitemap 有变更' : '，手动触发') + '）');
} else {
  urls = allUrls.filter(u => changedFiles.has(urlToFile(u)));
  console.log('推送模式：增量（本次变更涉及的 ' + urls.length + ' 条）');
}

if (urls.length === 0) {
  console.log('⏭ 本次提交未变更任何页面（仅样式/脚本/配置），跳过推送以节省配额。');
  process.exit(0);
}

console.log('本次推送链接：');
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
