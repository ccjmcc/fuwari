#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 清理未使用的图片资源脚本
 * 扫描 src/content/posts 下的所有 markdown 文件，
 * 查找 src/content/assets 中未被引用的图片并删除
 */

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
const ASSETS_DIR = path.join(CONTENT_DIR, 'assets');

// 支持的图片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];

/**
 * 获取所有 markdown 文件
 */
async function getAllMarkdownFiles() {
  try {
    const pattern = path.join(POSTS_DIR, '**/*.md').replace(/\\/g, '/');
    return await glob(pattern);
  } catch (error) {
    console.error('获取 markdown 文件失败:', error.message);
    return [];
  }
}

/**
 * 获取所有图片文件
 */
async function getAllImageFiles() {
  try {
    const extensions = IMAGE_EXTENSIONS.join(',');
    const pattern = path.join(ASSETS_DIR, `**/*{${extensions}}`).replace(/\\/g, '/');
    return await glob(pattern);
  } catch (error) {
    console.error('获取图片文件失败:', error.message);
    return [];
  }
}

/**
 * 从 markdown 内容中提取图片引用
 */
function extractImageReferences(content) {
  const references = new Set();
  
  // 匹配 YAML frontmatter 中的 image 字段（支持带引号和不带引号的值）
  const yamlImageRegex = /^---[\s\S]*?image:\s*(?:['"]([^'"]+)['"]|([^\s\n]+))[\s\S]*?^---/m;
  let match = yamlImageRegex.exec(content);
  if (match) {
    // match[1] 是带引号的值，match[2] 是不带引号的值
    references.add(match[1] || match[2]);
  }
  
  // 匹配 markdown 图片语法: ![alt](path)
  const markdownImageRegex = /!\[.*?\]\(([^)]+)\)/g;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    references.add(match[1]);
  }
  
  // 匹配 HTML img 标签: <img src="path">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    references.add(match[1]);
  }
  
  // 匹配 Astro Image 组件引用
  const astroImageRegex = /import\s+.*?\s+from\s+["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|avif))["']/gi;
  while ((match = astroImageRegex.exec(content)) !== null) {
    references.add(match[1]);
  }
  
  return Array.from(references);
}

/**
 * 规范化路径，处理相对路径和绝对路径
 */
function normalizePath(imagePath, markdownFilePath) {
  // 跳过外部 URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return null;
  }
  
  // 跳过以 / 开头的绝对路径（通常指向 public 目录）
  if (imagePath.startsWith('/')) {
    return null;
  }
  
  // 处理相对路径
  if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
    const markdownDir = path.dirname(markdownFilePath);
    return path.resolve(markdownDir, imagePath);
  }
  
  // 处理直接的文件名或相对路径
  const markdownDir = path.dirname(markdownFilePath);
  return path.resolve(markdownDir, imagePath);
}

/**
 * 主函数
 */
async function cleanUnusedImages() {
  console.log('🔍 开始扫描未使用的图片资源...');
  
  // 检查目录是否存在
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`❌ Posts 目录不存在: ${POSTS_DIR}`);
    return;
  }
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(`ℹ️  Assets 目录不存在: ${ASSETS_DIR}`);
    return;
  }
  
  // 获取所有文件
  const markdownFiles = await getAllMarkdownFiles();
  const imageFiles = await getAllImageFiles();
  
  console.log(`📄 找到 ${markdownFiles.length} 个 markdown 文件`);
  console.log(`🖼️  找到 ${imageFiles.length} 个图片文件`);
  
  if (imageFiles.length === 0) {
    console.log('✅ 没有找到图片文件，无需清理');
    return;
  }
  
  // 收集所有被引用的图片
  const referencedImages = new Set();
  
  for (const mdFile of markdownFiles) {
    try {
      const content = fs.readFileSync(mdFile, 'utf-8');
      const references = extractImageReferences(content);
      
      for (const ref of references) {
        const normalizedPath = normalizePath(ref, mdFile);
        if (normalizedPath) {
          const resolvedPath = path.resolve(normalizedPath);
          referencedImages.add(resolvedPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  读取文件失败: ${mdFile} - ${error.message}`);
    }
  }
  
  console.log(`🔗 找到 ${referencedImages.size} 个被引用的图片`);
  
  // 找出未被引用的图片
  const unusedImages = [];
  
  for (const imageFile of imageFiles) {
    const resolvedImagePath = path.resolve(imageFile);
    const isReferenced = referencedImages.has(resolvedImagePath);
    
    if (!isReferenced) {
      unusedImages.push(imageFile);
    }
  }
  
  console.log(`🗑️  找到 ${unusedImages.length} 个未使用的图片`);
  
  if (unusedImages.length === 0) {
    console.log('✅ 所有图片都在使用中，无需清理');
    return;
  }
  
  // 删除未使用的图片
  let deletedCount = 0;
  
  for (const unusedImage of unusedImages) {
    try {
      fs.unlinkSync(unusedImage);
      console.log(`🗑️  已删除: ${path.relative(process.cwd(), unusedImage)}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ 删除失败: ${unusedImage} - ${error.message}`);
    }
  }
  
  // 清理空目录
  try {
    cleanEmptyDirectories(ASSETS_DIR);
  } catch (error) {
    console.warn(`⚠️  清理空目录时出错: ${error.message}`);
  }
  
  console.log(`\n✅ 清理完成！删除了 ${deletedCount} 个未使用的图片文件`);
}

/**
 * 递归清理空目录
 */
function cleanEmptyDirectories(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  if (files.length === 0) {
    fs.rmdirSync(dir);
    console.log(`🗑️  已删除空目录: ${path.relative(process.cwd(), dir)}`);
    return;
  }
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      cleanEmptyDirectories(filePath);
    }
  }
  
  // 再次检查目录是否为空
  const remainingFiles = fs.readdirSync(dir);
  if (remainingFiles.length === 0) {
    fs.rmdirSync(dir);
    console.log(`🗑️  已删除空目录: ${path.relative(process.cwd(), dir)}`);
  }
}

// 运行脚本
// 检查是否直接运行此脚本
const scriptPath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(scriptPath);

if (isMainModule) {
  cleanUnusedImages().catch(error => {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

export { cleanUnusedImages };