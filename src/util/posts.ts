import fs from 'fs';
import path from 'path';
export default class Posts {
  // Path to entries folder
  entriesPath;
  folders;
  posts;

  constructor() {
    this.entriesPath = path.join(process.cwd(), 'public', 'entries');

    // Get all folder names (each folder = one post)
    this.folders = fs.readdirSync(this.entriesPath, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Optionally, read frontmatter from each main.md
    this.posts = this.folders.map(slug => {
      const mdPath = path.join(this.entriesPath, slug, 'main.md');
      let title = slug;
      try {
        const raw = fs.readFileSync(mdPath, 'utf8');
        const matter = require('gray-matter');
        const data = matter(raw).data;
        if (data.title) title = data.title;
      } catch (e) {
        console.warn(`Failed to read ${slug}/main.md`, e);
      }
      return {slug, title};
    });
  }
}