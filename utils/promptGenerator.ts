// Fix: Add .ts file extension for type import
import { UserProfile } from '../types.ts';

// A curated list of topics for a few client industries to make suggestions more concrete.
const TOPICS_BY_INDUSTRY: { [key: string]: string[] } = {
  'SaaS': ['a new feature launch', 'a competitor comparison', 'a customer case study', 'an onboarding email sequence'],
  'E-commerce': ['a holiday sales campaign', 'a product description for a luxury item', 'a social media ad creative', 'a brand story'],
  'Healthcare': ['a blog post on wellness tips', 'a patient education brochure', 'a website copy for a new clinic', 'a sensitive patient communication'],
  'Hospitality': ['a campaign for a new hotel opening', 'a menu description for a restaurant', 'a loyalty program announcement', 'a travel package advertisement'],
  'Finance': ['an explainer on a complex financial product', 'a market analysis report', 'a newsletter for investors', 'a security best practices guide'],
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generates highly relevant and intelligent prompt suggestions based on user data.
export const generateSmartPrompts = (user: UserProfile, toolId: string): string[] => {
  const { primaryClientIndustry, role } = user;
  
  const industryTopics = TOPICS_BY_INDUSTRY[primaryClientIndustry] || TOPICS_BY_INDUSTRY['E-commerce'];
  const topic = getRandomItem(industryTopics);

  let prompts: string[] = [];

  switch (toolId) {
    case 'market-insight-ai':
      prompts = [
        `Analyze the top 3 competitors for a ${primaryClientIndustry.toLowerCase()} client.`,
        `What are the current marketing trends in the ${primaryClientIndustry.toLowerCase()} industry?`,
        `Create a target audience persona for a luxury brand in ${primaryClientIndustry.toLowerCase()}.`
      ];
      break;
    case 'brand-essence-extractor':
      prompts = [
        `Help me define a mission statement for a client in the ${primaryClientIndustry.toLowerCase()} space.`,
        `Generate 3 core brand values for a new tech startup.`,
        `What is a unique selling proposition for a new e-commerce store?`
      ];
      break;
    case 'campaign-architect':
      prompts = [
        `Architect a campaign to increase website traffic by 20% for our ${primaryClientIndustry.toLowerCase()} client.`,
        `Develop a lead generation campaign with a goal of 500 new sign-ups.`,
        `Outline a brand awareness campaign measured by a 30% increase in social media engagement.`
      ];
      break;
    case 'copycraft-ai':
      prompts = [
        `Write 3 ad headlines for a social media campaign about "${topic}".`,
        `Draft a compelling 'About Us' page for a new company.`,
        `Write a short email to announce a new product.`
      ];
      break;
    case 'visual-muse':
      prompts = [
        `Give me 3 art direction concepts for a campaign about "${topic}".`,
        `Describe a logo concept for a modern FinTech company.`,
        `What color palette and typography would suit a wellness brand?`
      ];
      break;
    case 'pitch-perfect-ai':
      prompts = [
        `Create an outline for a new client pitch presentation.`,
        `Draft a proposal for a website redesign project.`,
        `Help me structure the 'Our Approach' section of a pitch deck.`
      ];
      break;
    case 'sentiment-analyzer':
        prompts = [
            `Analyze these customer reviews and identify key themes.`,
            `What is the overall sentiment of these social media comments?`,
            `Extract 3 positive and 3 negative quotes from this feedback.`
        ];
        break;
    case 'client-comms-assistant':
        prompts = [
            `Draft a friendly project kick-off email to a new client.`,
            `Write an email asking a client for feedback on a design.`,
            `How can I professionally address a scope creep issue via email?`
        ];
        break;
    case 'project-brief-builder':
        prompts = [
            `Create a project brief for a new logo design project.`,
            `Help me outline the deliverables for a content marketing retainer.`,
            `Generate a brief for a 4-week social media campaign.`
        ];
        break;
    case 'creative-director-ai':
        prompts = [
            `Give me feedback on this headline: "Unlock Your Potential".`,
            `Critique this ad concept: A cat using a new software product.`,
            `What are the strengths and weaknesses of this color palette?`
        ];
        break;
    case 'client-persona-automator':
      prompts = [
        `Generate personas for a client that sells sustainable dog toys online.`,
        `Create user personas for a new B2B SaaS that helps with project management.`,
        `My client is a luxury hotel in Aspen. What are their key customer segments?`
      ];
      break;
    case 'seo-content-strategist':
      prompts = [
        `Create a content brief for the keyword "small business accounting tips".`,
        `My client is a law firm. Give me an outline for a blog post about "what to do after a car accident".`,
        `Analyze the keyword "best vegan protein powder" and provide a brief.`
      ];
      break;
    case 'budget-projection-ai':
      prompts = [
        `Project a 3-month marketing budget for a new e-commerce fashion brand.`,
        `I have a $50,000 budget for a B2B product launch. How should I allocate it?`,
        `What's a realistic budget to get 1,000 leads for a real estate agency?`
      ];
      break;
    case 'ab-test-copy-generator':
      prompts = [
        `Generate A/B test copy for a new productivity app.`,
        `Write 3 variations of an ad for a meal delivery service.`,
        `Create testable ad copy for a limited-time 50% off sale.`
      ];
      break;
    case 'social-calendar-automator':
      prompts = [
        `Create a one-week content calendar for a local coffee shop on Instagram.`,
        `Generate a LinkedIn content plan for a financial advisory firm.`,
        `Give me a week of social media ideas for a new video game launch.`
      ];
      break;
    case 'presentation-weaver-ai':
      prompts = [
        `Turn these Q1 performance metrics into a client-facing presentation.`,
        `Create a presentation outline for a new branding proposal.`,
        `Structure a project kickoff presentation from this brief.`
      ];
      break;
    default:
      prompts = [`How can I use this tool for a client in the ${primaryClientIndustry.toLowerCase()} industry?`];
  }

  // Shuffle and return the top 3 prompts
  return prompts.sort(() => 0.5 - Math.random()).slice(0, 3);
};