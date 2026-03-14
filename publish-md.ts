import { initRenderer } from "./src/doocs-md/core/src/index";
import { marked } from "marked";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

interface Config {
  wechat: {
    appId: string;
    appSecret: string;
  };
  author?: string;
}

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), "config.yaml");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "配置文件 config.yaml 不存在，请复制 config.example.yaml 并填写配置",
    );
  }
  const configContent = fs.readFileSync(configPath, "utf-8");
  return yaml.load(configContent) as Config;
}

const CONFIG = loadConfig();
const WECHAT_APPID = CONFIG.wechat?.appId || process.env.WECHAT_APPID;
const WECHAT_APPSECRET =
  CONFIG.wechat?.appSecret || process.env.WECHAT_APPSECRET;
const DEFAULT_AUTHOR = CONFIG.author || "Anonymous";

const PRIMARY_COLOR = "rgb(248, 57, 41)";
const FONT_FAMILY =
  "'Microsoft YaHei','PingFang SC','Helvetica Neue',Helvetica,Arial,sans-serif";
const CODE_FONT = "'Operator Mono',Consolas,Monaco,Menlo,monospace";

const STYLES: Record<string, string> = {
  // ---- 标题 ----
  h1: `margin-top:30px;margin-bottom:15px;font-size:20px;font-weight:bold;color:#222;line-height:1.5em;text-align:center;`,
  // h2 外层：与 mdnice 一致，仅做容器；视觉由内部 span.content 承载
  h2: `margin-top:30px;margin-bottom:15px;margin-left:0;margin-right:0;display:block;line-height:1.5em;text-align:left;position:relative;padding:0;border:none;`,
  // h2 内部 span.content —— 左竖线 + 主色
  h2_content: `font-size:18px;color:rgb(34,34,34);line-height:1.8em;letter-spacing:0em;padding:0 0 0 10px;border-left:5px solid ${PRIMARY_COLOR};`,
  // h3 外层
  h3: `margin-top:30px;margin-bottom:15px;margin-left:0;margin-right:0;padding:0;display:flex;`,
  h3_content: `font-size:16px;color:${PRIMARY_COLOR};line-height:1.5em;letter-spacing:0em;font-weight:bold;display:block;`,
  // h4
  h4: `margin-top:30px;margin-bottom:15px;font-size:15px;font-weight:bold;color:#222;line-height:1.5em;`,

  // ---- 正文 ----
  p: `color:rgb(53,53,53);font-size:16px;line-height:1.8em;letter-spacing:0.04em;text-align:left;text-indent:0em;margin:0;padding:8px 0;`,
  // blockquote —— 左侧主题色竖条 + 小圆角容器
  blockquote: `margin:20px 0;padding:12px 16px;border-left:4px solid ${PRIMARY_COLOR};border-radius:6px;background:rgba(0,0,0,0.03);display:block;overflow:auto;`,
  blockquote_p: `text-indent:0em;padding:6px 0;color:rgb(53,53,53);font-size:16px;line-height:1.8em;letter-spacing:0.04em;text-align:left;font-weight:normal;margin:0;`,

  // ---- 列表 ----
  ul: `list-style-type:disc;margin:8px 0;padding:0 0 0 25px;color:rgb(0,0,0);`,
  ol: `list-style-type:decimal;margin:8px 0;padding:0 0 0 25px;color:rgb(0,0,0);`,
  li: ``, // li 本身最小化，重点在内部 section
  li_section: `margin:5px 0;color:rgb(53,53,53);font-size:16px;line-height:1.8em;letter-spacing:0.04em;text-align:left;font-weight:normal;`,

  // ---- 行内元素 ----
  code: `color:${PRIMARY_COLOR};font-size:14px;line-height:1.8em;letter-spacing:0em;background:rgba(27,31,35,0.05);margin:0 2px;padding:2px 4px;border-radius:4px;overflow-wrap:break-word;font-family:${CODE_FONT};word-break:break-all;`,
  strong: `color:${PRIMARY_COLOR};font-weight:bold;`,
  a: `color:${PRIMARY_COLOR};font-weight:bold;border-bottom:1px solid ${PRIMARY_COLOR};text-decoration:none;overflow-wrap:break-word;`,
  em: `font-style:italic;color:rgb(53,53,53);`,

  // ---- 代码块 ----
  pre: `border-radius:5px;box-shadow:rgba(0,0,0,0.55) 0px 2px 10px;text-align:left;margin:10px 0;padding:0;`,
  pre_mac_bar: `display:block;background:url(https://files.mdnice.com/user/3441/876cad08-0422-409d-bb5a-08afec5da8ee.svg);height:30px;width:100%;background-size:40px;background-repeat:no-repeat;background-color:#282c34;margin-bottom:-7px;border-radius:5px;background-position:10px 10px;`,
  "code.hljs": `overflow-x:auto;padding:16px;color:#abb2bf;padding-top:15px;background:#282c34;border-radius:5px;display:-webkit-box;font-family:Consolas,Monaco,Menlo,monospace;font-size:12px;`,
  // hljs token 颜色（One Dark 主题）
  "hljs-attr": `color:#d19a66;line-height:26px;`,
  "hljs-string": `color:#98c379;line-height:26px;`,
  "hljs-literal": `color:#56b6c2;line-height:26px;`,
  "hljs-comment": `color:#5c6370;font-style:italic;line-height:26px;`,
  "hljs-keyword": `color:#c678dd;line-height:26px;`,
  "hljs-number": `color:#d19a66;line-height:26px;`,
  "hljs-built_in": `color:#e6c07b;line-height:26px;`,

  // ---- 图片 ----
  img: `display:block;margin:0 auto;max-width:100%;border-radius:16px;object-fit:fill;`,
  figure: `margin:10px 0;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center;`,
  figcaption: `color:rgb(136,136,136);font-size:12px;line-height:1.5em;letter-spacing:0em;text-align:center;font-weight:normal;margin-top:5px;margin-bottom:0;padding:0;`,

  // ---- 表格 ----
  table: `color:#333;width:auto;border-collapse:collapse;margin:10px 0;border:1px solid #dfdfdf;`,
  th: `border:1px solid #dfdfdf;padding:0.5em 1em;background:${PRIMARY_COLOR};color:#fff;font-weight:bold;text-align:left;word-break:keep-all;white-space:nowrap;`,
  td: `border:1px solid #dfdfdf;padding:0.5em 1em;text-align:left;word-break:normal;overflow-wrap:break-word;`,

  // ---- 分隔 / 脚注 ----
  hr: `border-style:solid;border-width:1px 0 0;border-color:rgba(0,0,0,0.1);margin:1.5em 0;`,
  footnotes_sep: `margin:30px 0 15px;border:none;border-bottom:3px double ${PRIMARY_COLOR};`,
  footnotes_title: `display:block;color:${PRIMARY_COLOR};font-size:20px;line-height:1.5em;letter-spacing:0em;text-align:left;font-weight:bold;`,
  footnotes: `margin:0.5em 0;font-size:80%;color:#333;`,
  footnote_word: `color:${PRIMARY_COLOR};font-weight:bold;`,
  footnote_ref: `line-height:0;color:${PRIMARY_COLOR};font-weight:bold;`,

  // ---- 容器 ----
  section: `font-family:${FONT_FAMILY};font-size:16px;line-height:1.8em;text-align:left;color:rgb(53,53,53);`,
};


async function getAccessToken(): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;
  const response = await fetch(url);
  const data: any = await response.json();
  if (data.access_token) return data.access_token;
  throw new Error(`获取 access_token 失败: ${JSON.stringify(data)}`);
}

async function uploadImage(
  accessToken: string,
  imagePath: string,
): Promise<{ url: string; mediaId: string }> {
  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}&type=image`;
  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const formData = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${path.basename(imagePath)}"\r\nContent-Type: image/jpeg\r\n\r\n`,
    ),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: formData,
  });
  const data: any = await response.json();
  if (data.url && data.media_id) {
    return { url: data.url, mediaId: data.media_id };
  }
  throw new Error(`上传图片失败: ${JSON.stringify(data)}`);
}

async function getCoverImage(accessToken: string): Promise<string | null> {
  const url = `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${accessToken}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ type: "image", offset: 0, count: 1 }),
  });
  const data: any = await response.json();
  return data.item?.[0]?.media_id || null;
}

async function publishDraft(
  accessToken: string,
  title: string,
  content: string,
  thumbMediaId: string,
  options: { author?: string; digest?: string } = {},
): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`;
  const article: any = { title, content, thumb_media_id: thumbMediaId };
  if (options.author) article.author = options.author;
  if (options.digest) article.digest = options.digest;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ articles: [article] }),
  });
  const data: any = await response.json();
  if (data.media_id) return data.media_id;
  throw new Error(`发布草稿失败: ${JSON.stringify(data)}`);
}

// 顺序处理图片（保证第一张作为封面）
async function processImages(
  markdown: string,
  mdDir: string,
  accessToken: string,
): Promise<{ content: string; images: string[]; firstMediaId?: string }> {
  const images: string[] = [];
  let firstMediaId: string | undefined;
  let content = markdown;

  // 找出所有本地图片
  const matches: Array<{
    full: string;
    alt: string;
    path: string;
    index: number;
  }> = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const imgPath = match[2];
    if (!imgPath.startsWith("http://") && !imgPath.startsWith("https://")) {
      matches.push({
        full: match[0],
        alt: match[1],
        path: imgPath,
        index: match.index,
      });
    }
  }

  console.log(`   发现 ${matches.length} 张本地图片`);

  // 按顺序处理（先上传第一张作为封面）
  for (let i = 0; i < matches.length; i++) {
    const { full, alt, path: imgPath } = matches[i];
    const fullPath = path.resolve(mdDir, imgPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`   ⚠️  图片不存在: ${imgPath}`);
      continue;
    }

    try {
      console.log(
        `   📤 上传图片 ${i + 1}/${matches.length}: ${path.basename(imgPath)}...`,
      );
      const { url, mediaId } = await uploadImage(accessToken, fullPath);
      images.push(url);

      // 第一张作为封面
      if (i === 0) {
        firstMediaId = mediaId;
        console.log(`   ✅ 上传成功 (将作为封面)`);
      } else {
        console.log(`   ✅ 上传成功`);
      }

      // 替换内容
      content = content.replace(full, `![${alt}](${url})`);
    } catch (error: any) {
      console.log(`   ❌ 上传失败: ${error.message}`);
    }
  }

  return { content, images, firstMediaId };
}

// 更健壮的内联样式添加函数 (mdnice 风格)
function addInlineStyles(html: string): string {
  let s = html;

  // ---- 0. 修复渲染器生成的列表项文本前缀 ----
  // renderer-impl listitem() 会在内容前加 "• " 或 "N. "，
  // 但 mdnice 实际由 CSS list-style-type 显示 bullet/数字，文本不含前缀。
  // 必须在包 section 之前把前缀去掉。
  s = s.replace(/<li([^>]*)>(\s*)•\s/g, "<li$1>$2");
  s = s.replace(/<li([^>]*)>(\s*)\d+\.\s/g, "<li$1>$2");

  // ---- 1. 结构性变换（在添加内联样式之前完成） ----

  // h2: 用 span.content 包裹文本，添加左竖线视觉
  // mdnice 结构：<h2><span class="prefix" style="display:none;"></span><span class="content" style="...">text</span><span class="suffix" style="display:none;"></span></h2>
  s = s.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/g,
    (_m, attrs: string, inner: string) => {
      // 如果已经有 span.content（doocs 渲染器生成的），跳过
      if (inner.includes('class="content"')) return `<h2${attrs}>${inner}</h2>`;
      return `<h2${attrs}><span class="prefix" style="display:none;"></span><span class="content" style="${STYLES.h2_content}">${inner.trim()}</span><span class="suffix" style="display:none;"></span></h2>`;
    },
  );

  // h3: 用 span.content 包裹
  s = s.replace(
    /<h3([^>]*)>([\s\S]*?)<\/h3>/g,
    (_m, attrs: string, inner: string) => {
      if (inner.includes('class="content"')) return `<h3${attrs}>${inner}</h3>`;
      return `<h3${attrs}><span class="prefix" style="display:none;"></span><span class="content" style="${STYLES.h3_content}">${inner.trim()}</span><span class="suffix" style="display:none;"></span></h3>`;
    },
  );

  // li: 在内容外包一层 section（mdnice 的列表结构）
  s = s.replace(
    /<li([^>]*)>([\s\S]*?)<\/li>/g,
    (_m, attrs: string, inner: string) => {
      // 跳过已经包含 section 的（doocs 渲染器可能已生成）
      if (inner.includes("<section")) return `<li${attrs}>${inner}</li>`;
      return `<li${attrs}><section style="${STYLES.li_section}">${inner.trim()}</section></li>`;
    },
  );

  // ---- 2. 基础标签内联样式（先处理带 class 的，再处理裸标签）----

  const styleReplacements = [
    // 带 class 的特殊处理（doocs/md 生成的结构）
    { pattern: /<h1[^>]*class="h1"[^>]*>/g, style: STYLES.h1 },
    { pattern: /<h2[^>]*class="h2"[^>]*>/g, style: STYLES.h2 },
    { pattern: /<h3[^>]*class="h3"[^>]*>/g, style: STYLES.h3 },
    { pattern: /<h4[^>]*class="h4"[^>]*>/g, style: STYLES.h4 },
    { pattern: /<p[^>]*class="p"[^>]*>/g, style: STYLES.p },
    { pattern: /<p[^>]*class="footnotes"[^>]*>/g, style: STYLES.footnotes },
    {
      pattern: /<blockquote[^>]*class="blockquote"[^>]*>/g,
      style: STYLES.blockquote,
    },
    { pattern: /<ul[^>]*class="ul"[^>]*>/g, style: STYLES.ul },
    { pattern: /<ol[^>]*class="ol"[^>]*>/g, style: STYLES.ol },
    { pattern: /<li[^>]*class="listitem"[^>]*>/g, style: STYLES.li },
    { pattern: /<code[^>]*class="codespan"[^>]*>/g, style: STYLES.code },
    {
      pattern: /<code[^>]*class="language-[^"]*"[^>]*>/g,
      style: STYLES["code.hljs"],
    },
    {
      pattern: /<code[^>]*class="hljs"[^>]*>/g,
      style: STYLES["code.hljs"],
    },
    { pattern: /<strong[^>]*class="strong"[^>]*>/g, style: STYLES.strong },
    { pattern: /<pre[^>]*class="hljs code__pre"[^>]*>/g, style: STYLES.pre },
    // 不要给 mac-sign SVG span 覆盖成 URL 背景样式（渲染器已内联 SVG）
    { pattern: /<figure[^>]*>/g, style: STYLES.figure },
    { pattern: /<img[^>]*src="[^"]*"[^>]*>/g, style: STYLES.img },
    {
      pattern: /<figcaption[^>]*class="figcaption"[^>]*>/g,
      style: STYLES.figcaption,
    },
    { pattern: /<table[^>]*class="preview-table"[^>]*>/g, style: STYLES.table },
    { pattern: /<th[^>]*class="th"[^>]*>/g, style: STYLES.th },
    { pattern: /<td[^>]*class="td"[^>]*>/g, style: STYLES.td },
    // span.content 内的 h2/h3 子元素（由上面步骤 1 注入，带 class="content"）
    {
      pattern: /<span[^>]*class="content"[^>]*>/g,
      style: ``, // 样式已在步骤 1 内联到 style 属性上，这里不再追加
    },
    // 脚注
    {
      pattern: /<span[^>]*class="footnote-word"[^>]*>/g,
      style: STYLES.footnote_word,
    },
    {
      pattern: /<sup[^>]*class="footnote-ref"[^>]*>/g,
      style: STYLES.footnote_ref,
    },
    // 无 class 的基础标签
    { pattern: /<p(?![^>]*style)[^>]*>/g, style: STYLES.p },
    { pattern: /<h1(?![^>]*style)[^>]*>/g, style: STYLES.h1 },
    { pattern: /<h2(?![^>]*style)[^>]*>/g, style: STYLES.h2 },
    { pattern: /<h3(?![^>]*style)[^>]*>/g, style: STYLES.h3 },
    { pattern: /<h4(?![^>]*style)[^>]*>/g, style: STYLES.h4 },
    { pattern: /<blockquote(?![^>]*style)[^>]*>/g, style: STYLES.blockquote },
    { pattern: /<ul(?![^>]*style)[^>]*>/g, style: STYLES.ul },
    { pattern: /<ol(?![^>]*style)[^>]*>/g, style: STYLES.ol },
    { pattern: /<li(?![^>]*style)[^>]*>/g, style: STYLES.li },
    {
      pattern: /<code(?![^>]*style)(?![^>]*class="language-")[^>]*>/g,
      style: STYLES.code,
    },
    { pattern: /<strong(?![^>]*style)[^>]*>/g, style: STYLES.strong },
    { pattern: /<em(?![^>]*style)[^>]*>/g, style: STYLES.em },
    { pattern: /<a(?![^>]*style)[^>]*>/g, style: STYLES.a },
    { pattern: /<img(?![^>]*style)[^>]*>/g, style: STYLES.img },
    { pattern: /<figcaption(?![^>]*style)[^>]*>/g, style: STYLES.figcaption },
    { pattern: /<hr(?![^>]*style)[^>]*>/g, style: STYLES.hr },
    { pattern: /<table(?![^>]*style)[^>]*>/g, style: STYLES.table },
    { pattern: /<th(?![^>]*style)[^>]*>/g, style: STYLES.th },
    { pattern: /<td(?![^>]*style)[^>]*>/g, style: STYLES.td },
    {
      pattern: /<section(?![^>]*style)(?![^>]*class="footnotes")[^>]*>/g,
      style: STYLES.section,
    },
  ];

  for (const { pattern, style } of styleReplacements) {
    if (!style) continue; // skip empty style entries
    s = s.replace(pattern, (match) => {
      if (match.includes('style="')) {
        return match.replace(/style="([^"]*)"/, `style="$1${style}"`);
      }
      return match.replace(/>$/, ` style="${style}">`);
    });
  }

  // ---- 3. blockquote 内的 p 使用 blockquote_p 样式 ----
  s = s.replace(
    /(<blockquote[^>]*>)([\s\S]*?)(<\/blockquote>)/g,
    (_m, open: string, inner: string, close: string) => {
      const fixedInner = inner.replace(
        /<p[^>]*style="[^"]*"[^>]*>/g,
        `<p style="${STYLES.blockquote_p}">`,
      );
      return `${open}${fixedInner}${close}`;
    },
  );

  // ---- 4. 代码块 mac 标题栏 ----
  // 渲染器输出内联 SVG 三色圆点：<span class="mac-sign" style="padding:10px 14px 0;"><svg>...</svg></span>
  // 给这个 span 重写 style，使其呈现 mdnice 的 mac 顶栏布局（深色背景 + 顶部圆角），
  // SVG 本身作为 inline 子元素提供三色圆点视觉。
  const macSignStyle = `display:block;height:30px;background-color:#282c34;margin-bottom:-7px;border-radius:5px 5px 0 0;padding:10px 14px 0;`;
  s = s.replace(
    /<span([^>]*)class="mac-sign"([^>]*)style="[^"]*"([^>]*)>/g,
    `<span$1class="mac-sign"$2style="${macSignStyle}"$3>`,
  );
  // 如果 pre 内完全没有 mac-sign span，则注入 URL 背景版作为兜底
  s = s.replace(
    /(<pre[^>]*style="[^"]*"[^>]*>)(?!\s*<span)/g,
    (_m, preOpen: string) => {
      return `${preOpen}<span style="${STYLES.pre_mac_bar}"></span>`;
    },
  );

  // ---- 5. 代码块 hljs token 着色（One Dark 主题） ----
  const hljsTokenMap: Record<string, string> = {
    "hljs-attr": STYLES["hljs-attr"],
    "hljs-string": STYLES["hljs-string"],
    "hljs-literal": STYLES["hljs-literal"],
    "hljs-comment": STYLES["hljs-comment"],
    "hljs-keyword": STYLES["hljs-keyword"],
    "hljs-number": STYLES["hljs-number"],
    "hljs-built_in": STYLES["hljs-built_in"],
    "hljs-punctuation": `color:#abb2bf;line-height:26px;`,
  };
  for (const [cls, style] of Object.entries(hljsTokenMap)) {
    const re = new RegExp(`<span[^>]*class="${cls}"[^>]*>`, "g");
    s = s.replace(re, (match) => {
      if (match.includes('style="')) {
        return match.replace(/style="([^"]*)"/, `style="$1${style}"`);
      }
      return match.replace(/>$/, ` style="${style}">`);
    });
  }

  // ---- 6. 修复脚注引用中的 CSS 变量为内联色值 ----
  s = s.replace(
    /color:\s*var\(--md-primary-color\)/g,
    `color:${PRIMARY_COLOR}`,
  );

  // ---- 7. 给裸 <sup> 标签（link 内的脚注上标）加内联样式 ----
  s = s.replace(
    /<sup(?![^>]*style)[^>]*>/g,
    `<sup style="${STYLES.footnote_ref}">`,
  );

  return s;
}

function extractTitle(markdown: string): string {
  const fmMatch = markdown.match(
    /^---\s*\n[\s\S]*?title:\s*(.+?)\n[\s\S]*?---/,
  );
  if (fmMatch) return fmMatch[1].trim();
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  return "未命名文章";
}

function normalizeLeadingCover(html: string): string {
  let normalized = html;

  // 首图如果已经被渲染为图片段落，只压缩它自己的上下间距；不要再改后续正文段落的横向/纵向逻辑
  normalized = normalized.replace(
    /^<p([^>]*)class="p image-block"([^>]*)style="([^"]*)"([^>]*)>(\s*<img[^>]*style="([^"]*)"[^>]*>\s*)<\/p>/,
    (
      _match,
      beforeClass,
      afterClass,
      pStyle,
      afterStyle,
      imgHtml,
      imgStyle,
    ) => {
      const nextImgHtml = imgHtml.replace(
        /style="([^"]*)"/,
        `style="${imgStyle};margin:0;width:100%;max-width:100%;box-sizing:border-box;"`,
      );
      return `<p${beforeClass}class="p image-block"${afterClass}style="${pStyle};margin-top:0;margin-bottom:0.35em;"${afterStyle}>${nextImgHtml}</p>`;
    },
  );

  // 兼容旧的 figure 输出：转成纯 img
  normalized = normalized.replace(
    /^<figure[^>]*>\s*(<img[^>]*>)\s*<figcaption[^>]*><\/figcaption>\s*<\/figure>/,
    "$1",
  );

  // 如果还是旧结构里的纯 img，继续只做首图自身的间距压缩
  normalized = normalized.replace(
    /^<img([^>]*)style="([^"]*)"([^>]*)>/,
    (_match, before, style, after) =>
      `<img${before}style="${style};margin:0 0 0.35em;width:100%;max-width:100%;box-sizing:border-box;"${after}>`,
  );

  return normalized;
}

function convertToHTML(markdown: string): string {
  const renderer = initRenderer({
    legend: "alt",
    citeStatus: true,
    countStatus: false,
    isMacCodeBlock: true,
    isShowLineNumber: false,
    themeMode: "light",
  });

  const { markdownContent, readingTime } =
    renderer.parseFrontMatterAndContent(markdown);
  const rawHtml = marked.parse(markdownContent) as string;

  // 表格处理
  let htmlContent = rawHtml.replace(
    /<table>([\s\S]*?)<\/table>/g,
    (match, content) => {
      const processed = content
        .replace(/<th>/g, `<th style="${STYLES.th}">`)
        .replace(/<td>/g, `<td style="${STYLES.td}">`);
      return `<section style="max-width:100%;overflow:auto"><table style="${STYLES.table}">${processed}</table></section>`;
    },
  );

  // 根据截图特判正文首图：作为封面块处理，压掉上下空白并对齐后续正文
  htmlContent = normalizeLeadingCover(htmlContent);

  // 渲染器的 buildFootnotes() 生成 <h4>引用链接</h4><p class="footnotes">...
  // 但 mdnice 使用 <section class="footnotes-sep"> + <section class="footnotes"> 结构。
  // 我们先拿到原始脚注 HTML，再改造成 mdnice 格式。
  const rawFootnotes = renderer.buildFootnotes();
  let mdniceFootnotes = "";
  if (rawFootnotes) {
    // 解析出每条脚注：<code style="...">[N]</code>...<br/>
    const fnItems: Array<{ index: string; text: string }> = [];
    const fnRegex =
      /<code[^>]*>\[?(\d+)\.?\]?<\/code>\s*([\s\S]*?)(?:<br\s*\/?>|$)/g;
    let fnMatch;
    while ((fnMatch = fnRegex.exec(rawFootnotes)) !== null) {
      // 提取纯文本，去掉内层 HTML 标签但保留链接文字
      let text = fnMatch[2]
        .replace(/<a[^>]*>.*?<\/a>/g, "") // 去掉 ↩ 链接
        .replace(/<\/?span>/g, "")
        .replace(/<\/?i>/g, "")
        .trim();
      // 去掉开头冒号和空格
      text = text.replace(/^:\s*/, "").replace(/^\s+/, "");
      fnItems.push({ index: fnMatch[1], text });
    }
    if (fnItems.length > 0) {
      const sepStyle = `margin:30px 0 15px;padding:0;border:none;border-bottom:3px double ${PRIMARY_COLOR};`;
      const titleStyle = `display:block;color:${PRIMARY_COLOR};font-size:20px;line-height:1.5em;letter-spacing:0em;text-align:left;font-weight:bold;`;
      const sectionStyle = `margin:0;padding:0;`;
      const itemStyle = `display:flex;font-size:14px;line-height:1.8em;letter-spacing:0em;`;
      const numStyle = `line-height:1.8em;letter-spacing:0em;color:rgba(0,0,0,0.6);display:inline;width:10%;font-size:80%;font-family:${FONT_FAMILY};padding-top:2px;`;
      const pStyle = `text-align:left;text-indent:0em;color:rgb(53,53,53);font-weight:normal;display:inline;padding:0;margin:0;word-break:break-all;flex-basis:0%;flex-grow:1;`;

      const items = fnItems
        .map(
          (fn) =>
            `<span class="footnote-item" style="${itemStyle}"><span class="footnote-num" style="${numStyle}">[${fn.index}] </span><p style="${pStyle}">${fn.text}</p></span>`,
        )
        .join("\n");

      mdniceFootnotes = `<section class="footnotes-sep" style="${sepStyle}"><span style="${titleStyle}">参考资料</span></section>\n<section class="footnotes" style="${sectionStyle}">${items}</section>`;
    }
  }

  const bodyHTML = renderer.createContainer(
    [
      renderer.buildReadingTime(readingTime),
      htmlContent,
      mdniceFootnotes,
      renderer.buildAddition(),
    ].join("\n"),
  );

  const styledHTML = addInlineStyles(bodyHTML);

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;">
  <section data-tool="mdnice编辑器" style="${STYLES.section};padding:0 10px;">${styledHTML}</section>
</body>
</html>`;
}


async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log('\n📝 Markdown → 微信公众号草稿（完整内联样式版）\n')
    console.log('用法: vite-node publish-md.ts <article.md> [选项]\n')
    console.log('选项:')
    console.log('  -t, --title <标题>     指定文章标题')
    console.log('  -a, --author <作者>    指定作者')
    console.log('  -d, --digest <摘要>    指定摘要')
    console.log('  -c, --cover <封面图>   指定封面图片路径')
    console.log('  -h, --help             显示帮助\n')
    console.log('示例:')
    console.log('  vite-node publish-md.ts article.md')
    console.log('  vite-node publish-md.ts article.md -t "标题" -a "作者"')
    console.log('  vite-node publish-md.ts article.md -t "标题" -c /path/to/cover.png\n')
    process.exit(0)
  }

  if (!WECHAT_APPID || !WECHAT_APPSECRET) {
    console.error("\n❌ 错误: 未配置微信公众号 AppID 或 AppSecret");
    console.error(
      "   请编辑 config.yaml 文件填写 wechat.appId 和 wechat.appSecret",
    );
    console.error("   或设置环境变量 WECHAT_APPID 和 WECHAT_APPSECRET\n");
    process.exit(1);
  }

  const mdFile = args[0];
  if (!fs.existsSync(mdFile)) {
    console.error(`❌ 错误: 文件不存在: ${mdFile}`);
    process.exit(1);
  }

  const titleIndex = args.findIndex(a => a === '-t' || a === '--title')
  const authorIndex = args.findIndex(a => a === '-a' || a === '--author')
  const digestIndex = args.findIndex(a => a === '-d' || a === '--digest')
  const coverIndex = args.findIndex(a => a === '-c' || a === '--cover')
  const author = authorIndex !== -1 ? args[authorIndex + 1] : DEFAULT_AUTHOR
  const digest = digestIndex !== -1 ? args[digestIndex + 1] : undefined
  const coverImagePath = coverIndex !== -1 ? args[coverIndex + 1] : undefined

  console.log("\n🚀 开始处理...\n");
  const markdown = fs.readFileSync(mdFile, "utf-8");
  const mdDir = path.dirname(path.resolve(mdFile));
  const extractedTitle = extractTitle(markdown);
  const title = titleIndex !== -1 ? args[titleIndex + 1] : extractedTitle;

  console.log(`📄 文件: ${mdFile}`);
  console.log(`📰 标题: ${title}`);
  console.log(`📝 原文: ${markdown.length} 字符\n`);

  console.log("🔑 连接微信公众平台...");
  const accessToken = await getAccessToken();
  console.log("   ✅ 已连接\n");

  console.log("🖼️  处理图片...");
  const {
    content: processedMarkdown,
    images,
    firstMediaId,
  } = await processImages(markdown, mdDir, accessToken);
  if (images.length > 0) {
    console.log(`   ✅ 共上传 ${images.length} 张图片到微信素材库`);
  } else {
    console.log("   ℹ️  没有本地图片需要上传");
  }
  console.log("");

  console.log("🎨 转换 Markdown → HTML...");
  console.log("   使用样式: 完整内联样式");
  const html = convertToHTML(processedMarkdown);
  console.log(`   ✅ 转换完成 (${html.length} 字符)`);
  console.log("");

  // 使用指定的封面图，或文章中的第一张图，或从素材库获取
  let thumbMediaId: string | undefined
  
  if (coverImagePath && fs.existsSync(coverImagePath)) {
    console.log('📷 上传指定封面图...')
    try {
      const { mediaId } = await uploadImage(accessToken, coverImagePath)
      thumbMediaId = mediaId
      console.log('   ✅ 封面图上传成功')
    } catch (error: any) {
      console.log(`   ❌ 封面上传失败: ${error.message}`)
    }
  }
  
  if (!thumbMediaId && firstMediaId) {
    thumbMediaId = firstMediaId
    console.log('📷 使用文章第一张图作为封面')
    console.log('   ✅ 已设置')
  }
  
  if (!thumbMediaId) {
    console.log('📷 从素材库获取封面图...')
    thumbMediaId = await getCoverImage(accessToken) || ''
    if (thumbMediaId) {
      console.log("   ✅ 已获取");
    } else {
      console.log("   ⚠️  没有可用封面图");
    }
  }
  console.log("");

  console.log("📤 发布到草稿箱...");
  const mediaId = await publishDraft(
    accessToken,
    title,
    html,
    thumbMediaId || "",
    { author, digest },
  );
  console.log("   ✅ 发布成功");
  console.log("");

  console.log("🎉 完成!");
  console.log("");
  console.log(`   Media ID: ${mediaId}`);
  console.log(`   标题: ${title}`);
  if (images.length > 0) {
    console.log(`   图片: ${images.length} 张已上传`);
  }
  console.log("");
  console.log("👉 请在微信公众平台「草稿箱」中查看并发布");
  console.log("");
}

main().catch((error: Error) => {
  console.error("\n❌ 错误:", error.message);
  console.error("");
  process.exit(1);
});
