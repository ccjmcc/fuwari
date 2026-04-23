export interface Sponsor {
	name: string;
	avatar: string | null;
	date: string;
	amount: string;
}

export interface Friend {
	name: string;
	avatar: string;
	description: string;
	url: string;
}

export interface SponsorsData {
	sponsors: Sponsor[];
}

export interface FriendsData {
	friends: Friend[];
}

export interface MemoryAsset {
	src: string;
	alt: string;
	basePath?: string;
}

export interface MemoryEntry {
	id: string;
	title: string;
	permalink: string;
	publishedLabel: string;
	monthDay: string;
	year: number;
	description: string;
	contentHtml?: string;
	pinned: boolean;
	tags: string[];
	meta: string[];
	source: "memos" | "posts";
	sourceLabel: string;
	linkLabel?: string;
	linkUrl?: string;
	image?: MemoryAsset;
}

export interface MemoryFeed {
	entries: MemoryEntry[];
	hasMemosSource: boolean;
}
