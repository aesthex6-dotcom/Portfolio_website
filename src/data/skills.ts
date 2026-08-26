/**
 * ─────────────────────────────────────────────────────────────
 *  SKILLS — grouped into categories. Rendered as an interactive
 *  constellation in `SkillConstellation.tsx`.
 *
 *  These are honest "what I'm currently learning and building
 *  with" areas, not expert claims. `icon` is a key into the icon
 *  map in SkillConstellation. `level` (0–100) controls node radius
 *  + glow emphasis — update it as you grow.
 * ─────────────────────────────────────────────────────────────
 */
import type { SkillCategory } from '@/types'

export const skills: SkillCategory[] = [
  {
    name: 'Machine Learning & AI',
    icon: 'brain',
    blurb: 'Learning the fundamentals of ML and AI, from data to evaluation.',
    skills: [
      { name: 'Python', level: 70, blurb: 'Main language for ML and automation' },
      { name: 'pandas / numpy', level: 64, blurb: 'Data wrangling and analysis' },
      { name: 'scikit-learn', level: 58, blurb: 'Classical ML modeling and pipelines' },
      { name: 'Model Evaluation', level: 56, blurb: 'Metrics, validation, error analysis' },
    ],
  },
  {
    name: 'Deep Learning',
    icon: 'cpu',
    blurb: 'Training and debugging neural networks with modern frameworks.',
    skills: [
      { name: 'PyTorch', level: 62, blurb: 'Custom modules and training loops' },
      { name: 'Neural Networks', level: 60, blurb: 'Architectures and intuition' },
      { name: 'Transformers', level: 58, blurb: 'Attention models, HF ecosystem' },
    ],
  },
  {
    name: 'LLMs',
    icon: 'sparkles',
    blurb: 'Building applications on top of large language models.',
    skills: [
      { name: 'Prompt Engineering', level: 70, blurb: 'Prompting patterns that work' },
      { name: 'RAG', level: 62, blurb: 'Retrieval-augmented generation' },
      { name: 'LLM APIs', level: 66, blurb: 'Integration, streaming, tool use' },
    ],
  },
  {
    name: 'AI Agents & Automation',
    icon: 'bot',
    blurb: 'Exploring autonomous agents and systems that act on your behalf.',
    skills: [
      { name: 'AI Agents', level: 56, blurb: 'Planning, tool use, loops' },
      { name: 'MCP & Tool Use', level: 50, blurb: 'Letting models call tools' },
      { name: 'Automation', level: 55, blurb: 'Scripting repetitive work away' },
    ],
  },
  {
    name: 'Full Stack Development',
    icon: 'code',
    blurb: 'Building the front-to-back of my own products.',
    skills: [
      { name: 'TypeScript', level: 62, blurb: 'Typed, maintainable code' },
      { name: 'React', level: 60, blurb: 'Interactive UIs' },
      { name: 'Node.js / APIs', level: 55, blurb: 'Backends and integrations' },
    ],
  },
]
