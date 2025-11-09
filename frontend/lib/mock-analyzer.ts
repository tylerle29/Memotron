export interface AnalysisResult {
  template: string
  caption: string
  meaning: string
  humor: string
  context: string
  confidence: number
  origin: string
  category: string
  topText: string
  bottomText: string
  relatable: number
  humorous: number
  sarcastic: number
  detectedPersons: Person[] // Added detected persons array
}

export interface Person {
  id: string
  name: string
  confidence: number
  thumbnail: string
  memeAppearances: string[]
  relatedMemes: { title: string; link: string }[]
  timeline: { year: number; event: string }[]
}

const memeTemplates = [
  {
    template: "Drake Hotline Bling",
    caption: "Drake rejecting and approving",
    origin: "2017",
    category: "Comparison/Choice",
    topText: "No thanks",
    bottomText: "Yes please",
  },
  {
    template: "Distracted Boyfriend",
    caption: "Man looking at another woman",
    origin: "2017",
    category: "Distraction/Choice",
    topText: "His girlfriend",
    bottomText: "Other girl",
  },
  {
    template: "Woman Yelling at Cat",
    caption: "Woman yelling at confused cat",
    origin: "2019",
    category: "Chaos/Argument",
    topText: "Me complaining",
    bottomText: "My cat",
  },
  {
    template: "This is Fine",
    caption: "Dog in burning room saying all is fine",
    origin: "2010",
    category: "Denial/Crisis",
    topText: "Me",
    bottomText: "Everything falling apart",
  },
  {
    template: "Bad Luck Brian",
    caption: "Awkward smiling bald kid",
    origin: "2012",
    category: "Misfortune",
    topText: "Tries something",
    bottomText: "Everything goes wrong",
  },
]

const meanings = [
  "This meme expresses a preference or choice between two opposing options",
  "A humorous take on an everyday situation that resonates with many people",
  "Commentary on modern life and its contradictions",
  "A playful comparison showing opposite reactions",
  "Expressing what everyone thinks but nobody says",
]

const humors = [
  "The relatable nature of the situation makes it funny",
  "The absurdity of the comparison creates humor",
  "The timing and delivery of the message is comedic",
  "It captures an universal human experience with exaggeration",
  "The contrast between expectation and reality is comedic",
]

const contexts = [
  "This template became viral across social media platforms",
  "Originated from internet culture and has been used millions of times",
  "Part of the classic meme canon that defined internet humor",
  "Still relevant today despite its age, showing its versatility",
  "Widely recognized across different age groups and communities",
]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const personNames = ["Drake", "Woman Yelling", "Distracted Boyfriend", "Cat Stare", "Confused Math Lady"]

const personDescriptions = {
  Drake: {
    thumbnail: "/drake.jpg",
    memeAppearances: ["Drake Hotline Bling", "Drake pointing", "Drake confused", "Drake approving"],
    relatedMemes: [
      { title: "Drake Disapproves", link: "#" },
      { title: "Drake Approves", link: "#" },
    ],
    timeline: [
      { year: 2015, event: "First appearance in Hotline Bling music video" },
      { year: 2016, event: "Became one of the most popular meme templates" },
      { year: 2024, event: "Still being used in modern memes" },
    ],
  },
  "Woman Yelling": {
    thumbnail: "/diverse-woman-portrait.png",
    memeAppearances: ["Real Housewives compilation", "Woman vs cat debate", "Argument with invisible force"],
    relatedMemes: [
      { title: "Confused Cat", link: "#" },
      { title: "Yelling Woman Template", link: "#" },
    ],
    timeline: [
      { year: 2018, event: "Originated from Real Housewives of Beverly Hills" },
      { year: 2019, event: "Paired with confused cat for maximum impact" },
      { year: 2024, event: "Remains popular for expressing frustration" },
    ],
  },
  "Distracted Boyfriend": {
    thumbnail: "/boyfriend.jpg",
    memeAppearances: ["Looking at other woman", "Comparison format", "Choice meme", "Distraction template"],
    relatedMemes: [
      { title: "Jealous Girlfriend", link: "#" },
      { title: "Comparison Memes", link: "#" },
    ],
    timeline: [
      { year: 2015, event: "Photographer spotted the original moment" },
      { year: 2017, event: "Stock photo went viral as meme template" },
      { year: 2024, event: "One of the most versatile meme formats ever" },
    ],
  },
}

function generateDetectedPersons(): Person[] {
  const numPersons = getRandomNumber(2, 3)
  const selectedNames = personNames.sort(() => 0.5 - Math.random()).slice(0, numPersons)

  return selectedNames.map((name, idx) => ({
    id: `person-${idx}`,
    name,
    confidence: getRandomNumber(85, 98),
    thumbnail: (personDescriptions as any)[name]?.thumbnail || "/placeholder.svg",
    memeAppearances: (personDescriptions as any)[name]?.memeAppearances || [],
    relatedMemes: (personDescriptions as any)[name]?.relatedMemes || [],
    timeline: (personDescriptions as any)[name]?.timeline || [],
  }))
}

export function generateMockAnalysis(): AnalysisResult {
  const template = getRandomItem(memeTemplates)
  const confidence = getRandomNumber(85, 98)
  const relatable = getRandomNumber(60, 95)
  const humorous = getRandomNumber(50, 95)
  const sarcastic = getRandomNumber(20, 80)

  return {
    template: template.template,
    caption: template.caption,
    meaning: getRandomItem(meanings),
    humor: getRandomItem(humors),
    context: getRandomItem(contexts),
    confidence,
    origin: template.origin,
    category: template.category,
    topText: template.topText,
    bottomText: template.bottomText,
    relatable,
    humorous,
    sarcastic,
    detectedPersons: generateDetectedPersons(), // Include dynamic persons in analysis
  }
}
