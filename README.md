# 龙之谷启程官网 · 发文章指南

网站地址：https://lzgqc.fmbly.com
GitHub 仓库：https://github.com/mengcheng-ying/lzgqc-site

---

## 最省事的方法

直接把文章文字发给 TRAE 助手，说"帮我把这篇攻略发到网站上"，全自动完成，不用自己动手。

---

## 自己发的方法（全程浏览器操作，不用装任何软件）

### 第 1 步：新建文章文件

1. 打开仓库主页，点 **Add file → Create new file**
2. 文件名用英文小写+短横线，例如：`guide-zhuangbei.html`
   （.html 后缀必须带；名字会成为网址，如 `lzgqc.fmbly.com/guide-zhuangbei`）
3. 打开仓库里的 `template.html`，点右上角铅笔图标进入编辑模式
4. 全选复制全部内容，粘贴到刚才新建的文件里
5. 按照【改1】~【改7】的注释逐处替换成自己文章的内容
6. 正文部分：把模板里"文章正文"区域的示例段落删掉，粘贴自己的内容
   - 段落用 `<p>文字</p>` 包裹
   - 小标题用 `<h2>标题</h2>`（大标题）或 `<h3>标题</h3>`（小标题）
   - 重点加粗用 `<strong>重点</strong>`
   - 列表、表格直接照抄模板里的示例改内容
7. 拉到页面底部，点 **Commit changes** 提交

### 第 2 步：加入攻略列表页

1. 打开仓库里的 `articles.html`，点铅笔图标编辑
2. 找到文章列表区域，复制任意一个 `<a class="list-card">...</a>` 整块
3. 粘贴在最上面（新文章排前面），改 4 处：
   - `href="/guide-zhuangbei"` → 你的文件名（无后缀）
   - `<span class="cat">分类</span>` → 与文章一致
   - `<span class="date">日期</span>` → 发布日期
   - `<h2>标题</h2>` 和 `<p>摘要</p>` → 文章标题和一句话摘要
4. Commit 提交

### 第 3 步：加入网站地图

1. 打开 `sitemap.xml`，点铅笔编辑
2. 复制任意一个 `<url>...</url>` 块，粘贴到 `</urlset>` 之前
3. 改成：`<loc>https://lzgqc.fmbly.com/guide-zhuangbei</loc>` 和当天日期
4. Commit 提交

### 完成！接下来全自动

- 约 1 分钟后 Cloudflare Pages 自动上线新文章
- GitHub Actions 自动把新链接推送给百度收录
- 想在首页攻略区也展示的话，编辑 `index.html`，复制一个 `guide-mini` 块添加即可（可选）

---

## 发文小建议（利于百度收录排名）

- 标题带上"龙之谷启程"+ 具体主题，如《龙之谷启程装备强化攻略》
- description 摘要把关键词放在前 20 个字
- 每篇文章围绕一个主题写透，别一篇塞太多内容
- 保持更新频率，每周 1~2 篇比一次发 10 篇效果好

## 网站结构说明

```
index.html          首页
articles.html       攻略列表页
guide-*.html        5篇攻略文章
template.html       新文章模板（复制它来发新文章）
sitemap.xml         站点地图（发新文章记得加）
robots.txt          搜索引擎抓取规则
css/  js/           样式和脚本（一般不用动）
.github/            百度自动推送工作流（自动运行，不用管）
```
