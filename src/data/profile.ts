/**
 * ─────────────────────────────────────────────────────────────
 *  PROFILE — single source of truth for who you are.
 *  Edit this one file; the hero, about, terminal, AI assistant,
 *  resume and contact sections all read from here.
 *
 *  ✍️  STILL TO FILL IN (set when you have them):
 *    - `githubUsername` — your real GitHub handle (hides the
 *      live stats band until it's set).
 *    - `email` / `socials.*` — your real contact links (empty
 *      entries are hidden from the UI).
 * ─────────────────────────────────────────────────────────────
 */
import type { Profile } from '@/types'
import meImg from '@/assets/image references/me.jpeg'
import campusImg from '@/assets/image references/manit campus image.jpg'

export const profile: Profile = {
  name: 'Himanshu Arya',
  firstName: 'Himanshu',
  roles: [
    'Aspiring ML Engineer',
    'ECE Student at MANIT',
    'LLM & AI Agent Builder',
    'Full Stack Developer',
  ],
  tagline: 'Building intelligent products that solve real problems.',
  intro: [
    "I'm an Electronics & Communication Engineering student at MANIT Bhopal who fell in love with Artificial Intelligence and Machine Learning, and never looked back. I love turning ideas into working products.",
    'My current focus is machine learning, large language models, AI agents, and full-stack development. I enjoy the whole arc: understanding an idea, designing the system, and shipping something that actually works.',
    "I believe the best way to learn is by building. So I build small experiments, end-to-end products, and automation. I'm preparing to bring that energy to my first ML / AI internship.",
  ],
  location: 'Bhopal, India · Open to remote',
  availability: 'Open to my first ML / AI internship',
  email: 'himanshuog324@gmail.com', // ✍️ add your real email
  githubUsername: 'aesthex6-dotcom', // ✍️ add your real GitHub handle
  photo: meImg, // Hero portrait

  socials: {
    github: 'https://github.com/aesthex6-dotcom', // ✍️ https://github.com/your-handle
    linkedin: '', // ✍️ https://www.linkedin.com/in/your-handle
    email: 'himanshuog324@gmail.com', // ✍️ mailto:you@example.com
    resume: '/resume',
  },

  education: {
    degree: 'B.Tech in Electronics & Communication Engineering',
    school: 'Maulana Azad National Institute of Technology (MANIT), Bhopal',
    period: '2025 – 2029',
    detail:
      'Second-year undergraduate. I focus on machine learning and AI alongside my core ECE coursework, learning the theory and immediately applying it by building.',
    photo: campusImg, // Campus photo
  },

  journey: [
    {
      year: '2025',
      title: 'Entered MANIT Bhopal',
      subtitle: 'The beginning',
      description: 'Started my B.Tech in Electronics & Communication Engineering.',
      tags: ['ECE'],
    },
    {
      year: 'The spark',
      title: 'Discovered AI & ML',
      subtitle: 'A whole new world',
      description:
        'Encountered machine learning and artificial intelligence for the first time and became genuinely fascinated. This was the direction I wanted to go.',
      tags: ['ML', 'AI'],
    },
    {
      year: '2026',
      title: 'Dived into LLMs, agents & full stack',
      subtitle: 'Building things',
      description:
        'Started building with large language models, AI agents, and full-stack tooling, turning ideas into working products and learning by doing.',
      tags: ['LLMs', 'Agents', 'Full Stack'],
    },
    {
      year: 'Now',
      title: 'Learning by building',
      subtitle: 'The mission',
      description:
        'Second year: sharpening ML fundamentals, shipping real projects, and preparing for my first ML / AI internship.',
      tags: ['ML', 'AI'],
    },
  ],

  goals: [
    'Become a Machine Learning / AI Engineer and build intelligent products that solve real-world problems.',
    'Land my first ML / AI internship.',
    'Keep learning by building.',
  ],

  // Honest numbers — update as real milestones happen.
  stats: [
    { label: 'Age', value: 18 },
    { label: 'Hackathons', value: 0 },
    { label: 'Internships', value: 0 },
    { label: 'Research papers', value: 0 },
  ],
}
