<script lang="ts">
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	urlPath?: string;
}

interface SearchPost {
	title: string;
	description: string;
	content: string;
	link: string;
	searchTextLower: string;
	urlPathLower: string;
	linkLower: string;
}

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let posts: SearchPost[] = [];
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const SEARCH_DEBOUNCE_MS = 120;

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const escapeRegExp = (value: string): string =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text: string, keyword: string): string => {
	if (!keyword) return text;
	const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
	return text.replace(regex, "<mark>$1</mark>");
};

const runSearch = (keyword: string, isDesktop: boolean): void => {
	const normalizedKeyword = keyword.trim().toLowerCase();

	if (!normalizedKeyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	try {
		const searchResults = posts
			.filter((post) => {
				return (
					post.searchTextLower.includes(normalizedKeyword) ||
					post.urlPathLower.includes(normalizedKeyword) ||
					post.linkLower.includes(normalizedKeyword)
				);
			})
			.map((post) => {
				const contentLower = post.content.toLowerCase();
				const contentIndex = contentLower.indexOf(normalizedKeyword);

				let excerpt = "";
				if (contentIndex !== -1) {
					const start = Math.max(0, contentIndex - 50);
					const end = Math.min(post.content.length, contentIndex + 100);
					excerpt = post.content.substring(start, end);
					if (start > 0) excerpt = `...${excerpt}`;
					if (end < post.content.length) excerpt = `${excerpt}...`;
				} else {
					excerpt = post.description || `${post.content.substring(0, 150)}...`;
				}

				return {
					url: url(`/posts/${post.link}/`),
					meta: {
						title: post.title,
					},
					excerpt: highlightText(excerpt, keyword.trim()),
					urlPath: `/posts/${post.link}`,
				};
			})
			.slice(0, 30);

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	}
};

const scheduleSearch = (keyword: string, isDesktop: boolean): void => {
	if (searchTimer) {
		clearTimeout(searchTimer);
	}
	searchTimer = setTimeout(() => {
		runSearch(keyword, isDesktop);
	}, SEARCH_DEBOUNCE_MS);
};

const handleDesktopInput = (): void => {
	scheduleSearch(keywordDesktop, true);
};

const handleMobileInput = (): void => {
	scheduleSearch(keywordMobile, false);
};

onMount(() => {
	(async () => {
		try {
			const response = await fetch("/rss.xml");
			const text = await response.text();
			const parser = new DOMParser();
			const xml = parser.parseFromString(text, "text/xml");
			const items = xml.querySelectorAll("item");

			posts = Array.from(items).map((item) => {
				let content = "";
				const contentEncoded =
					item.getElementsByTagNameNS("*", "encoded")[0]?.textContent ||
					item.querySelector("*|encoded")?.textContent ||
					"";

				if (contentEncoded) {
					content = contentEncoded.replace(/<[^>]*>/g, "");
				}

				const title = item.querySelector("title")?.textContent || "";
				const description = item.querySelector("description")?.textContent || "";
				const link =
					item
						.querySelector("link")
						?.textContent?.replace(/.*\/posts\/(.*?)\//, "$1") || "";
				const urlPath = `/posts/${link}`;

				return {
					title,
					description,
					content,
					link,
					searchTextLower: `${title} ${description} ${content}`.toLowerCase(),
					urlPathLower: urlPath.toLowerCase(),
					linkLower: link.toLowerCase(),
				};
			});
		} catch (error) {
			console.error("Error fetching RSS:", error);
		}
	})();

	return () => {
		if (searchTimer) {
			clearTimeout(searchTimer);
		}
	};
});
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
    <input placeholder="Search" bind:value={keywordDesktop} on:input={handleDesktopInput} on:focus={handleDesktopInput}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
        <input placeholder="Search" bind:value={keywordMobile} on:input={handleMobileInput}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    <!-- search results -->
    {#each result as item}
        <a href={item.url}
           class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
            <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
            </div>
            <div class="transition text-xs text-white mb-1 font-mono">
                {item.urlPath}
            </div>
            <div class="transition text-sm text-50">
                {@html item.excerpt}
            </div>
        </a>
    {/each}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    background-color: var(--float-panel-bg-opaque);
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .search-panel::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
</style>
