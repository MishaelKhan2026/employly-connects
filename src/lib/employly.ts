export type Role = "hiring" | "seeking";

export const SKILLS = [
  "Crochet",
  "Baking",
  "Knitting",
  "Painting",
  "Drawing",
  "Social media",
  "Flyer making",
  "Pottery",
  "Sewing",
  "Photography",
  "Cooking",
  "Gardening",
] as const;

export type Profile = {
  id: string;
  role: Role;
  name: string;
  /** Business area / neighbourhood */
  location: string;
  skills: string[];
  /** interests (seeking) / requirements (hiring) */
  about: string;
  /** what they are looking for */
  lookingFor: string;
  /** expected salary (seeking) / offered salary (hiring) */
  salary: string;
};

export const emptyProfile = (role: Role): Profile => ({
  id: "me",
  role,
  name: "",
  location: "",
  skills: [],
  about: "",
  lookingFor: "",
  salary: "",
});

export const SEED: Profile[] = [
  {
    id: "s1",
    role: "seeking",
    name: "Amara Diallo",
    location: "Riverside",
    skills: ["Crochet", "Knitting", "Sewing"],
    about: "Ten years of crochet at home. Patient, tidy, good with detailed orders.",
    lookingFor: "Part-time work, 3 days a week, close to home.",
    salary: "$12 / hour",
  },
  {
    id: "s2",
    role: "seeking",
    name: "Ben Okoro",
    location: "Old Town",
    skills: ["Baking", "Cooking"],
    about: "Home baker: breads, cinnamon rolls, birthday cakes. Early riser.",
    lookingFor: "Morning shifts in a small bakery or café.",
    salary: "$14 / hour",
  },
  {
    id: "s3",
    role: "seeking",
    name: "Priya Raman",
    location: "Green Market",
    skills: ["Social media", "Flyer making", "Drawing"],
    about: "I run two community pages and design simple posters in Canva.",
    lookingFor: "Remote or 2 days on site, flexible hours.",
    salary: "$300 / month",
  },
  {
    id: "s4",
    role: "seeking",
    name: "Marta Silva",
    location: "Hillside",
    skills: ["Pottery", "Painting"],
    about: "Studio-trained potter, comfortable with wheel work and glazing.",
    lookingFor: "Workshop assistant or market stall help.",
    salary: "$15 / hour",
  },
  {
    id: "s5",
    role: "seeking",
    name: "Joseph Kim",
    location: "Riverside",
    skills: ["Photography", "Social media"],
    about: "Product photos with natural light, quick edits, own camera.",
    lookingFor: "Weekend gigs, paid per shoot.",
    salary: "$60 / shoot",
  },
  {
    id: "s6",
    role: "seeking",
    name: "Fatima Noor",
    location: "Old Town",
    skills: ["Gardening", "Painting"],
    about: "Grew up on a nursery farm. Reliable, happy outdoors.",
    lookingFor: "Steady weekday work.",
    salary: "$11 / hour",
  },
  {
    id: "h1",
    role: "hiring",
    name: "Sunrise Corner Bakery",
    location: "Old Town",
    skills: ["Baking", "Cooking", "Social media"],
    about: "Small family bakery, 4 staff. We need someone calm during the morning rush.",
    lookingFor: "A baker's assistant who can start at 5am and help post daily specials.",
    salary: "$13–15 / hour",
  },
  {
    id: "h2",
    role: "hiring",
    name: "Loop & Thread Studio",
    location: "Riverside",
    skills: ["Crochet", "Knitting", "Sewing"],
    about: "We sell handmade blankets and toys at three local markets.",
    lookingFor: "Two makers who can finish 5 pieces a week from our patterns.",
    salary: "$10 / hour + per piece bonus",
  },
  {
    id: "h3",
    role: "hiring",
    name: "Claywork Collective",
    location: "Hillside",
    skills: ["Pottery", "Painting", "Photography"],
    about: "Community pottery studio running evening classes.",
    lookingFor: "Studio helper for glazing, kiln loading and class setup.",
    salary: "$14 / hour",
  },
  {
    id: "h4",
    role: "hiring",
    name: "Green Market Grocers",
    location: "Green Market",
    skills: ["Flyer making", "Social media", "Gardening"],
    about: "Neighbourhood grocery with a small plant section.",
    lookingFor: "Someone to make weekly flyers and keep our page alive.",
    salary: "$250 / month",
  },
  {
    id: "h5",
    role: "hiring",
    name: "Petal & Paper",
    location: "Old Town",
    skills: ["Drawing", "Painting", "Flyer making"],
    about: "Tiny stationery shop selling hand-drawn cards.",
    lookingFor: "An illustrator for 10 new card designs each month.",
    salary: "$18 per design",
  },
];

/** Requests other people/businesses have sent to the current user, per role. */
export type IncomingRequest = {
  /** id of the sender in SEED */
  fromId: string;
  message: string;
  sentAt: string;
};

export const INCOMING: Record<Role, IncomingRequest[]> = {
  // If I'm hiring, job seekers request to join my business.
  hiring: [
    {
      fromId: "s2",
      message: "I bake every morning from 4am. I'd love to help in your kitchen.",
      sentAt: "Today",
    },
    {
      fromId: "s1",
      message: "I can finish detailed crochet orders quickly and I live nearby.",
      sentAt: "Yesterday",
    },
    {
      fromId: "s5",
      message: "Happy to shoot your products this weekend, I bring my own camera.",
      sentAt: "3 days ago",
    },
  ],
  // If I'm seeking, businesses invite me to work with them.
  seeking: [
    {
      fromId: "h2",
      message: "We saw your maker profile — can you start on 5 pieces a week?",
      sentAt: "Today",
    },
    {
      fromId: "h4",
      message: "We need weekly flyers and someone to keep our page alive.",
      sentAt: "2 days ago",
    },
    {
      fromId: "h1",
      message: "Morning shifts are open at the bakery if you're still looking.",
      sentAt: "Last week",
    },
  ],
};

export type InboxStatus = "accepted" | "declined";

const KEY = "employly:v1";

type Store = {
  role: Role;
  profiles: Record<Role, Profile>;
  /** ids the current user has sent a request to */
  requests: string[];
  /** decision on incoming requests, keyed by sender id */
  inbox: Record<string, InboxStatus>;
};

export const defaultStore = (): Store => ({
  role: "seeking",
  profiles: { seeking: emptyProfile("seeking"), hiring: emptyProfile("hiring") },
  requests: [],
  inbox: {},
});

export const loadStore = (): Store => {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) } as Store;
  } catch {
    return defaultStore();
  }
};

export const saveStore = (store: Store) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
};

export type { Store };
