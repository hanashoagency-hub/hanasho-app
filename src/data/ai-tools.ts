export type ToolCategory =
  | "Artificial Intelligence"
  | "Productivity"
  | "Writing"
  | "Image Generation"
  | "Video Generation"
  | "Coding AI"
  | "Marketing AI"
  | "SEO Tools";

export interface Tool {
  name: string;
  description: string;
  url: string;
  category: ToolCategory;
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

export const categories: ToolCategory[] = [
  "Artificial Intelligence",
  "Productivity",
  "Writing",
  "Image Generation",
  "Video Generation",
  "Coding AI",
  "Marketing AI",
  "SEO Tools",
];

export const tools: Tool[] = [
  // Artificial Intelligence
  { name: "ChatGPT", description: "OpenAI's flagship conversational AI for research, writing, coding, and everyday tasks.", url: "https://chat.openai.com", category: "Artificial Intelligence", tags: ["chatbot", "assistant", "openai"], isTrending: true },
  { name: "Claude", description: "Anthropic's AI assistant, strong at long-context reasoning, writing, and agentic coding.", url: "https://claude.ai", category: "Artificial Intelligence", tags: ["chatbot", "assistant", "anthropic"], isTrending: true },
  { name: "Gemini", description: "Google's multimodal AI assistant integrated with Search, Workspace, and Android.", url: "https://gemini.google.com", category: "Artificial Intelligence", tags: ["chatbot", "assistant", "google"] },
  { name: "Perplexity", description: "AI-powered answer engine that cites live sources for every response.", url: "https://www.perplexity.ai", category: "Artificial Intelligence", tags: ["search", "research", "assistant"] },
  { name: "Hugging Face", description: "The open hub for AI models, datasets, and demos — the GitHub of machine learning.", url: "https://huggingface.co", category: "Artificial Intelligence", tags: ["models", "open-source", "ml"] },

  // Productivity
  { name: "Notion", description: "All-in-one workspace for notes, docs, projects, and AI-assisted writing.", url: "https://www.notion.so", category: "Productivity", tags: ["notes", "docs", "workspace"], isTrending: true },
  { name: "Notion AI", description: "Built-in AI inside Notion for summarizing, drafting, and organizing your workspace.", url: "https://www.notion.so/product/ai", category: "Productivity", tags: ["ai", "notes", "automation"] },
  { name: "Zapier", description: "No-code automation that connects thousands of apps so your tools work together.", url: "https://zapier.com", category: "Productivity", tags: ["automation", "no-code", "integrations"] },
  { name: "Motion", description: "AI calendar and task planner that automatically schedules your day around deadlines.", url: "https://www.usemotion.com", category: "Productivity", tags: ["calendar", "planning", "ai"], isNew: true },
  { name: "Superhuman", description: "The fastest email experience, built for people who live in their inbox.", url: "https://superhuman.com", category: "Productivity", tags: ["email", "speed"] },

  // Writing
  { name: "Jasper", description: "AI writing platform for marketing teams — blog posts, ads, and brand-consistent copy.", url: "https://www.jasper.ai", category: "Writing", tags: ["copywriting", "marketing", "content"] },
  { name: "Grammarly", description: "AI writing assistant that checks grammar, tone, and clarity across every app you use.", url: "https://www.grammarly.com", category: "Writing", tags: ["grammar", "editing", "assistant"], isTrending: true },
  { name: "Copy.ai", description: "Generate marketing copy, emails, and social captions in seconds with AI templates.", url: "https://www.copy.ai", category: "Writing", tags: ["copywriting", "templates", "marketing"] },
  { name: "QuillBot", description: "AI paraphrasing, summarizing, and grammar tool for students and writers.", url: "https://quillbot.com", category: "Writing", tags: ["paraphrase", "summarize", "students"] },
  { name: "Hemingway Editor", description: "Highlights complex sentences and passive voice to make your writing bold and clear.", url: "https://hemingwayapp.com", category: "Writing", tags: ["editing", "clarity", "readability"] },

  // Image Generation
  { name: "Midjourney", description: "Industry-leading AI image generator known for painterly, high-fidelity artwork.", url: "https://www.midjourney.com", category: "Image Generation", tags: ["art", "images", "design"], isTrending: true },
  { name: "DALL·E 3", description: "OpenAI's image generator, tightly integrated with ChatGPT for prompt refinement.", url: "https://openai.com/dall-e-3", category: "Image Generation", tags: ["art", "images", "openai"] },
  { name: "Adobe Firefly", description: "Adobe's generative AI for images, built to be commercially safe and Creative Cloud native.", url: "https://firefly.adobe.com", category: "Image Generation", tags: ["design", "adobe", "commercial"] },
  { name: "Leonardo AI", description: "Fine-tunable AI image generator popular for game assets and product concepts.", url: "https://leonardo.ai", category: "Image Generation", tags: ["art", "game-assets", "design"], isNew: true },
  { name: "Canva Magic Studio", description: "AI-powered design suite inside Canva — image generation, background removal, and more.", url: "https://www.canva.com/magic-studio", category: "Image Generation", tags: ["design", "templates", "canva"] },

  // Video Generation
  { name: "Runway", description: "AI video generation and editing suite used by filmmakers and creators worldwide.", url: "https://runwayml.com", category: "Video Generation", tags: ["video", "editing", "generative"], isTrending: true },
  { name: "Sora", description: "OpenAI's text-to-video model that creates realistic and imaginative video scenes.", url: "https://openai.com/sora", category: "Video Generation", tags: ["video", "text-to-video", "openai"], isNew: true },
  { name: "Synthesia", description: "Create AI avatar videos from text — no camera, actors, or studio required.", url: "https://www.synthesia.io", category: "Video Generation", tags: ["avatars", "training-videos", "text-to-video"] },
  { name: "CapCut", description: "Free, powerful video editor with AI tools for captions, effects, and short-form content.", url: "https://www.capcut.com", category: "Video Generation", tags: ["editing", "short-form", "free"] },
  { name: "Pika", description: "Fast, accessible AI video generator popular for creative short clips and animations.", url: "https://pika.art", category: "Video Generation", tags: ["video", "animation", "generative"] },

  // Coding AI
  { name: "GitHub Copilot", description: "AI pair programmer that autocompletes code and whole functions inside your editor.", url: "https://github.com/features/copilot", category: "Coding AI", tags: ["coding", "autocomplete", "github"], isTrending: true },
  { name: "Cursor", description: "AI-first code editor built for fast, agentic coding across an entire codebase.", url: "https://www.cursor.com", category: "Coding AI", tags: ["editor", "coding", "agentic"], isTrending: true },
  { name: "Claude Code", description: "Agentic coding tool in your terminal — plans, edits, and tests across your whole project.", url: "https://claude.com/claude-code", category: "Coding AI", tags: ["coding", "cli", "agentic"], isNew: true },
  { name: "Replit", description: "Browser-based coding environment with AI agents that build and deploy full apps.", url: "https://replit.com", category: "Coding AI", tags: ["ide", "deployment", "agents"] },
  { name: "v0", description: "Vercel's AI tool that generates production-ready React UI from a text prompt.", url: "https://v0.dev", category: "Coding AI", tags: ["ui", "react", "vercel"], isNew: true },

  // Marketing AI
  { name: "HubSpot AI", description: "AI-powered CRM tools for content generation, lead scoring, and campaign automation.", url: "https://www.hubspot.com/artificial-intelligence", category: "Marketing AI", tags: ["crm", "automation", "campaigns"] },
  { name: "AdCreative.ai", description: "Generates high-converting ad creatives and banners in seconds using AI.", url: "https://www.adcreative.ai", category: "Marketing AI", tags: ["ads", "creative", "conversion"] },
  { name: "Meta AI Ads Advantage+", description: "Meta's AI-driven ad automation that optimizes targeting, creative, and budget.", url: "https://www.facebook.com/business/ads/advantage-campaign-budget", category: "Marketing AI", tags: ["ads", "facebook", "automation"] },
  { name: "Ocoya", description: "AI social media management — captions, scheduling, and analytics in one dashboard.", url: "https://www.ocoya.com", category: "Marketing AI", tags: ["social-media", "scheduling", "captions"] },
  { name: "Brandwatch", description: "AI-powered social listening and consumer intelligence for marketing teams.", url: "https://www.brandwatch.com", category: "Marketing AI", tags: ["listening", "analytics", "insights"] },

  // SEO Tools
  { name: "Ahrefs", description: "Comprehensive SEO toolset for backlink analysis, keyword research, and site audits.", url: "https://ahrefs.com", category: "SEO Tools", tags: ["backlinks", "keywords", "audit"], isTrending: true },
  { name: "SEMrush", description: "All-in-one SEO and competitive research platform trusted by marketing teams globally.", url: "https://www.semrush.com", category: "SEO Tools", tags: ["keywords", "competitors", "audit"] },
  { name: "Surfer SEO", description: "AI content editor that scores and optimizes pages against top-ranking competitors.", url: "https://surferseo.com", category: "SEO Tools", tags: ["content", "optimization", "ranking"] },
  { name: "Google Search Console", description: "Free tool from Google to monitor, maintain, and troubleshoot your site's search presence.", url: "https://search.google.com/search-console", category: "SEO Tools", tags: ["free", "google", "monitoring"] },
  { name: "Ubersuggest", description: "Beginner-friendly keyword research and SEO tracking tool by Neil Patel.", url: "https://neilpatel.com/ubersuggest", category: "SEO Tools", tags: ["keywords", "beginner", "tracking"] },
];

export interface ExternalListing {
  name: string;
  description: string;
  url: string;
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

export const cryptoExchanges: ExternalListing[] = [
  { name: "Binance", description: "The world's largest crypto exchange by trading volume, with deep liquidity across hundreds of markets.", url: "https://www.binance.com", tags: ["spot", "futures", "global"], isTrending: true },
  { name: "Coinbase", description: "The most trusted regulated exchange in the US, known for its simple, beginner-friendly app.", url: "https://www.coinbase.com", tags: ["regulated", "beginner-friendly", "us"] },
  { name: "OKX", description: "Full-featured exchange with strong derivatives products and a built-in Web3 wallet.", url: "https://www.okx.com", tags: ["derivatives", "web3", "wallet"] },
  { name: "Bybit", description: "Popular derivatives-focused exchange with a clean interface and copy-trading features.", url: "https://www.bybit.com", tags: ["derivatives", "copy-trading"] },
  { name: "KuCoin", description: "Wide selection of altcoins and early-stage token listings, popular with active traders.", url: "https://www.kucoin.com", tags: ["altcoins", "trading"] },
];

export const hostingProviders: ExternalListing[] = [
  { name: "Vercel", description: "The best-in-class platform for deploying Next.js and modern frontend apps with zero config.", url: "https://vercel.com", tags: ["frontend", "nextjs", "serverless"], isTrending: true },
  { name: "DigitalOcean", description: "Developer-friendly cloud hosting with simple pricing — great for full apps and databases.", url: "https://www.digitalocean.com", tags: ["vps", "cloud", "databases"] },
  { name: "Hostinger", description: "Budget-friendly shared and VPS hosting, popular for WordPress sites and small businesses.", url: "https://www.hostinger.com", tags: ["shared", "wordpress", "budget"] },
  { name: "Cloudflare Pages", description: "Free, globally distributed static site hosting backed by Cloudflare's edge network.", url: "https://pages.cloudflare.com", tags: ["free", "edge", "static-sites"] },
  { name: "AWS", description: "The most complete cloud platform for scaling serious infrastructure and enterprise apps.", url: "https://aws.amazon.com", tags: ["enterprise", "cloud", "scalable"] },
];
