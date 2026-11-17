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

部署入口为 `dist/server/index.js`，运行于 Cloudflare Workers 兼容环境；持久上传功能需要 `BUCKET` R2 绑定以及现有托管平台提供的身份认证。

此仓库是当前网站源码的同步副本；向 GitHub 提交代码不会自动更新现有线上网站。

## 素材说明

作品图片、人物素材和字体均保留在仓库内。第三方素材与代码来源见 `dist/assets/CREDITS.txt` 及素材目录中的许可文件。仓库公开不代表作品和素材可自由转载或商用。
