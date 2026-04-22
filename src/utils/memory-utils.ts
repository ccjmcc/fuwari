import path from "node:path";
import type { CollectionEntry } from "astro:content";
import MarkdownIt from "markdown-it";
import { parse as parseHtml } from "node-html-parser";
import sanitizeHtml from "sanitize-html";
import { memosConfig } from "../config";
import type { MemoryAsset, MemoryEntry } from "../types/data";
import { getDir, getPostUrlBySlug, url } from "./url-utils";

type MemoAttachment = {
	filename?: string;
	externalLink?: string;
	content?: string;
	type?: string;
};

type MemoRecord = {
	name?: string;
	createTime?: string;
	updateTime?: string;
	displayTime?: string;
	content?: string;
	snippet?: string;
	visibility?: string;
	tags?: string[];
	pinned?: boolean;
	attachments?: MemoAttachment[];
};

type ListMemosResponse = {
	memos?: MemoRecord[];
	nextPageToken?: string;
};

const markdownParser = new MarkdownIt({
	breaks: true,
	linkify: true,
});

function normalizeText(input: string) {
	return input.replace(/\s+/g, " ").trim();
}

function normalizeBaseUrl(baseUrl: string) {
	return baseUrl.replace(/\/+$/g, "");
}

function formatDate(date: Date) {
	return date.toISOString().substring(0, 10);
}

function formatMonthDay(date: Date) {
	return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
		.getDate()
		.toString()
		.padStart(2, "0")}`;
}

function sanitizeMemoHtml(content: string) {
	return sanitizeHtml(markdownParser.render(content), {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			a: ["href", "name", "target", "rel"],
			img: ["src", "alt", "title", "loading"],
		},
		transformTags: {
			a: sanitizeHtml.simpleTransform("a", {
				target: "_blank",
				rel: "noopener noreferrer",
			}),
		},
	});
}

function htmlToPlainText(html: string) {
	return normalizeText(parseHtml(html).text);
}

function deriveMemoTitle(text: string, fallbackDate: string) {
	if (text.length === 0) {
		return `Memo ${fallbackDate}`;
	}

	return text.length > 64 ? `${text.slice(0, 64).trim()}...` : text;
}

function deriveMemoDescription(text: string) {
	if (text.length === 0) {
		return "A short memo captured from Memos.";
	}

	return text.length > 160 ? `${text.slice(0, 160).trim()}...` : text;
}

function resolveAttachmentSrc(attachment: MemoAttachment) {
	const candidate = attachment.externalLink || attachment.content || "";
	if (
		candidate.startsWith("http://") ||
		candidate.startsWith("https://") ||
		candidate.startsWith("data:") ||
		candidate.startsWith("/")
	) {
		return candidate;
	}

	return "";
}

function isImageAttachment(attachment: MemoAttachment) {
	if (attachment.type?.startsWith("image/")) {
		return true;
	}

	const filename = attachment.filename?.toLowerCase() || "";
	return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].some((ext) =>
		filename.endsWith(ext),
	);
}

function getMemoImage(
	attachments: MemoAttachment[] | undefined,
	title: string,
): MemoryAsset | undefined {
	if (!attachments || attachments.length === 0) {
		return undefined;
	}

	for (const attachment of attachments) {
		if (!isImageAttachment(attachment)) {
			continue;
		}

		const src = resolveAttachmentSrc(attachment);
		if (!src) {
			continue;
		}

		return {
			src,
			alt: attachment.filename || `Attachment for ${title}`,
		};
	}

	return undefined;
}

function sortEntries(entries: MemoryEntry[]) {
	return [...entries].sort((left, right) => {
		if (left.pinned !== right.pinned) {
			return left.pinned ? -1 : 1;
		}

		return right.publishedLabel.localeCompare(left.publishedLabel);
	});
}

function toMemoryPermalink(id: string) {
	return `${url("/memory/")}#${id}`;
}

async function fetchMemoPage(pageToken?: string) {
	const baseUrl = normalizeBaseUrl(memosConfig.baseUrl);
	if (!baseUrl) {
		return { memos: [], nextPageToken: "" };
	}

	const endpoint = new URL(`${baseUrl}/api/v1/memos`);
	endpoint.searchParams.set("pageSize", String(memosConfig.pageSize));
	endpoint.searchParams.set("state", "NORMAL");
	endpoint.searchParams.set("orderBy", "pinned desc, display_time desc");
	endpoint.searchParams.set("filter", 'visibility == "PUBLIC"');
	if (pageToken) {
		endpoint.searchParams.set("pageToken", pageToken);
	}

	const headers: HeadersInit = {};
	if (import.meta.env.MEMOS_ACCESS_TOKEN) {
		headers.Authorization = `Bearer ${import.meta.env.MEMOS_ACCESS_TOKEN}`;
	}

	const response = await fetch(endpoint, { headers });
	if (!response.ok) {
		throw new Error(`Failed to fetch memos: ${response.status}`);
	}

	const payload = (await response.json()) as ListMemosResponse;
	return {
		memos: payload.memos || [],
		nextPageToken: payload.nextPageToken || "",
	};
}

export async function fetchMemosAsMemoryEntries(): Promise<MemoryEntry[]> {
	if (!memosConfig.enable || !memosConfig.baseUrl.trim()) {
		return [];
	}

	try {
		let pageToken = "";
		let remaining = Math.min(Math.max(memosConfig.pageSize, 1), 1000);
		const memoRecords: MemoRecord[] = [];

		while (remaining > 0) {
			const { memos, nextPageToken } = await fetchMemoPage(pageToken || undefined);
			memoRecords.push(...memos.slice(0, remaining));
			remaining -= memos.length;

			if (!nextPageToken || memos.length === 0) {
				break;
			}

			pageToken = nextPageToken;
		}

		return sortEntries(
			memoRecords.map((memo, index) => {
				const publishedAt = new Date(
					memo.displayTime || memo.createTime || memo.updateTime || Date.now(),
				);
				const publishedLabel = formatDate(publishedAt);
				const contentHtml = sanitizeMemoHtml(memo.content || "");
				const plainText = htmlToPlainText(contentHtml || "");
				const title = deriveMemoTitle(plainText, publishedLabel);
				const idPart = memo.name?.split("/").pop() || `memo-${index + 1}`;
				const id = `memo-${idPart}`;
				const image = getMemoImage(memo.attachments, title);
				const mediaCount = memo.attachments?.filter((attachment) =>
					Boolean(resolveAttachmentSrc(attachment)),
				).length;
				const meta = [];

				if (typeof mediaCount === "number" && mediaCount > 0) {
					meta.push(`${mediaCount} media`);
				}

				if ((memo.tags?.length || 0) > 0) {
					meta.push(`${memo.tags?.length || 0} tags`);
				}

				return {
					id,
					title,
					permalink: toMemoryPermalink(id),
					publishedLabel,
					monthDay: formatMonthDay(publishedAt),
					year: publishedAt.getFullYear(),
					description: deriveMemoDescription(
						normalizeText(memo.snippet || plainText),
					),
					contentHtml,
					pinned: memo.pinned === true,
					tags: memo.tags || [],
					meta,
					source: "memos",
					sourceLabel: "Memos",
					image,
				} satisfies MemoryEntry;
			}),
		);
	} catch (error) {
		console.error("Failed to load Memos for /memory/:", error);
		return [];
	}
}

export async function mapPostsToMemoryEntries(
	entries: CollectionEntry<"posts">[],
): Promise<MemoryEntry[]> {
	const mappedEntries = await Promise.all(
		entries.map(async (entry) => {
			const { remarkPluginFrontmatter } = await entry.render();
			const excerpt =
				entry.data.description.trim() ||
				remarkPluginFrontmatter?.excerpt?.trim() ||
				"Read the full post for the complete write-up.";
			const publishedAt = entry.data.published;
			const meta = [];

			if (typeof remarkPluginFrontmatter?.words === "number") {
				meta.push(`${remarkPluginFrontmatter.words} words`);
			}

			if (typeof remarkPluginFrontmatter?.minutes === "number") {
				meta.push(`${remarkPluginFrontmatter.minutes} min`);
			}

			return {
				id: `post-${entry.slug}`,
				title: entry.data.title,
				permalink: getPostUrlBySlug(entry.slug),
				publishedLabel: formatDate(publishedAt),
				monthDay: formatMonthDay(publishedAt),
				year: publishedAt.getFullYear(),
				description: normalizeText(excerpt),
				pinned: entry.data.pinned === true,
				tags: entry.data.tags ?? [],
				meta,
				source: "posts",
				sourceLabel: "Post",
				linkLabel: "Read post",
				linkUrl: getPostUrlBySlug(entry.slug),
				image: entry.data.image
					? {
							src: entry.data.image,
							alt: `Cover image of ${entry.data.title}`,
							basePath: path.join("content/posts/", getDir(entry.id)),
						}
					: undefined,
			} satisfies MemoryEntry;
		}),
	);

	return sortEntries(mappedEntries);
}
