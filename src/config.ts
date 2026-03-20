import type {
	ExpressiveCodeConfig,
	GitHubEditConfig,
	ImageFallbackConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "ccjm Blog",
	subtitle: "技术分享与实践",
	description:
		"分享网络技术、Web 开发、服务器运维与日常折腾记录。",
	keywords: ["技术博客", "Web", "Astro", "服务器", "运维"],
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 250,
		fixed: false,
		forceDarkMode: false,
	},
	banner: {
		enable: false,
		src: "/xinghui.avif",
		position: "center",
		credit: {
			enable: true,
			text: "Pixiv @chokei",
			url: "https://www.pixiv.net/artworks/122782209",
		},
	},
	background: {
		enable: true,
		src: "https://t.alcy.cc/ycy",
		position: "center",
		size: "cover",
		repeat: "no-repeat",
		attachment: "fixed",
		opacity: 1,
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [
		{
			src: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0",
		},
	],
	officialSites: [
		{ url: "https://ccjm.dpdns.org/", alias: "Main" },
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "赞助",
			url: "/sponsors/",
			external: false,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "https://ccjmcc.github.io/img/about.jpg",
	name: "ccjm",
	bio: "Protect What You Love.",
	links: [],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const imageFallbackConfig: ImageFallbackConfig = {
	enable: false,
	originalDomain: "https://eopfapi.acofork.com/pic?img=ua",
	fallbackDomain: "https://eopfapi.acofork.com/pic?img=ua",
};

export const umamiConfig: UmamiConfig = {
	enable: false,
	baseUrl: "https://umami.acofork.com",
	shareId: "",
	websiteId: "",
	timezone: "Asia/Shanghai",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const gitHubEditConfig: GitHubEditConfig = {
	enable: true,
	baseUrl: "https://github.com/ccjmcc/fuwari/blob/main/src/content/posts",
};
