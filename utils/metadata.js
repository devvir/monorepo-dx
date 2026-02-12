/**
 * File Metadata Reading
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Read full README.md content
 * @param {string} dirPath - Directory path
 * @returns {string|null} README content or null
 */
export function readReadme(dirPath) {
  try {
    const readmePath = path.join(dirPath, 'README.md');

    if (! fs.existsSync(readmePath)) return null;

    return fs.readFileSync(readmePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * Read description from package.json
 * @param {string} dirPath - Directory path
 * @returns {string|null} Description or null
 */
export function readPackageDescription(dirPath) {
  try {
    const packagePath = path.join(dirPath, 'package.json');
    if (! fs.existsSync(packagePath)) return null;

    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    return pkg.description || null;
  } catch (error) {
    return null;
  }
}

/**
 * Read first paragraph from README.md
 * @param {string} dirPath - Directory path
 * @returns {string|null} First paragraph or null
 */
export function readReadmeDescription(dirPath) {
  try {
    const readmePath = path.join(dirPath, 'README.md');
    if (! fs.existsSync(readmePath)) return null;

    const content = fs.readFileSync(readmePath, 'utf-8');
    const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));

    return paragraphs[0]?.trim() || null;
  } catch (error) {
    return null;
  }
}

/**
 * Read description from README or package.json (tries README first)
 * @param {string} dirPath - Directory path
 * @returns {string|null} Description or null
 */
export function readDescription(dirPath) {
  return readReadmeDescription(dirPath) || readPackageDescription(dirPath);
}
