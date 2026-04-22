/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly MEMOS_ACCESS_TOKEN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
