export type Category = {
  id: string;
  name: string;
  emoji: string;
  count: number;
  image?: string;
};

export type Donation = {
  id: string;
  gameId: string;
  title: string;
  description: string;
  price: number;
  tag: string;
};

export type Listing = {
  id: string;
  title: string;
  game: string;
  gameId: string;
  price: number;
  image: string;
  level: number;
  rank: string;
  description: string;
  skins: string[];
  linked: string[];
  seller: { name: string; username: string; rating: number };
  premium?: boolean;
};

export const categories: Category[] = [
  { id: "coc", name: "Clash of Clans", emoji: "COC", count: 124, image: "/assets/coc-1.jpg" },
  { id: "pubg", name: "PUBG Mobile", emoji: "PUBG", count: 89, image: "/assets/pubg-1.jpg" },
  { id: "brawl", name: "Brawl Stars", emoji: "BS", count: 67, image: "/assets/brawl-1.jpg" },
  { id: "ff", name: "Free Fire", emoji: "FF", count: 53, image: "/assets/ff-1.jpg" },
  { id: "pes", name: "eFootball PES", emoji: "PES", count: 41, image: "/assets/pes-1.jpg" },
  { id: "other", name: "Boshqalar", emoji: "ALL", count: 28 },
];

export const donations: Donation[] = [
  {
    id: "coc-gold-pass",
    gameId: "coc",
    title: "Gold Pass",
    description: "Yangi mavsum bonuslari va builder boostlar.",
    price: 7,
    tag: "Season pass",
  },
  {
    id: "pubg-uc",
    gameId: "pubg",
    title: "660 UC",
    description: "Royal Pass va crate ochish uchun tezkor UC.",
    price: 10,
    tag: "UC",
  },
  {
    id: "brawl-pass",
    gameId: "brawl",
    title: "Brawl Pass Plus",
    description: "Skin, gem va progress rewardlar.",
    price: 12,
    tag: "Pass",
  },
  {
    id: "ff-elite",
    gameId: "ff",
    title: "Elite Pass",
    description: "Bundle, emote va yangi event mukofotlari.",
    price: 9,
    tag: "Elite",
  },
  {
    id: "pes-coins",
    gameId: "pes",
    title: "1050 eFootball Coins",
    description: "Top packlar va maxsus o'yinchilar uchun.",
    price: 11,
    tag: "Coins",
  },
];

export const listings: Listing[] = [
  {
    id: "1",
    title: "TH14 Max | 6500 Kuboklar",
    game: "Clash of Clans",
    gameId: "coc",
    price: 250,
    image: "/assets/coc-1.jpg",
    level: 220,
    rank: "Titan I",
    description:
      "Town Hall 14 to'liq maxed. Barcha qahramonlar 75 lvl. 6 ta qo'shimcha qurilish ustasi. Email o'zgartirilgan, xavfsiz.",
    skins: ["Champion Queen", "Gladiator King", "Pixel Warden"],
    linked: ["Supercell ID", "Email"],
    seller: { name: "Akmal G.", username: "akmal_g", rating: 4.9 },
    premium: true,
  },
  {
    id: "2",
    title: "TH13 Rush | Tez sotiladi",
    game: "Clash of Clans",
    gameId: "coc",
    price: 95,
    image: "/assets/coc-2.jpg",
    level: 165,
    rank: "Crystal II",
    description: "TH13, qahramonlar 60-65 lvl. Tez sotaman, narx muhokama qilinadi.",
    skins: ["Party King"],
    linked: ["Supercell ID"],
    seller: { name: "Sardor M.", username: "sardor_m", rating: 4.7 },
  },
  {
    id: "3",
    title: "Conqueror | M416 Glacier",
    game: "PUBG Mobile",
    gameId: "pubg",
    price: 320,
    image: "/assets/pubg-1.jpg",
    level: 78,
    rank: "Conqueror",
    description: "S20 Conqueror, 8000+ UC, nodir M416 Glacier skin, AKM Gold Plate.",
    skins: ["M416 Glacier Lv5", "AKM Gold", "Mythic Outfit"],
    linked: ["Facebook", "Twitter"],
    seller: { name: "Jasur K.", username: "jasur_pubg", rating: 5.0 },
    premium: true,
  },
  {
    id: "4",
    title: "Brawl Stars 35K Trofey",
    game: "Brawl Stars",
    gameId: "brawl",
    price: 140,
    image: "/assets/brawl-1.jpg",
    level: 180,
    rank: "Masters",
    description: "Barcha brawlerlar ochilgan, 30+ legendary skin. Hisob to'liq xavfsiz.",
    skins: ["Mecha Crow", "True Silver Spike"],
    linked: ["Supercell ID"],
    seller: { name: "Diyor R.", username: "diyor_bs", rating: 4.8 },
  },
  {
    id: "5",
    title: "Free Fire Grandmaster | Elite",
    game: "Free Fire",
    gameId: "ff",
    price: 75,
    image: "/assets/ff-1.jpg",
    level: 65,
    rank: "Grandmaster",
    description: "Elite Pass kollektsiyasi, 12 ta bundle, AWM Demon Slayer.",
    skins: ["AWM Demon Slayer", "Cobra Bundle"],
    linked: ["Facebook"],
    seller: { name: "Bekzod A.", username: "bek_ff", rating: 4.6 },
  },
  {
    id: "6",
    title: "PES eFootball | Top jamoa",
    game: "eFootball PES",
    gameId: "pes",
    price: 110,
    image: "/assets/pes-1.jpg",
    level: 95,
    rank: "Division 1",
    description: "Messi, Mbappe, Haaland - barcha top kartochkalar. 50K myClub coin.",
    skins: [],
    linked: ["Konami ID"],
    seller: { name: "Otabek S.", username: "ota_pes", rating: 4.9 },
  },
];

export const getListing = (id: string) => listings.find((listing) => listing.id === id);
export const getByCategory = (gameId: string) =>
  listings.filter((listing) => listing.gameId === gameId);
