/**
 * ─────────────────────────────────────────────────────────────
 *  CURRENT MISSION — honest, in-progress focus areas.
 *  Rendered as animated cards + a closing quote on the home page.
 *  Edit `items` and `quote` here and the whole section updates.
 *
 *  `status` is one of:
 *    'active'   → 🟢 Active    — actively pursuing right now
 *    'learning' → 🟡 Learning  — actively learning / exploring
 *    'building' → 🚧 Building  — building real things with it
 * ─────────────────────────────────────────────────────────────
 */
import type { MissionItem } from '@/types'

export const mission = {
  items: [
    {
      title: 'Building AI-powered products',
      status: 'building',
      detail: 'Turning ideas into working products, end to end, from concept to shipped code.',
    },
    {
      title: 'Learning Machine Learning & Deep Learning',
      status: 'learning',
      detail: 'Strengthening the fundamentals: from the math to modern deep learning architectures.',
    },
    {
      title: 'Exploring LLMs, AI Agents & RAG systems',
      status: 'learning',
      detail: 'Building with large language models, autonomous agents, and retrieval-augmented generation.',
    },
    {
      title: 'Improving Full Stack Development skills',
      status: 'learning',
      detail: 'Sharpening React, TypeScript, and backend craft to ship polished, end-to-end experiences.',
    },
    {
      title: 'Preparing for ML / AI internships',
      status: 'active',
      detail: 'Building a real portfolio of projects, and actively seeking my first ML / AI internship.',
    },
    {
      title: 'Solving real-world problems through AI',
      status: 'building',
      detail: 'Applying ML and AI where they genuinely help, one real problem at a time.',
    },
  ] satisfies MissionItem[],

  quote: {
    text: "I'm not trying to impress with fake experience.",
    emphasis: "I'm building real skills, one project at a time.",
  },
}
