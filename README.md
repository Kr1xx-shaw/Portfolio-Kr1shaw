# Xichen Zhao / Kris Shaw — Portfolio

个人作品集网站，包含 Work、About 和项目详情页，中英文切换、WebGL 动态背景、鼠标交互及响应式布局。

线上网站：https://xichen-zhao-creative-studio.shaw8888.chatgpt.site

本次同步对应线上版本 39，源版本提交：`eb3066f6e1e54a296228ece814f7f16986d661be`。

## 项目结构

- `dist/`：页面、样式、脚本及完整图片素材。
- `dist/assets/portfolio-pages.js`：首页与 Work 的滚动、透视切换和滚轮交互。
- `dist/assets/about-tools.js`：About 人物、工具及兴趣卡片交互。
- `dist/portfolio-shell.css`：各页面共用的导航和全屏字体比例。
- `dist/projects.js`：作品数据及项目内容。
- `worker.mjs`：网站路由与项目上传接口。
- `build.mjs`：打包页面和素材，生成 `dist/server/index.js`。
- `check.mjs`：上传权限和文件类型检查。
- `.openai/hosting.json`：现有 Sites 项目的托管信息。

## 构建与检查

使用 Node.js 22 或更新版本，无需安装运行依赖：

```sh
npm run build
node check.mjs
```

独立 Cloudflare 部署入口为 `worker.mjs`，由 `wrangler.toml` 配置；静态文件直接取自 `dist/`。`dist/server/index.js` 是兼容旧打包流程的产物，不是独立部署入口。持久上传功能需要 `BUCKET` R2 绑定和 Cloudflare Access 管理员认证。

此仓库是当前网站源码的同步副本；向 GitHub 提交代码不会自动更新现有线上网站。

## 素材说明

作品图片、人物素材和字体均保留在仓库内。第三方素材与代码来源见 `dist/assets/CREDITS.txt` 及素材目录中的许可文件。仓库公开不代表作品和素材可自由转载或商用。

## 独立 Cloudflare Workers 部署

1. 安装 Wrangler 并登录 Cloudflare：`npx wrangler login`。
2. 创建 R2 存储桶：`npx wrangler r2 bucket create krisshaw-portfolio`，或将 `wrangler.toml` 的 `bucket_name` 改为现有桶名。现有 Sites 中的项目和上传图片不会自动迁移，需要另行复制 `projects/` 与 `media/` 对象。
3. 在 Cloudflare Zero Trust 创建 Self-hosted Access 应用，保护网站的 `/admin` 路径，允许管理员邮箱；在 `wrangler.toml` 填入 Access 团队域名（包含 `https://`）、应用 Audience 和管理员邮箱。管理员访问 `/admin` 完成登录；API 验证签名、签发方、受众、有效期和邮箱。缺少配置时管理员操作默认拒绝。
4. `npx wrangler deploy` 发布。静态资源通过 Workers Assets 提供，`BUCKET` 用于 R2。部署后检查 `/api/health`、公开作品读取、管理员登录和上传。

### 首页出现 ERR_TOO_MANY_REDIRECTS

必须保留 `[assets]` 下的 `html_handling = "none"`。Worker 会将首页与前端路由内部改写到 `/index.html`；Cloudflare 默认的 HTML 规范化会把该地址重定向回 `/`，导致循环。关闭规范化后，内部改写直接返回页面，不需要修改 R2 或关闭管理员认证。

修复后使用仓库根目录的 `wrangler.toml` 重新部署（`npx wrangler deploy`）。运行 `node check.mjs` 可检查配置及模拟 Assets 重定向行为；这不替代线上验收。部署完成后确认 `/`、`/work`、`/about` 返回页面且没有循环跳转。

需要实际 Cloudflare 账户配置和 R2 数据迁移才能验证线上登录与上传。仓库推送不会自动部署。
