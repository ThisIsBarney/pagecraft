import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { PageContent } from "@/lib/notion";

// 示例数据，用于演示
const sampleContent: PageContent = {
  title: "Marshall WU - Full Stack Developer",
  markdown: `# Marshall WU

## Full Stack Developer & Indie Maker

Hi! I'm Marshall, a passionate developer building useful tools for the web.

### What I Do

- **Web Development** - React, Next.js, Node.js
- **Product Design** - From idea to MVP
- **Open Source** - Contributing to the community

### Projects

**PageCraft** - Turn Notion pages into beautiful websites
- Built with Next.js and Notion API
- Helping creators build their online presence

**AI Tools** - Various AI-powered utilities
- Exploring the future of human-computer interaction

### Get in Touch

- GitHub: [github.com/marshall](https://github.com)
- Twitter: [@marshall](https://twitter.com)
- Email: hello@marshall.wu

---

*Built with ❤️ and lots of coffee*
`,
  blocks: [],
};

export default function ExamplePage() {
  return <MinimalTemplate content={sampleContent} author="Marshall WU" />;
}
