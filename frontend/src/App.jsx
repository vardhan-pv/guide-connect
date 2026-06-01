import { useState, useEffect, useRef, useCallback } from "react";
import { socket, connectSocket, disconnectSocket } from "./socket";

// ============================================================
// DESIGN SYSTEM & CONSTANTS
// ============================================================
const COLORS = {
  // India Brand Colors
  primary: "#E65100",       // Indian Deep Saffron
  primaryDark: "#BF360C",   // Darker Saffron/Rust
  primaryLight: "#FF8F00",  // Bright Marigold
  gold: "#D4AF37",          // Antique Gold

  // SaaS Brand Colors
  saas: "#6366F1",          // Indigo (SaaS primary)
  saasDark: "#4F46E5",      // Deep Indigo
  saasLight: "#818CF8",     // Light Indigo
  saasGlow: "#6366F133",    // Indigo glow

  // Accent
  accent: "#1E3A8A",        // Royal Indigo Blue
  accentLight: "#3B82F6",   // Electric Blue
  cyan: "#06B6D4",          // Cyan

  // Neutral Dark
  dark: "#080C1A",
  darkAlt: "#0D1526",
  darkCard: "#0F1629",
  darkCard2: "#111827",
  darkBorder: "#1E2A45",
  darkBorder2: "#1F2937",

  // Text
  text: "#F0F4FF",
  textMuted: "#8B9EC4",
  textDim: "#566380",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#06B6D4",

  // Gradients (strings for use in CSS)
  gradHero: "linear-gradient(135deg, #080C1A 0%, #0D1526 40%, #111827 100%)",
  gradSaas: "linear-gradient(135deg, #6366F1, #4F46E5)",
  gradIndia: "linear-gradient(135deg, #E65100, #FF8F00)",
  gradGold: "linear-gradient(135deg, #D4AF37, #F59E0B)",
  gradSuccess: "linear-gradient(135deg, #10B981, #059669)",
};

// SaaS Plan Data
const SAAS_PLANS = [
  {
    id: "starter", name: "Starter", price: 999, annualPrice: 799,
    icon: "🌱", color: COLORS.success, badge: null,
    desc: "Perfect for small travel agencies getting started",
    features: [
      "Up to 10 verified guides",
      "50 bookings per month",
      "Real-time chat & booking",
      "Basic analytics dashboard",
      "Email support (48h SLA)",
      "Mobile-responsive interface",
    ],
    notIncluded: ["AI Travel Concierge", "White-label branding", "Team management", "API access"]
  },
  {
    id: "professional", name: "Professional", price: 2999, annualPrice: 2399,
    icon: "🚀", color: COLORS.saas, badge: "Most Popular",
    desc: "For growing travel businesses with real-time needs",
    features: [
      "Up to 50 verified guides",
      "500 bookings per month",
      "Real-time chat & booking",
      "Advanced analytics + charts",
      "AI India Travel Concierge ✨",
      "Partial white-label branding",
      "Team up to 5 members",
      "Priority support (12h SLA)",
    ],
    notIncluded: ["Unlimited guides", "Full white-label", "Dedicated account manager"]
  },
  {
    id: "enterprise", name: "Enterprise", price: 7999, annualPrice: 6399,
    icon: "🏆", color: COLORS.gold, badge: "Best Value",
    desc: "For large tour operators and tourism boards",
    features: [
      "Unlimited verified guides",
      "Unlimited bookings",
      "Real-time chat & booking",
      "Full analytics suite + export",
      "AI India Travel Concierge ✨",
      "Full white-label + custom domain",
      "Unlimited team members",
      "Dedicated account manager",
      "API access (REST + Webhooks)",
      "SLA 99.9% uptime guarantee",
    ],
    notIncluded: []
  },
];


const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi (UT)",
  "Jammu & Kashmir (UT)",
  "Ladakh (UT)",
  "Puducherry (UT)",
];

const COUNTRIES_AND_STATES = {
  "India": INDIAN_STATES,
  "Nepal": [
    "Koshi Province",
    "Madhesh Province",
    "Bagmati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province"
  ],
  "Bhutan": [
    "Western Bhutan",
    "Central Bhutan",
    "Eastern Bhutan",
    "Southern Bhutan"
  ],
  "Sri Lanka": [
    "Western Province",
    "Central Province",
    "Southern Province",
    "Northern Province",
    "Eastern Province",
    "North Western Province",
    "North Central Province",
    "Uva Province",
    "Sabaragamuwa Province"
  ]
};

const EXPLORE_PLACES = [
  {
    id: 1,
    name: "Golden Temple Street Food, Amritsar",
    state: "Punjab",
    service: "food",
    image: "https://images.unsplash.com/photo-1600100397608-f010e4006822?auto=format&fit=crop&w=600&q=80",
    description: "Savor the iconic butter-dripping Amritsari Kulchas, spicy chole, and thick Punjabi lassi at historic local dhabas."
  },
  {
    id: 2,
    name: "Munnar Tea Gardens",
    state: "Kerala",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=600&q=80",
    description: "Walk through rolling emerald hills covered in tea orchards, blanketed by a serene layer of early morning mist."
  },
  {
    id: 3,
    name: "Alleppey Backwater Cruise",
    state: "Kerala",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1593693411515-c202e974eb8f?auto=format&fit=crop&w=600&q=80",
    description: "Cruise peacefully along quiet palm-fringed canals in fully-catered luxury houseboats called Kettuvallams."
  },
  {
    id: 4,
    name: "Kovalam Beach Surf",
    state: "Kerala",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1589979482837-e74f2e145060?auto=format&fit=crop&w=600&q=80",
    description: "Unwind on golden sands adjacent to a tall striped lighthouse, offering vibrant seaside dining and soft waves."
  },
  {
    id: 5,
    name: "Amber Fort Walks, Jaipur",
    state: "Rajasthan",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    description: "Explore the massive yellow sandstone ramparts, sheesh mahal (mirror palace), and royal courtyards overlooking Maota Lake."
  },
  {
    id: 6,
    name: "Varanasi Ghats Aarti",
    state: "Uttar Pradesh",
    service: "culture",
    image: "https://images.unsplash.com/photo-1561361060-619ab8a8e31a?auto=format&fit=crop&w=600&q=80",
    description: "Witness the mystical evening Ganga Aarti prayers along the river steps as thousands of oil lamps float on the holy waters."
  },
  {
    id: 7,
    name: "Taj Mahal Heritage Walk, Agra",
    state: "Uttar Pradesh",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    description: "Admire the world's most famous monument of love, built of pristine white marble with complex floral inlay work."
  },
  {
    id: 8,
    name: "Pangong Lake Trek",
    state: "Ladakh (UT)",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=600&q=80",
    description: "Ride across the high-altitude desert to see the brilliant blue waters of the lake reflecting the brown mountains."
  },
  {
    id: 9,
    name: "Calangute Water Sports",
    state: "Goa",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    description: "Enjoy high-speed jet skiing, parasailing, and vibrant beach shack parties under the tropical Goan sun."
  },
  {
    id: 10,
    name: "Darjeeling Himalayan Railway",
    state: "West Bengal",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
    description: "Ride the iconic heritage 'Toy Train' chugging through winding mountain tracks with scenic views of Mount Kanchenjunga."
  },
  {
    id: 11,
    name: "Old Delhi Spice Crawl",
    state: "Delhi (UT)",
    service: "food",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    description: "Trek through the busy lanes of Khari Baoli market, taking in the aromas of massive sacks of cardamom, cloves, and chilies."
  },
  {
    id: 12,
    name: "Meenakshi Temple Architecture, Madurai",
    state: "Tamil Nadu",
    service: "culture",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    description: "Gaze at the massive colorful gopurams (towers) adorned with thousands of stone carvings of gods and mythical figures."
  },
  {
    id: 13,
    name: "Chhatrapati Shivaji Terminus, Mumbai",
    state: "Maharashtra",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=600&q=80",
    description: "Observe the majestic Victorian Gothic architecture of this bustling UNESCO World Heritage railway terminal."
  },
  {
    id: 14,
    name: "Shimla Ridge Sightseeing",
    state: "Himachal Pradesh",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80",
    description: "Stroll along the historic pine-lined pedestrian plaza offering gorgeous views of snow-capped Himalayan ranges."
  },
  {
    id: 15,
    name: "Dal Lake Shikara Ride, Srinagar",
    state: "Jammu & Kashmir (UT)",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1566837930226-f8b9ec4f386d?auto=format&fit=crop&w=600&q=80",
    description: "Glide peacefully on a wooden Shikara boat across mirror-like waters past floating vegetable markets and gardens."
  },
  {
    id: 16,
    name: "Tirupati Temple Sacred Trails",
    state: "Andhra Pradesh",
    service: "culture",
    image: "https://images.unsplash.com/photo-1608958220963-6b4d93700d1e?auto=format&fit=crop&w=600&q=80",
    description: "Visit the sacred hill shrine of Tirumala Venkateswara, experiencing majestic temple rituals and Dravidian architecture."
  },
  {
    id: 17,
    name: "Tawang Monastery Heritage",
    state: "Arunachal Pradesh",
    service: "culture",
    image: "https://images.unsplash.com/photo-1587309267137-ee6c0245df6a?auto=format&fit=crop&w=600&q=80",
    description: "Explore the largest monastery in India, perched at 10,000 feet in the snow-dusted Eastern Himalayas of Tawang."
  },
  {
    id: 18,
    name: "Kaziranga Wildlife Safari",
    state: "Assam",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=600&q=80",
    description: "Embark on an exciting safari through dense tall grasslands to spot the iconic endangered Indian One-Horned Rhinoceros."
  },
  {
    id: 19,
    name: "Mahabodhi Enlightenment Temple, Bodh Gaya",
    state: "Bihar",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?auto=format&fit=crop&w=600&q=80",
    description: "Meditate at the UNESCO world heritage temple site under the sacred Bodhi Tree where Lord Buddha attained enlightenment."
  },
  {
    id: 20,
    name: "Chitrakote Horseshoe Falls",
    state: "Chhattisgarh",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=600&q=80",
    description: "Admire the majestic 'Niagara of India', a massive horse-shoe waterfall on the Indravati river dropping amidst rocky cliffs."
  },
  {
    id: 21,
    name: "Rann of Kutch Salt Desert",
    state: "Gujarat",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    description: "Walk across the infinite shining white salt flats of the Great Rann under a pristine starlit midnight sky."
  },
  {
    id: 22,
    name: "Kurukshetra Heritage Sites",
    state: "Haryana",
    service: "culture",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    description: "Explore the sacred Brahma Sarovar pond and ancient archaeological sites linked to the historic Mahabharata epic."
  },
  {
    id: 23,
    name: "Deoghar Baidyanath Temple Pilgrimage",
    state: "Jharkhand",
    service: "culture",
    image: "https://images.unsplash.com/photo-1542397284385-6010176424d2?auto=format&fit=crop&w=600&q=80",
    description: "Join thousands of saffron-clad pilgrims visiting the ancient Baidyanath Jyotirlinga temple complex."
  },
  {
    id: 24,
    name: "Hampi Ruins Exploration",
    state: "Karnataka",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1600100398339-df4a6146597a?auto=format&fit=crop&w=600&q=80",
    description: "Walk through the spectacular sprawling boulder-strewn landscape of Hampi, a majestic capital of the Vijayanagara Empire."
  },
  {
    id: 25,
    name: "Khajuraho Erotic Sculpture Temples",
    state: "Madhya Pradesh",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1626294719036-7c64cfb845df?auto=format&fit=crop&w=600&q=80",
    description: "Gaze at the exceptionally intricate stone sculptures and monumental sandstone architecture of the UNESCO-listed Khajuraho temples."
  },
  {
    id: 26,
    name: "Loktak Floating Phumdi Lake",
    state: "Manipur",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1579621970795-87faff3f0768?auto=format&fit=crop&w=600&q=80",
    description: "Witness the unique floating circular swamps called phumdis on Loktak Lake, home to the rare brow-antlered Sangai deer."
  },
  {
    id: 27,
    name: "Living Root Bridges, Cherrapunji",
    state: "Meghalaya",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
    description: "Trek deep into wet tropical rainforests to cross stunning suspension bridges hand-grown from living rubber tree roots."
  },
  {
    id: 28,
    name: "Vantawng Bamboo Groves & Falls",
    state: "Mizoram",
    service: "tourism",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    description: "Marvel at the spectacular two-tiered waterfall dropping 750 feet into lush bamboo groves in the blue hills of Mizoram."
  },
  {
    id: 29,
    name: "Dzukou Lily Valley Trek",
    state: "Nagaland",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    description: "Trek through the fairytale-like undulating green landscapes of Dzukou Valley, famous for its seasonal pink Dzukou lilies."
  },
  {
    id: 30,
    name: "Konark Chariot Sun Temple",
    state: "Odisha",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=600&q=80",
    description: "Marvel at the giant 13th-century stone chariot dedicated to the Sun God, decorated with 24 beautifully carved wheels."
  },
  {
    id: 31,
    name: "Gurudongmar High-Altitude Lake",
    state: "Sikkim",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80",
    description: "Travel to one of the highest lakes in the world, sitting at 17,800 feet, sacred to both Buddhists and Sikhs."
  },
  {
    id: 32,
    name: "Charminar Heritage & Biryani Walk",
    state: "Telangana",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=600&q=80",
    description: "Explore the four minarets of Charminar, surrounding pearl bazaars, and enjoy local Hyderabadi Biryani and Irani chai."
  },
  {
    id: 33,
    name: "Unoti Ancient Rock Carvings",
    state: "Tripura",
    service: "heritage",
    image: "https://images.unsplash.com/photo-1609137144814-722fb4189e47?auto=format&fit=crop&w=600&q=80",
    description: "Gaze at the ancient gigantic bas-relief rock carvings of Shiva and other gods in a mystical forested hill of Tripura."
  },
  {
    id: 34,
    name: "Valley of Flowers Alpine Trek",
    state: "Uttarakhand",
    service: "adventure",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    description: "Trek through a high-altitude Himalayan valley covered in a breathtaking mosaic of thousands of alpine flower species."
  }
];

const SERVICES = [
  { id: "heritage", icon: "🏰", label: "Fort & Palace Walks", desc: "Expert-led historic fort, palace & monument walks", color: "#E65100" },
  { id: "spiritual", icon: "🛕", label: "Sacred & Temple Tours", desc: "Sacred temple, ashram & holy site explorations", color: "#FF8F00" },
  { id: "food", icon: "🍜", label: "Bazaar & Street Food", desc: "Old market spice trails & local culinary walks", color: "#D4AF37" },
  { id: "languages", icon: "🗣️", label: "Regional Translation", desc: "Local dialect assistance & cross-cultural translation", color: "#1E3A8A" },
  { id: "stays", icon: "🏨", label: "Ashrams & Heritage Stays", desc: "Ashrams, boutique heritage hotels & homestay help", color: "#10B981" },
  { id: "transit", icon: "🛺", label: "Auto & Rickshaw Transit", desc: "Rickshaw, local train navigation & fare guidance", color: "#06B6D4" },
  { id: "shopping", icon: "🛍️", label: "Bazaars & Crafts", desc: "Textiles, antique jewelry & handicraft shopping help", color: "#EC4899" },
  { id: "emergency", icon: "🆘", label: "24/7 Safety SOS", desc: "Instant security, tourist helpline & safety escorts", color: "#EF4444" },
];

const DESTINATIONS = [
  { name: "Rajasthan", image: "🏰", guides: 245, rating: 4.9, country: "India" },
  { name: "Varanasi", image: "🛕", guides: 182, rating: 4.95, country: "India" },
  { name: "Agra", image: "🕌", guides: 198, rating: 4.8, country: "India" },
  { name: "Kerala", image: "🌴", guides: 154, rating: 4.9, country: "India" },
  { name: "Ladakh", image: "🏔️", guides: 96, rating: 4.85, country: "India" },
  { name: "Goa", image: "🏖️", guides: 120, rating: 4.75, country: "India" },
];

const GUIDES_DATA = [
  {
    id: 1, name: "Priya Sharma", city: "Jaipur", state: "Rajasthan", country: "India",
    email: "priya@example.com", password: "password123",
    languages: ["Hindi", "English", "French"], rating: 4.9, reviews: 234,
    price: 600, currency: "₹", services: ["heritage", "shopping", "food"],
    bio: "Born in the Pink City, I've guided travelers through Rajasthan's royal heritage, historic forts, and block-printing hubs for 8 years. Let's explore Amber Fort and the finest street food in Johri Bazaar!",
    avatar: "PS", verified: true, experience: 8, bookings: 1240,
    badge: "Royal Heritage Expert", available: true,
  },
  {
    id: 2, name: "Amit Mishra", city: "Varanasi", state: "Uttar Pradesh", country: "India",
    email: "amit@example.com", password: "password123",
    languages: ["Hindi", "English", "Sanskrit"], rating: 4.95, reviews: 189,
    price: 500, currency: "₹", services: ["spiritual", "heritage", "food"],
    bio: "Kashi resident and Sanskrit scholar. I offer spiritual walks through ancient ghats, arrange private morning boat rides, and reveal the mysticism of Ganga Aarti away from typical crowds.",
    avatar: "AM", verified: true, experience: 10, bookings: 890,
    badge: "Spiritual Guru", available: true,
  },
  {
    id: 3, name: "Rajesh Pillai", city: "Kochi", state: "Kerala", country: "India",
    email: "rajesh@example.com", password: "password123",
    languages: ["Malayalam", "English", "Hindi", "Tamil"], rating: 4.8, reviews: 156,
    price: 700, currency: "₹", services: ["stays", "transit", "food"],
    bio: "Passionate about God's Own Country. Specializing in backwater houseboat bookings, Ayurvedic retreats, spice garden treks, and Kochi's historic Fort heritage.",
    avatar: "RP", verified: true, experience: 7, bookings: 720,
    badge: "Eco-Tourism Specialist", available: true,
  },
  {
    id: 4, name: "Ananya Sen", city: "Kolkata", state: "West Bengal", country: "India",
    email: "ananya@example.com", password: "password123",
    languages: ["Bengali", "Hindi", "English", "German"], rating: 4.8, reviews: 298,
    price: 800, currency: "₹", services: ["food", "heritage", "languages"],
    bio: "Historian and culinary explorer. I show travelers the British colonial history of Kolkata, Bengali literature hubs, and lead street food walks tasting authentic Puchkas and Sandesh.",
    avatar: "AS", verified: true, experience: 6, bookings: 1560,
    badge: "Culture & Culinary Guide", available: true,
  },
  {
    id: 5, name: "Rigzin Namgyal", city: "Leh", state: "Ladakh", country: "India",
    email: "rigzin@example.com", password: "password123",
    languages: ["Ladakhi", "Tibetan", "English", "Hindi"], rating: 4.9, reviews: 98,
    price: 900, currency: "₹", services: ["transit", "stays", "heritage"],
    bio: "Native Ladakhi mountaineer. Guiding treks through the Himalayas, visits to ancient Buddhist monasteries (Hemis, Thiksey), and navigating offbeat mountain passes safely.",
    avatar: "RN", verified: true, experience: 12, bookings: 430,
    badge: "Himalayan Explorer", available: false,
  },
  {
    id: 6, name: "Vikram Rathore", city: "Agra", state: "Uttar Pradesh", country: "India",
    email: "vikram@example.com", password: "password123",
    languages: ["Hindi", "English", "Spanish", "Italian"], rating: 4.7, reviews: 143,
    price: 650, currency: "₹", services: ["heritage", "languages", "shopping"],
    bio: "Approved by Ministry of Tourism. I present the rich Mughal history of Taj Mahal, Agra Fort, and Fatehpur Sikri. Guiding you past long queues and showing secret photo spots.",
    avatar: "VR", verified: true, experience: 9, bookings: 670,
    badge: "Mughal History Scholar", available: true,
  },
  {
    id: 7, name: "Devendra Joshi", city: "Mumbai", state: "Maharashtra", country: "India",
    email: "devendra@example.com", password: "password123",
    languages: ["Marathi", "Hindi", "English", "Gujarati"], rating: 4.8, reviews: 172,
    price: 750, currency: "₹", services: ["transit", "food", "languages"],
    bio: "Mumbaikar through and through. Let me navigate you through Colaba's heritage lanes, guide you on local trains during non-peak hours, and show you Mumbai's hidden street food corners.",
    avatar: "DJ", verified: true, experience: 5, bookings: 310,
    badge: "Mumbaikar Expert", available: true,
  },
  {
    id: 8, name: "Soundarya Rajan", city: "Chennai", state: "Tamil Nadu", country: "India",
    email: "soundarya@example.com", password: "password123",
    languages: ["Tamil", "English", "Telugu", "French"], rating: 4.9, reviews: 118,
    price: 700, currency: "₹", services: ["spiritual", "languages", "food"],
    bio: "Deeply connected to Dravidian art, architecture and local rituals. I specialize in explaining the Gopurams of Kapaleeshwarar Temple, shopping in T. Nagar, and authentic filter coffee walks.",
    avatar: "SR", verified: true, experience: 7, bookings: 290,
    badge: "Dravidian Heritage Guide", available: true,
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell", from: "New York, USA", dest: "Jaipur, Rajasthan",
    text: "Priya took us to hidden havelis and family-run dhabas in Jaipur that no tourist ever finds. Best travel experience of my life. Worth every rupee!",
    rating: 5, avatar: "SM"
  },
  {
    name: "Thomas Weber", from: "Berlin, Germany", dest: "Varanasi, Uttar Pradesh",
    text: "Amit's deep understanding of Varanasi's spiritual history turned our morning ghat walk into a profound experience. He arranged a private boat ride for Ganga Aarti. Unforgettable.",
    rating: 5, avatar: "TW"
  },
  {
    name: "Aisha Patel", from: "London, UK", dest: "Taj Mahal, Agra",
    text: "Vikram was exceptional at Taj Mahal—got us through the crowds in minutes, explained Mughal history beautifully, and helped us avoid aggressive sellers.",
    rating: 5, avatar: "AP"
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Select State & Service", desc: "Pick any of India's 28 states & UTs, select the service you need, and search verified nearby guides.", icon: "🔍" },
  { step: "02", title: "Browse Local Experts", desc: "Review detailed guide profiles, check real-time availability, ratings and hourly pricing.", icon: "👤" },
  { step: "03", title: "Book & Pay Securely", desc: "Select your date and duration, and request a booking. Sockets notify the guide instantly.", icon: "💳" },
  { step: "04", title: "Start Your Adventure", desc: "Connect via live real-time chat, coordinate your meeting location, and explore like a local.", icon: "🤝" },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatPrice(price, currency) {
  return `${currency}${price.toLocaleString()}`;
}

function generateId() {
  return "GC-" + Math.random().toString(36).substring(2, 9).toUpperCase();
}

// ============================================================
// REUSABLE UI COMPONENTS
// ============================================================
function Avatar({ initials, size = 40, bg = COLORS.primary, color = "#fff" }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, color, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size * 0.35, fontWeight: 700,
        flexShrink: 0, fontFamily: "inherit",
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ label, color = COLORS.primary }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.5px",
    }}>
      {label}
    </span>
  );
}

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "flex", gap: 1, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= Math.floor(rating) ? "#F59E0B" : "#374151" }}>★</span>
      ))}
    </span>
  );
}

function Button({ children, variant = "primary", onClick, style = {}, disabled = false, size = "md" }) {
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 22px", fontSize: 15 }, lg: { padding: "14px 32px", fontSize: 17 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", border: "none" },
    accent: { background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`, color: "#fff", border: "none" },
    outline: { background: "transparent", color: COLORS.primaryLight, border: `2px solid ${COLORS.primaryLight}` },
    ghost: { background: "rgba(255,255,255,0.07)", color: COLORS.text, border: "1px solid rgba(255,255,255,0.1)" },
    danger: { background: `linear-gradient(135deg, ${COLORS.danger}, #C53030)`, color: "#fff", border: "none" },
    success: { background: `linear-gradient(135deg, ${COLORS.success}, #059669)`, color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant], ...sizes[size],
        borderRadius: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s ease",
        fontFamily: "inherit",
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.target.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.target.style.transform = ""; }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {}, onClick, glow = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(17, 24, 39, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        boxShadow: glow ? `0 0 30px ${COLORS.primary}22` : "0 4px 24px rgba(0,0,0,0.3)",
        ...style,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(230,81,0,0.25)`; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = glow ? `0 0 30px ${COLORS.primary}22` : "0 4px 24px rgba(0,0,0,0.3)"; } }}
    >
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text", icon, style = {} }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {icon && <span style={{ position: "absolute", left: 14, fontSize: 18, zIndex: 1 }}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: icon ? "12px 16px 12px 44px" : "12px 16px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: COLORS.text, fontSize: 14,
          outline: "none", fontFamily: "inherit",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = COLORS.primary}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

function Modal({ open, onClose, children, title, maxWidth = 600 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, boxSizing: "border-box",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: COLORS.darkCard, border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: 32, width: "100%", maxWidth,
        maxHeight: "90vh", overflowY: "auto",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10,
            color: COLORS.text, fontSize: 18, cursor: "pointer", padding: "4px 10px",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: "3px solid rgba(255,255,255,0.2)",
      borderTop: `3px solid ${COLORS.primary}`, borderRadius: "50%",
      animation: "spin 0.8s linear infinite", display: "inline-block",
    }} />
  );
}

function Tag({ label }) {
  return (
    <span style={{
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "3px 10px", fontSize: 12, color: COLORS.textMuted,
    }}>
      {label}
    </span>
  );
}

// ============================================================
// GUIDE CARD COMPONENT
// ============================================================
function GuideCard({ guide, onBook, onChat, onView }) {
  const serviceIcons = { heritage: "🏰", spiritual: "🛕", food: "🍜", languages: "🗣️", stays: "🏨", transit: "🛺", shopping: "🛍️", emergency: "🆘" };
  const badgeColors = {
    "Royal Heritage Expert": COLORS.primary, "Spiritual Guru": "#8B5CF6",
    "Eco-Tourism Specialist": COLORS.primaryLight, "Culture & Culinary Guide": COLORS.gold,
    "Himalayan Explorer": "#06B6D4", "Mughal History Scholar": COLORS.primaryDark,
    "Mumbaikar Expert": COLORS.accentLight, "Dravidian Heritage Guide": "#EC4899"
  };
  return (
    <Card onClick={() => onView(guide)} style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <Avatar initials={guide.avatar} size={60} bg={`linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`} />
          {guide.available && (
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: "50%",
              background: COLORS.success, border: "2px solid " + COLORS.darkCard,
            }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{guide.name}</span>
            {guide.verified && <span style={{ fontSize: 14 }}>✅</span>}
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>📍 {guide.city}, {guide.state}</div>
          <Badge label={guide.badge} color={badgeColors[guide.badge] || COLORS.primary} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: COLORS.primaryLight, fontWeight: 700, fontSize: 15 }}>{formatPrice(guide.price, guide.currency)}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>per hour</div>
        </div>
      </div>

      <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {guide.bio}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {guide.languages.map(l => <Tag key={l} label={l} />)}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {guide.services.map(s => <span key={s} style={{ fontSize: 18 }} title={s}>{serviceIcons[s]}</span>)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars rating={guide.rating} size={13} />
          <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 13 }}>{guide.rating}</span>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>({guide.reviews})</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onChat(guide); }}>💬 Chat</Button>
          <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); onBook(guide); }}>Book Now</Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar({ currentPage, setCurrentPage, user, onLogin, onLogout }) {
  const navItems = ["Home", "Explore", "Guides", "AI Assistant"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
      background: "rgba(10, 15, 30, 0.9)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 24px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div
        onClick={() => setCurrentPage("Home")}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div style={{
          width: 36, height: 36, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>🧭</div>
        <span style={{ fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: "-0.5px" }}>
          Guide<span style={{ color: COLORS.gold }}>Connect</span>
        </span>
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {navItems.map(item => (
          <button
            key={item}
            onClick={() => setCurrentPage(item === "AI Assistant" ? "AI" : item)}
            style={{
              background: currentPage === (item === "AI Assistant" ? "AI" : item) ? "rgba(230,81,0,0.15)" : "transparent",
              border: currentPage === (item === "AI Assistant" ? "AI" : item) ? `1px solid ${COLORS.primary}44` : "1px solid transparent",
              color: currentPage === (item === "AI Assistant" ? "AI" : item) ? COLORS.primaryLight : COLORS.textMuted,
              borderRadius: 10, padding: "6px 14px", cursor: "pointer",
              fontSize: 14, fontWeight: 500, fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {user ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(user.role === "admin" ? "Admin" : user.role === "guide" ? "GuideDash" : "TouristDash")}>
              {user.role === "admin" ? "⚡ Admin" : user.role === "guide" ? "📊 Dashboard" : "🗺️ Dashboard"}
            </Button>
            <Avatar initials={user.name.split(" ").map(n => n[0]).join("")} size={34} bg={COLORS.accent} />
            <button onClick={onLogout} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13 }}>Logout</button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => onLogin("tourist", "login")}>Sign In</Button>
            <Button variant="accent" size="sm" onClick={() => onLogin("tourist", "signup")}>Sign Up</Button>
          </>
        )}
      </div>
    </nav>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ setCurrentPage, setSelectedGuide, onBook, onChat, onLogin, guidesList, selectedState, setSelectedState, selectedService, setSelectedService }) {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* HERO */}
      <section style={{
        minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: `radial-gradient(ellipse 100% 80% at 50% -10%, ${COLORS.primary}33 0%, transparent 60%), 
                     radial-gradient(ellipse 60% 40% at 80% 60%, ${COLORS.accent}22 0%, transparent 50%),
                     linear-gradient(180deg, ${COLORS.dark} 0%, #050B1A 100%)`,
        padding: "80px 24px 60px",
      }}>
        {/* Animated background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(30,111,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,111,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        {/* Floating orbs */}
        {[
          { size: 300, x: -10, y: 20, color: COLORS.primary, delay: 0 },
          { size: 200, x: 80, y: 10, color: COLORS.gold, delay: 2 },
          { size: 150, x: 40, y: 70, color: COLORS.accent, delay: 4 },
        ].map((orb, i) => (
          <div key={i} style={{
            position: "absolute", width: orb.size, height: orb.size,
            left: `${orb.x}%`, top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.color}30 0%, transparent 70%)`,
            borderRadius: "50%", pointerEvents: "none", zIndex: 0,
            animation: `float ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }} />
        ))}

        <div style={{ maxWidth: 900, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(230,81,0,0.15)", border: `1px solid ${COLORS.primary}44`,
            borderRadius: 30, padding: "6px 16px", marginBottom: 28,
            fontSize: 13, color: COLORS.primaryLight, fontWeight: 600,
          }}>
            <span>✨</span>
            Trusted by 50,000+ travelers across all Indian States & UTs
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900,
            lineHeight: 1.1, margin: "0 0 20px",
            color: COLORS.text, letterSpacing: "-2px",
            fontFamily: "'Outfit', sans-serif",
          }}>
            Explore India With<br />
            <span style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Trusted Local Guides
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: COLORS.textMuted, lineHeight: 1.7,
            maxWidth: 620, margin: "0 auto 40px",
          }}>
            Book verified experts in any Indian state for sacred temple tours, heritage fort walks, regional translations, local transport guidance, and authentic street food crawls.
          </p>

          {/* Dual Dropdown Search Bar */}
          <div style={{
            background: "rgba(17, 24, 39, 0.9)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24,
            padding: "12px 16px", display: "flex", gap: 16, maxWidth: 720,
            margin: "0 auto 32px", boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
            flexDirection: "row", alignItems: "center", flexWrap: "wrap",
          }}>
            {/* State Select */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 180, position: "relative" }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                style={{
                  background: "transparent", border: "none", color: COLORS.text,
                  width: "100%", outline: "none", cursor: "pointer", fontSize: 15,
                  fontFamily: "inherit", fontWeight: 500, paddingRight: 20,
                }}
              >
                <option value="all">🇮🇳 All States of India</option>
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Separator Line */}
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)", display: "block" }} />

            {/* Service Select */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 180 }}>
              <span style={{ fontSize: 20 }}>🧭</span>
              <select
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                style={{
                  background: "transparent", border: "none", color: COLORS.text,
                  width: "100%", outline: "none", cursor: "pointer", fontSize: 15,
                  fontFamily: "inherit", fontWeight: 500, paddingRight: 20,
                }}
              >
                <option value="all">✨ All Tour Services</option>
                {SERVICES.map(sv => (
                  <option key={sv.id} value={sv.id}>{sv.icon} {sv.label}</option>
                ))}
              </select>
            </div>

            {/* Find Button */}
            <Button variant="primary" style={{ padding: "12px 28px", borderRadius: 16 }} onClick={() => setCurrentPage("Guides")}>
              Find Local Guides →
            </Button>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="accent" size="lg" onClick={() => setCurrentPage("Guides")}>🗺️ Browse Indian Guides</Button>
            <Button variant="outline" size="lg" onClick={() => onLogin("guide")}>🌟 Become a Guide</Button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 40, justifyContent: "center", marginTop: 52,
            flexWrap: "wrap",
          }}>
            {[
              { value: "28", label: "States & UTs" },
              { value: "12K+", label: "Verified Guides" },
              { value: "4.9★", label: "Avg Rating" },
              { value: "50K+", label: "Happy Travelers" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primaryLight }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "80px 24px", background: COLORS.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: COLORS.text, marginBottom: 12, letterSpacing: "-1px" }}>
              Every Local Service You Need
            </h2>
            <p style={{ color: COLORS.textMuted, fontSize: 17 }}>Expert local navigation and companionship across India</p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}>
            {SERVICES.map(service => (
              <Card
                key={service.id}
                onClick={() => { setSelectedService(service.id); setCurrentPage("Guides"); }}
                style={{ padding: 24, textAlign: "center" }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: service.color + "22", border: `1px solid ${service.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, margin: "0 auto 14px",
                }}>
                  {service.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text, marginBottom: 6 }}>{service.label}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5 }}>{service.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section style={{ padding: "80px 24px", background: "#050B1A" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: COLORS.text, marginBottom: 12, letterSpacing: "-1px" }}>
              Popular Indian Destinations
            </h2>
            <p style={{ color: COLORS.textMuted, fontSize: 17 }}>World-class guides in the most iconic locations in India</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {DESTINATIONS.map(dest => (
              <Card key={dest.name} onClick={() => { setSelectedState(dest.name); setCurrentPage("Guides"); }} style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>{dest.image}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{dest.name}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 8 }}>{dest.country}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: COLORS.primaryLight, fontSize: 12, fontWeight: 600 }}>{dest.guides} guides</span>
                  <span style={{ color: "#F59E0B", fontSize: 12 }}>★ {dest.rating}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TOP GUIDES */}
      <section style={{ padding: "80px 24px", background: COLORS.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: COLORS.text, margin: "0 0 8px", letterSpacing: "-1px" }}>Top-Rated Local Guides</h2>
              <p style={{ color: COLORS.textMuted, fontSize: 17, margin: 0 }}>Handpicked experts with exceptional reviews in India</p>
            </div>
            <Button variant="outline" onClick={() => setCurrentPage("Guides")}>View All Guides →</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {guidesList.slice(0, 3).map(guide => (
              <GuideCard
                key={guide.id} guide={guide}
                onBook={onBook}
                onChat={onChat}
                onView={(g) => { setSelectedGuide(g); setCurrentPage("GuideProfile"); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 24px", background: "#050B1A" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: COLORS.text, marginBottom: 12, letterSpacing: "-1px" }}>How GuideConnect Works</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 17 }}>Connect with local experts in 4 simple steps</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.primary}44)`,
                  border: `2px solid ${COLORS.primary}44`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <span style={{ fontSize: 28 }}>{step.icon}</span>
                </div>
                <div style={{ color: COLORS.primaryLight, fontSize: 12, fontWeight: 700, letterSpacing: "2px", marginBottom: 8 }}>STEP {step.step}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.text, marginBottom: 10 }}>{step.title}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 24px", background: COLORS.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: COLORS.text, marginBottom: 12, letterSpacing: "-1px" }}>Traveler Stories</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <Card key={t.name} glow>
                <div style={{ fontSize: 32, color: COLORS.primary, marginBottom: 16, opacity: 0.5 }}>"</div>
                <p style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={t.avatar} size={42} bg={`linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`} />
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.text }}>{t.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{t.from} → {t.dest}</div>
                  </div>
                  <Stars rating={t.rating} size={12} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI BANNER */}
      <section style={{
        padding: "80px 24px",
        background: `linear-gradient(135deg, ${COLORS.primary}22 0%, ${COLORS.accent}22 100%)`,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🤖</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, marginBottom: 16, letterSpacing: "-1px" }}>
            Meet Your AI India Travel Concierge
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Powered by AI — get instant travel recommendations, cultural insights, Indian railway help, historical context, and personalized itinerary planning. Available 24/7.
          </p>
          <Button variant="primary" size="lg" onClick={() => setCurrentPage("AI")}>
            🧠 Chat with AI India Concierge →
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#050B1A", padding: "48px 24px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: COLORS.text, marginBottom: 16 }}>
                🧭 Guide<span style={{ color: COLORS.gold }}>Connect</span>
              </div>
              <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6 }}>
                Bridging local experts and curious travelers across every corner of India. Safe, transparent, and culturally immersive.
              </p>
            </div>
            <div>
              <h4 style={{ color: COLORS.text, margin: "0 0 16px", fontSize: 15 }}>Quick Links</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <span onClick={() => setCurrentPage("Home")} style={{ color: COLORS.textMuted, cursor: "pointer" }}>Home</span>
                <span onClick={() => setCurrentPage("Guides")} style={{ color: COLORS.textMuted, cursor: "pointer" }}>Find Guides</span>
                <span onClick={() => setCurrentPage("AI")} style={{ color: COLORS.textMuted, cursor: "pointer" }}>AI Concierge</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: COLORS.text, margin: "0 0 16px", fontSize: 15 }}>Popular States</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: COLORS.textMuted }}>
                <span>Rajasthan</span>
                <span>Uttar Pradesh</span>
                <span>Kerala</span>
                <span>Ladakh (UT)</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: COLORS.text, margin: "0 0 16px", fontSize: 15 }}>Contact & Safety</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: COLORS.textMuted }}>
                <span>📞 SOS Support: +91 11-2301-2301</span>
                <span>📧 support@guideconnect.in</span>
                <span>🛡️ 100% Verified Guides</span>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16, fontSize: 12, color: COLORS.textMuted,
          }}>
            <span>© 2026 GuideConnect India. All rights reserved.</span>
            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ cursor: "pointer" }}>Terms of Partnership</span>
              <span style={{ cursor: "pointer" }}>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// EXPLORE PAGE: PLACES Showcase
// ============================================================
function parseExploreQuery(query) {
  if (!query || !query.trim()) return { state: null, service: null, text: "" };
  
  const clean = query.toLowerCase().trim();
  
  let matchedState = null;
  for (const st of INDIAN_STATES) {
    const baseName = st.replace(/\s*\(UT\)\s*/i, "").toLowerCase();
    if (clean.includes(baseName)) {
      matchedState = st;
      break;
    }
  }
  
  if (!matchedState) {
    if (clean.includes("up")) matchedState = "Uttar Pradesh";
    else if (clean.includes("jk") || clean.includes("jammu")) matchedState = "Jammu & Kashmir (UT)";
    else if (clean.includes("delhi")) matchedState = "Delhi (UT)";
    else if (clean.includes("bengal")) matchedState = "West Bengal";
  }

  let matchedService = null;
  const serviceKeywords = {
    food: ["food", "eat", "culinary", "restaurant", "dhaba", "taste", "dish", "cuisine", "spice"],
    tourism: ["tourism", "travel", "sightseeing", "visit", "scenic", "nature", "orchard", "lake", "view", "boat"],
    culture: ["culture", "spiritual", "temple", "art", "prayer", "gopuram", "festival", "traditional"],
    heritage: ["heritage", "history", "monument", "fort", "palace", "mahal", "archaeology", "terminal", "unesco"],
    adventure: ["adventure", "trek", "sport", "surf", "ski", "parasail", "mountain", "ride", "lake", "hill"]
  };

  for (const [srv, keywords] of Object.entries(serviceKeywords)) {
    for (const kw of keywords) {
      if (clean.includes(kw)) {
        matchedService = srv;
        break;
      }
    }
    if (matchedService) break;
  }

  let remainingText = clean;
  if (matchedState) {
    const baseName = matchedState.replace(/\s*\(UT\)\s*/i, "").toLowerCase();
    remainingText = remainingText.replace(baseName, "");
    remainingText = remainingText.replace("in", "");
  }
  if (matchedService) {
    remainingText = remainingText.replace(matchedService, "");
  }
  remainingText = remainingText.trim();

  return {
    state: matchedState,
    service: matchedService,
    text: remainingText
  };
}

function ExplorePage({ setCurrentPage, setSelectedState, setSelectedService }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const serviceCategories = [
    { id: "all", label: "✨ All", color: COLORS.gold },
    { id: "tourism", label: "🌴 Tourism", color: "#10B981" },
    { id: "food", label: "🍜 Food", color: COLORS.primaryLight },
    { id: "heritage", label: "🏰 Heritage", color: COLORS.primary },
    { id: "culture", label: "🛕 Culture", color: COLORS.accentLight },
    { id: "adventure", label: "🏔️ Adventure", color: "#06B6D4" }
  ];

  const serviceIcons = {
    tourism: "🌴",
    food: "🍜",
    culture: "🛕",
    heritage: "🏰",
    adventure: "🏔️"
  };

  const serviceColors = {
    tourism: "#10B981",
    food: COLORS.primaryLight,
    culture: COLORS.accentLight,
    heritage: COLORS.primary,
    adventure: "#06B6D4"
  };

  // Perform search query and category filtering
  const parsedQuery = parseExploreQuery(searchQuery);
  
  const filteredPlaces = EXPLORE_PLACES.filter(place => {
    // Tab category filter
    if (activeCategory !== "all" && place.service !== activeCategory) {
      return false;
    }

    // Dynamic state parsing
    if (parsedQuery.state) {
      const pState = place.state.toLowerCase();
      const qState = parsedQuery.state.toLowerCase();
      const cleanPState = pState.replace(/\s*\(ut\)\s*/g, "");
      const cleanQState = qState.replace(/\s*\(ut\)\s*/g, "");
      if (!cleanPState.includes(cleanQState) && !cleanQState.includes(cleanPState)) {
        return false;
      }
    }

    // Dynamic service parsing
    if (parsedQuery.service && place.service !== parsedQuery.service) {
      return false;
    }

    // Remaining text search match
    if (parsedQuery.text) {
      const nameMatch = place.name.toLowerCase().includes(parsedQuery.text);
      const descMatch = place.description.toLowerCase().includes(parsedQuery.text);
      const stateMatch = place.state.toLowerCase().includes(parsedQuery.text);
      if (!nameMatch && !descMatch && !stateMatch) {
        return false;
      }
    }

    return true;
  });

  const handleFindGuides = (stateName, serviceType) => {
    setSelectedState(stateName);
    const serviceMapping = {
      heritage: "heritage",
      culture: "spiritual",
      food: "food",
      tourism: "heritage",
      adventure: "transit"
    };
    setSelectedService(serviceMapping[serviceType] || "all");
    setCurrentPage("Guides");
  };

  return (
    <div style={{ padding: "100px 24px 60px", minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "slideUp 0.6s ease-out" }}>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: COLORS.text, marginBottom: 12 }}>
            Explore Iconic <span style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Destinations</span>
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 16, maxWidth: 600, margin: "0 auto 30px" }}>
            Discover famous monuments, street food lanes, sacred sites, and wilderness adventures across all Indian states.
          </p>

          {/* Search Box */}
          <div style={{
            maxWidth: 600, margin: "0 auto 16px", background: "rgba(255,255,255,0.03)",
            border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 16, padding: 6,
            display: "flex", alignItems: "center", gap: 10, transition: "border 0.3s",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <span style={{ fontSize: 20, marginLeft: 14 }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search e.g. 'Food in Punjab', 'Tourism in Kerala', 'Taj Mahal'..."
              style={{
                flex: 1, background: "transparent", border: "none", color: COLORS.text,
                fontSize: 15, outline: "none", padding: "10px 4px", fontFamily: "inherit"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, marginRight: 10 }}
              >✕</button>
            )}
          </div>

          {/* Example Search Hints */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
            <span>💡 Try searching:</span>
            <button onClick={() => setSearchQuery("Food in Punjab")} style={{ background: "none", border: "none", color: COLORS.primaryLight, cursor: "pointer", textDecoration: "underline", fontSize: 12, padding: 0 }}>Food in Punjab</button>
            <span>•</span>
            <button onClick={() => setSearchQuery("Tourism in Kerala")} style={{ background: "none", border: "none", color: COLORS.primaryLight, cursor: "pointer", textDecoration: "underline", fontSize: 12, padding: 0 }}>Tourism in Kerala</button>
            <span>•</span>
            <button onClick={() => setSearchQuery("Heritage in Uttar Pradesh")} style={{ background: "none", border: "none", color: COLORS.primaryLight, cursor: "pointer", textDecoration: "underline", fontSize: 12, padding: 0 }}>Heritage in Uttar Pradesh</button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {serviceCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)` : "rgba(255,255,255,0.05)",
                border: activeCategory === cat.id ? "none" : "1px solid rgba(255,255,255,0.08)",
                color: cat.id === activeCategory ? "#fff" : COLORS.textMuted,
                borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Places Showcase Grid */}
        {filteredPlaces.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, animation: "slideUp 0.6s ease-out" }}>
            {filteredPlaces.map(place => (
              <div
                key={place.id}
                style={{
                  background: COLORS.darkCard, border: `1px solid ${COLORS.darkBorder}`,
                  borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
                  transition: "transform 0.3s, border-color 0.3s", cursor: "default",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = COLORS.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = COLORS.darkBorder;
                }}
              >
                {/* Photo Header */}
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                  <img
                    src={place.image}
                    alt={place.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  />
                  {/* Category Badge */}
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    background: serviceColors[place.service] || COLORS.primary,
                    color: "#fff", padding: "4px 10px", borderRadius: 8,
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px"
                  }}>
                    {serviceIcons[place.service]} {place.service}
                  </span>
                  {/* State Badge */}
                  <span style={{
                    position: "absolute", top: 12, right: 12,
                    background: "rgba(10,15,30,0.85)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: COLORS.text, padding: "4px 10px", borderRadius: 8,
                    fontSize: 11, fontWeight: 600
                  }}>
                    📍 {place.state}
                  </span>
                </div>

                {/* Content Details */}
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ color: COLORS.text, fontSize: 18, fontWeight: 700, margin: "0 0 10px 0" }}>{place.name}</h3>
                  <p style={{ color: COLORS.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: "0 0 20px 0", flex: 1 }}>{place.description}</p>
                  
                  {/* Nearby Guides Link */}
                  <button
                    onClick={() => handleFindGuides(place.state, place.service)}
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 12,
                      background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
                      border: "none", color: "#fff", fontSize: 13.5, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s, opacity 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.95"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    🌟 Find Local Guides in {place.state}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: COLORS.darkCard, borderRadius: 20, border: `1px solid ${COLORS.darkBorder}` }}>
            <span style={{ fontSize: 44, display: "block", marginBottom: 16 }}>🗺️</span>
            <h3 style={{ color: COLORS.text, fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>No destinations found</h3>
            <p style={{ color: COLORS.textMuted, fontSize: 14, maxWidth: 400, margin: "0 auto" }}>
              We couldn't match any famous places for "{searchQuery}". Try modifying your state or category keyword.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================
// GUIDES SEARCH AND DISCOVERY PAGE
// ============================================================
function GuidesPage({ setCurrentPage, setSelectedGuide, onBook, onChat, guidesList, selectedState, setSelectedState, selectedService, setSelectedService }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const filtered = guidesList.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase()) ||
      (g.state && g.state.toLowerCase().includes(search.toLowerCase())) ||
      g.languages.some(l => l.toLowerCase().includes(search.toLowerCase()));
    const matchState = selectedState === "all" || (g.state && g.state === selectedState);
    const matchService = selectedService === "all" || g.services.includes(selectedService);
    return matchSearch && matchState && matchService;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviews - a.reviews;
    if (sortBy === "price_asc") return a.price - b.price;
    return 0;
  });

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, marginBottom: 8, letterSpacing: "-1px" }}>
          Find Your Perfect Guide
        </h1>
        <p style={{ color: COLORS.textMuted, marginBottom: 32 }}>Browse {guidesList.length} verified local experts</p>

        {/* Filters */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center",
          background: "rgba(17,24,39,0.8)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16,
        }}>
          <Input
            placeholder="Search by name, city, language..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="🔍"
            style={{ minWidth: 200, flex: 1.5 }}
          />
          {/* State selector dropdown */}
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: COLORS.text, padding: "12px 16px", fontSize: 14,
              cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 160,
            }}
          >
            <option value="all">📍 All States of India</option>
            {INDIAN_STATES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          {/* Service selector dropdown */}
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: COLORS.text, padding: "12px 16px", fontSize: 14,
              cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 160,
            }}
          >
            <option value="all">🧭 All Tour Services</option>
            {SERVICES.map(sv => (
              <option key={sv.id} value={sv.id}>{sv.icon} {sv.label}</option>
            ))}
          </select>
          {/* Sorter selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: COLORS.text, padding: "12px 16px", fontSize: 14,
              cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 160,
            }}
          >
            <option value="rating">Sort: Top Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="price_asc">Sort: Price Low-High</option>
          </select>
        </div>

        {/* Results grid */}
        {filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {filtered.map(guide => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onBook={onBook}
                onChat={onChat}
                onView={(g) => { setSelectedGuide(g); setCurrentPage("GuideProfile"); }}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏜️</div>
            <h3 style={{ fontSize: 22, color: COLORS.text, margin: "0 0 8px" }}>No Local Guides Found</h3>
            <p style={{ color: COLORS.textMuted, margin: 0 }}>Try clearing your filters or choosing another state/service category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INDIVIDUAL GUIDE DETAIL PROFILE PAGE
// ============================================================
function GuideProfilePage({ guide, onBook, onChat, onBack }) {
  if (!guide) return null;
  const serviceIcons = { heritage: "🏰", spiritual: "🛕", food: "🍜", languages: "🗣️", stays: "🏨", transit: "🛺", shopping: "🛍️", emergency: "🆘" };
  const serviceMap = { heritage: "Fort & Palace Walks", spiritual: "Sacred & Temple Tours", food: "Bazaar & Street Food Crawls", languages: "Dialect Interpretation", stays: "Ashram & Heritage Stays", transit: "Auto & Rickshaw Navigation", shopping: "Handicrafts & Bazaars", emergency: "24/7 Safety SOS Coordinator" };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.primaryLight, cursor: "pointer", fontSize: 15, fontWeight: 600, padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          ← Back to Guides
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 32, alignItems: "start" }}>
          {/* Main profile card details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card style={{ padding: 32 }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
                <Avatar initials={guide.avatar} size={88} bg={`linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`} />
                <div>
                  <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: COLORS.text }}>
                    {guide.name} {guide.verified && "✅"}
                  </h1>
                  <p style={{ margin: "0 0 10px", color: COLORS.textMuted, fontSize: 15 }}>📍 {guide.city}, {guide.state}, India</p>
                  <Badge label={guide.badge} color={COLORS.primaryLight} />
                </div>
              </div>

              <h3 style={{ color: COLORS.text, fontSize: 18, margin: "0 0 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10 }}>About Me</h3>
              <p style={{ color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8, margin: "0 0 24px" }}>
                {guide.bio}
              </p>

              <h3 style={{ color: COLORS.text, fontSize: 18, margin: "0 0 12px" }}>Languages Spoken</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {guide.languages.map(l => <Tag key={l} label={l} />)}
              </div>

              <h3 style={{ color: COLORS.text, fontSize: 18, margin: "0 0 12px" }}>Services Offered</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {guide.services.map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 24 }}>{serviceIcons[s]}</span>
                    <div>
                      <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>{serviceMap[s]}</div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Custom experiences mapped directly to your cultural goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick booking card details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card style={{ padding: 32, border: `1px solid ${COLORS.primary}44` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Hourly Rate</span>
                <div>
                  <span style={{ color: COLORS.primaryLight, fontSize: 26, fontWeight: 900 }}>{formatPrice(guide.price, guide.currency)}</span>
                  <span style={{ color: COLORS.textMuted, fontSize: 12 }}> / hour</span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>Availability</span>
                  <span style={{ color: guide.available ? COLORS.success : COLORS.danger, fontWeight: 700, fontSize: 13 }}>
                    ● {guide.available ? "Online & Ready" : "Offline"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>Experience</span>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 13 }}>{guide.experience} Years</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>Completed Bookings</span>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 13 }}>{guide.bookings}+ trips</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={() => onBook(guide)}>
                  ⚡ Book Instant Tour
                </Button>
                <Button variant="ghost" size="lg" style={{ width: "100%" }} onClick={() => onChat(guide)}>
                  💬 Chat with {guide.name.split(" ")[0]}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: 24, textAlign: "center" }}>
              <span style={{ fontSize: 28 }}>🛡️</span>
              <h4 style={{ color: COLORS.text, margin: "8px 0 4px", fontSize: 14 }}>GuideConnect Trust Guarantee</h4>
              <p style={{ color: COLORS.textMuted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                Every guide undergoes identity verification, local dialect tests, and strict background checks to ensure safe and authentic experiences.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAT COMPONENT (FULLY REAL-TIME WITH WEBSOCKET)
// ============================================================
function ChatPage({ guide, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // 1. Fetch previous message history
    socket.emit("get_messages", { guideId: guide.id, touristEmail: user.email });

    // 2. Event Listeners
    const handleHistory = (history) => {
      setMessages(history);
    };

    const handleReceive = (newMsg) => {
      if (Number(newMsg.guideId) === Number(guide.id) && newMsg.touristEmail === user.email) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    const handleTyping = ({ guideId, touristEmail, sender, isTyping }) => {
      if (Number(guideId) === Number(guide.id) && touristEmail === user.email) {
        const isOther = user.role === "tourist" ? sender === "guide" : sender === "user";
        if (isOther) {
          setTyping(isTyping);
        }
      }
    };

    socket.on("messages_history", handleHistory);
    socket.on("receive_message", handleReceive);
    socket.on("typing_indicator", handleTyping);

    return () => {
      socket.off("messages_history", handleHistory);
      socket.off("receive_message", handleReceive);
      socket.off("typing_indicator", handleTyping);
    };
  }, [guide, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleTextChange = (e) => {
    setInput(e.target.value);

    // Emit typing status
    socket.emit("typing", {
      guideId: guide.id,
      touristEmail: user.email,
      sender: user.role === "tourist" ? "user" : "guide",
      isTyping: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        guideId: guide.id,
        touristEmail: user.email,
        sender: user.role === "tourist" ? "user" : "guide",
        isTyping: false
      });
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      sender: user.role === "tourist" ? "user" : "guide",
      text: input.trim(),
      guideId: guide.id,
      touristEmail: user.email
    };

    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 32 }}>
      <div style={{ maxWidth: 800, width: "100%", height: "78vh", padding: "0 24px", display: "flex", flexDirection: "column" }}>
        {/* Chat Header */}
        <Card style={{ padding: "16px 24px", borderRadius: "20px 20px 0 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14, background: "rgba(17,24,39,0.9)" }}>
          <Avatar initials={guide.avatar} size={42} bg={COLORS.primary} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: COLORS.text }}>{guide.name}</div>
            <div style={{ fontSize: 12, color: COLORS.success }}>● Online Guide</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close Chat</Button>
        </Card>

        {/* Chat Body messages */}
        <div style={{ flex: 1, background: "rgba(10,15,30,0.4)", borderLeft: "1px solid rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length > 0 ? (
            messages.map((m) => {
              const isSelf = user.role === "tourist" ? m.sender === "user" : m.sender === "guide";
              return (
                <div key={m.id} style={{ alignSelf: isSelf ? "flex-end" : "flex-start", maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isSelf ? "flex-end" : "flex-start" }}>
                  <div style={{ background: isSelf ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` : "rgba(255,255,255,0.07)", border: isSelf ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: isSelf ? "16px 16px 0 16px" : "16px 16px 16px 0", padding: "12px 18px", color: COLORS.text, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
                    {m.text}
                  </div>
                  <span style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{m.time}</span>
                </div>
              );
            })
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: COLORS.textMuted, gap: 10 }}>
              <span style={{ fontSize: 32 }}>💬</span>
              <div style={{ fontSize: 14 }}>No messages yet. Send a greeting to start your tour co-ordination!</div>
            </div>
          )}

          {typing && (
            <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.textMuted, animation: "bounce 1.4s infinite ease-in-out both" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.textMuted, animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.textMuted, animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel */}
        <div style={{ display: "flex", gap: 10, background: "rgba(17,24,39,0.9)", padding: 16, borderRadius: "0 0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            placeholder="Type your message here..."
            value={input}
            onChange={handleTextChange}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            style={{ flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={sendMessage}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 16 }}
          >➤</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AI TRAVEL ASSISTANT PAGE (INDIA TRAVEL CONCIERGE)
// ============================================================
function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! I'm your AI India Travel Concierge. I specialize exclusively in travel, culture, and guide matching within India.\n\nI can help you with:\n\n• **Indian States Travel Tips** and offbeat itinerary planning\n• **Cultural insights** (temple dress code, regional customs)\n• **Regional language help** & basic phrases (Hindi, Tamil, Bengali, etc.)\n• **Railway & Local transit advice** (IRCTC booking tips, Tatkal, auto/metro pricing)\n• **Street Food safety & hygiene** and popular bazaar crawls\n• **Safety tips** and emergency coordinator matching\n\nWhich Indian state are you planning to travel to? 🇮🇳",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const systemPrompt = `You are the AI India Travel Concierge for GuideConnect, a premium local guide booking platform in India.
Your mission is to help travelers plan their journey, understand local culture, transit, safety, and street food across all 28 states and Union Territories of India.

Here is the context of our platform:
- We have verified local guides in major states:
  * Priya Sharma (Jaipur, Rajasthan) - Forts, shopping, food (₹600/hr)
  * Amit Mishra (Varanasi, Uttar Pradesh) - Spiritual, temple, food (₹500/hr)
  * Rajesh Pillai (Kochi, Kerala) - ashrams, transits, street food (₹700/hr)
  * Ananya Sen (Kolkata, West Bengal) - history, literature, food walks (₹800/hr)
  * Rigzin Namgyal (Leh, Ladakh) - mountain transit, eco-stays (₹900/hr)
  * Vikram Rathore (Agra, Uttar Pradesh) - Taj Mahal walks, languages, shopping (₹650/hr)
  * Devendra Joshi (Mumbai, Maharashtra) - local train navigation, food, translation (₹750/hr)
  * Soundarya Rajan (Chennai, Tamil Nadu) - Dravidian temples, languages, filter coffee crawls (₹700/hr)

- When matching guides, encourage travelers to book these guides.
- Limit your answers exclusively to travel in India. If the user asks about international destinations, politely remind them you specialize in India and suggest beautiful Indian alternatives.
- Keep your tone warm, helpful, welcoming ("Namaste!"), and write clean markdown with bullet points and bold headers. Keep answers concise, highly informative, and easy to read.`;

      // Build messages array for the backend proxy
      const openAiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        { role: "user", content: userMsg }
      ];

      // Call our backend proxy (avoids CORS — key stays server-side)
      const response = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: openAiMessages })
      });

      if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

      const data = await response.json();
      const replyText = data.reply || "Namaste! I had a slight trouble processing that. Please try again.";

      setMessages(prev => [...prev, { role: "assistant", content: replyText }]);
      setLoading(false);
      return;
    } catch (err) {
      console.error("OpenAI API Error, falling back to offline mode:", err);
    }

    // OFFLINE MOCK FALLBACK
    await sleep(1500);

    let reply = "That is a beautiful destination! I'd highly suggest checking out the local heritage sights. If you need dedicated insights, booking one of our **Live Local Guides** in that state will give you an unparalleled personal experience.";
    
    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes("bangkok") || lowerMsg.includes("thai") || lowerMsg.includes("kyoto") || lowerMsg.includes("japan") || lowerMsg.includes("cairo") || lowerMsg.includes("rome") || lowerMsg.includes("italy")) {
      reply = "Namaste! I specialize exclusively in travel within India. Let me know if you would like recommendations for beautiful Indian locations like Rajasthan, Varanasi, Kerala, or Ladakh instead!";
    } else if (lowerMsg.includes("rajasthan") || lowerMsg.includes("jaipur") || lowerMsg.includes("jodhpur")) {
      reply = "🏯 **Jaipur & Rajasthan Palace Highlights!**\n- **Palaces**: The Amber Fort, City Palace, and Hawa Mahal are architectural masterpieces.\n- **Shopping**: Blue pottery, block prints in Sanganer, jewelry in Johri Bazaar.\n- **Heritage Guide**: **Priya Sharma** is our top guide in Jaipur!";
    } else if (lowerMsg.includes("varanasi") || lowerMsg.includes("kashi") || lowerMsg.includes("ganges")) {
      reply = "🛕 **Varanasi Spiritual Walk!**\n- **Ghats**: Dashashwamedh Ghat Ganga Aarti is beautiful. Private morning boat ride at 5:30 AM.\n- **Etiquette**: Dress conservatively, no leather near shrines.\n- **Scholar Guide**: **Amit Mishra** offers deep spiritual walks.";
    } else if (lowerMsg.includes("train") || lowerMsg.includes("railway") || lowerMsg.includes("irctc") || lowerMsg.includes("tatkal")) {
      reply = "🛺 **Indian Railways & Tatkal Tips!**\n- **Tatkal** opens 10:00 AM (AC) and 11:00 AM (non-AC). Book instantly as slots fill in minutes.\n- Pre-add traveler profiles in IRCTC to autocomplete forms.\n- **Rigzin Namgyal** and **Rajesh Pillai** help navigate regional station logistics.";
    } else if (lowerMsg.includes("street food") || lowerMsg.includes("hygiene") || lowerMsg.includes("eat")) {
      reply = "🍜 **Street Food & Hygiene Tips!**\n- Eat where locals crowd—high turnover means fresh food.\n- Avoid ice cubes and uncooked salads; buy sealed water bottles.\n- **Ananya Sen** (Kolkata) and **Devendra Joshi** (Mumbai) lead safe culinary bazaar walks.";
    } else if (lowerMsg.includes("state") || lowerMsg.includes("list") || lowerMsg.includes("where")) {
      reply = "🗺️ **GuideConnect covers all 28 States & major UTs!**\nRajasthan, UP, West Bengal, Kerala, Ladakh, Tamil Nadu, Maharashtra, Goa, and more.\nPick a State and Service on the Explore page to find verified local guides nearby!";
    }

    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const formatMessage = (text) => {
    if (!text) return "";
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: COLORS.text, fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 32 }}>
      <div style={{ maxWidth: 800, width: "100%", height: "78vh", padding: "0 24px", display: "flex", flexDirection: "column" }}>
        
        {/* Assistant Header */}
        <Card style={{ padding: "16px 24px", borderRadius: "20px 20px 0 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14, background: "rgba(17,24,39,0.9)" }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
              AI India Travel Concierge
              <span style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 6, fontWeight: 700,
                background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)"
              }}>
                ● Live AI Active
              </span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.primaryLight }}>Guided Insights exclusively for India 🇮🇳</div>
          </div>
        </Card>

        {/* Assistant Body messages */}
        <div style={{ flex: 1, background: "rgba(10,15,30,0.4)", borderLeft: "1px solid rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m, i) => {
            const isSelf = m.role === "user";
            return (
              <div key={i} style={{ alignSelf: isSelf ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: isSelf ? "flex-end" : "flex-start" }}>
                <div style={{ background: isSelf ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})` : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: isSelf ? "16px 16px 0 16px" : "16px 16px 16px 0", padding: "14px 20px", color: COLORS.text, fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {formatMessage(m.content)}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 6 }}>
              <Spinner />
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>Drafting local itinerary advice...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel */}
        <div style={{ display: "flex", gap: 10, background: "rgba(17,24,39,0.9)", padding: 16, borderRadius: "0 0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            placeholder="Ask about Tatkal train rules, temple dress codes, street food safe zones, etc..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={loading}
            style={{ flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, border: "none", borderRadius: 12, padding: "12px 18px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: 16 }}
          >{loading ? <Spinner /> : "➤"}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TOURIST DASHBOARD
// ============================================================
function TouristDashboard({ user, onBook, bookings, onChat }) {
  const [activeTab, setActiveTab] = useState("overview");
  const statusColors = { pending: COLORS.warning, upcoming: COLORS.primary, confirmed: COLORS.success, completed: COLORS.success, declined: COLORS.danger, cancelled: COLORS.danger };
  const tabs = ["overview", "bookings", "saved"];

  const serviceMap = { heritage: "Fort & Palace Walks", spiritual: "Sacred & Temple Tours", food: "Bazaar & Street Food Crawls", languages: "Dialect Interpretation", stays: "Ashram & Heritage Stays", transit: "Auto & Rickshaw Navigation", shopping: "Handicrafts & Bazaars", emergency: "24/7 Safety SOS Coordinator" };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <Avatar initials={user.name.split(" ").map(n => n[0]).join("")} size={60} bg={`linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`} />
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.text }}>Welcome back, {user.name.split(" ")[0]}! 👋</h1>
            <p style={{ margin: 0, color: COLORS.textMuted }}>Manage your trips and bookings in India</p>
          </div>
          <Button variant="accent" onClick={() => onBook(null)} style={{ marginLeft: "auto" }}>+ New Booking</Button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Trips", value: bookings.length.toString(), icon: "✈️", color: COLORS.primary },
            { label: "Pending Requests", value: bookings.filter(b => b.status === "pending").length.toString(), icon: "⏳", color: COLORS.warning },
            { label: "Confirmed Tours", value: bookings.filter(b => b.status === "confirmed" || b.status === "upcoming").length.toString(), icon: "📅", color: COLORS.success },
            { label: "Currency", value: "INR (₹)", icon: "💰", color: COLORS.gold },
          ].map(stat => (
            <Card key={stat.label} style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 8 }}>{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 24, marginBottom: 24 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: "none", border: "none", color: activeTab === t ? COLORS.primaryLight : COLORS.textMuted,
                borderBottom: activeTab === t ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                padding: "8px 12px 14px", cursor: "pointer", fontSize: 15, fontWeight: 600,
                textTransform: "capitalize", fontFamily: "inherit",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Recent Bookings</h3>
              {bookings.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {bookings.slice(0, 3).map(b => {
                    const guideObj = GUIDES_DATA.find(g => g.id === Number(b.guideId)) || { name: b.guide || "Local Guide", avatar: "GC" };
                    return (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <Avatar initials={guideObj.avatar} size={42} bg={COLORS.accent} />
                          <div>
                            <div style={{ fontWeight: 600, color: COLORS.text }}>{guideObj.name}</div>
                            <div style={{ fontSize: 12, color: COLORS.textMuted }}>📍 {b.city || "Local Hub"} • {b.date}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: COLORS.primaryLight }}>{formatPrice(b.price, b.currency || "₹")}</div>
                          <span style={{ fontSize: 11, background: statusColors[b.status] + "22", color: statusColors[b.status], padding: "3px 8px", borderRadius: 10, fontWeight: 600, border: `1px solid ${statusColors[b.status]}44` }}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textMuted }}>No bookings found. Start booking!</div>
              )}
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Active Co-ordination</h3>
              <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Once your guide confirms, click Chat to co-ordinate your meeting location, pick timing, or discuss Tatkal railway queues.
              </p>
              {bookings.filter(b => b.status === "confirmed").length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {bookings.filter(b => b.status === "confirmed").map(b => {
                    const guideObj = GUIDES_DATA.find(g => g.id === Number(b.guideId)) || { name: "Guide", avatar: "GC" };
                    return (
                      <Button key={b.id} variant="ghost" onClick={() => onChat(guideObj)} style={{ width: "100%", justifyContent: "flex-start", gap: 10 }}>
                        💬 Chat with {guideObj.name.split(" ")[0]}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>No active confirmed guide chats yet.</div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "bookings" && (
          <Card style={{ padding: 24 }}>
            <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>All Trip Bookings</h3>
            {bookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {bookings.map(b => {
                  const guideObj = GUIDES_DATA.find(g => g.id === Number(b.guideId)) || { name: b.guide || "Local Guide", avatar: "GC" };
                  return (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, flexWrap: "wrap", gap: 16 }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <Avatar initials={guideObj.avatar} size={48} bg={COLORS.accent} />
                        <div>
                          <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 16 }}>{guideObj.name}</div>
                          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
                            📅 {b.date} at {b.time} • ⏳ {b.duration || 2} hours
                          </div>
                          <div style={{ fontSize: 13, color: COLORS.primaryLight, marginTop: 2 }}>
                            💼 Service: {serviceMap[b.service] || b.service}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div>
                          <span style={{ fontWeight: 800, color: COLORS.text, fontSize: 16, marginRight: 8 }}>{formatPrice(b.price, b.currency || "₹")}</span>
                          <span style={{ fontSize: 11, background: statusColors[b.status] + "22", color: statusColors[b.status], padding: "4px 10px", borderRadius: 20, fontWeight: 700, border: `1px solid ${statusColors[b.status]}44` }}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button variant="ghost" size="sm" onClick={() => onChat(guideObj)}>💬 Chat</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textMuted }}>No trip bookings listed.</div>
            )}
          </Card>
        )}

        {activeTab === "saved" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {GUIDES_DATA.slice(0, 3).map(guide => (
              <GuideCard key={guide.id} guide={guide} onBook={onBook} onChat={onChat} onView={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GUIDE DASHBOARD (REAL-TIME NOTIFICATIONS & ACTIONS)
// ============================================================
function GuideDashboard({ user, bookings, onChat }) {
  const [activeTab, setAvailableTab] = useState("overview");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    socket.emit("toggle_availability", { guideId: user.guideId, available: true });
  }, [user]);

  const handleToggle = () => {
    const nextAvail = !available;
    setAvailable(nextAvail);
    socket.emit("toggle_availability", { guideId: user.guideId, available: nextAvail });
  };

  const handleAction = (bookingId, action) => {
    const status = action === "accept" ? "confirmed" : "declined";
    socket.emit("update_booking_status", { bookingId, status });
  };

  const serviceMap = { heritage: "Fort & Palace Walks", spiritual: "Sacred & Temple Tours", food: "Bazaar & Street Food", languages: "Regional Translation", stays: "Ashrams & Heritage Stays", transit: "Auto & Rickshaw Transit", shopping: "Bazaars & Crafts", emergency: "24/7 Safety SOS" };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Avatar initials={user.name.split(" ").map(n => n[0]).join("")} size={60} bg={`linear-gradient(135deg, ${COLORS.accent}, #E55A2B)`} />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.text }}>Guide Dashboard 🌟</h1>
            <p style={{ margin: 0, color: COLORS.textMuted }}>Manage live booking requests and chat in real-time as <strong>{user.name}</strong></p>
          </div>
          <div>
            <Button variant={available ? "success" : "ghost"} onClick={handleToggle} style={{ borderRadius: 20 }}>
              {available ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </Button>
          </div>
        </div>

        {/* Guide Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Bookings Received", value: bookings.length.toString(), icon: "📈", color: COLORS.primaryLight },
            { label: "Active Jobs", value: bookings.filter(b => b.status === "confirmed" || b.status === "upcoming").length.toString(), icon: "💼", color: COLORS.success },
            { label: "Pending Inquiries", value: bookings.filter(b => b.status === "pending").length.toString(), icon: "🔔", color: COLORS.warning },
            { label: "Total Earnings (INR)", value: formatPrice(bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + Number(b.price || 0), 0), "₹"), icon: "💰", color: COLORS.gold },
          ].map(stat => (
            <Card key={stat.label} style={{ padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 8 }}>{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tab selection */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 24, marginBottom: 24 }}>
          {["overview", "bookings"].map(t => (
            <button
              key={t}
              onClick={() => setAvailableTab(t)}
              style={{
                background: "none", border: "none", color: activeTab === t ? COLORS.primaryLight : COLORS.textMuted,
                borderBottom: activeTab === t ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                padding: "8px 12px 14px", cursor: "pointer", fontSize: 15, fontWeight: 600,
                textTransform: "capitalize", fontFamily: "inherit",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Action Required: Pending Requests</h3>
              {bookings.filter(b => b.status === "pending").length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {bookings.filter(b => b.status === "pending").map(b => (
                    <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 16 }}>{b.touristName}</div>
                          <div style={{ color: COLORS.textMuted, fontSize: 12 }}>📧 {b.touristEmail} • City: {b.city}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: COLORS.primaryLight, fontSize: 18 }}>{formatPrice(b.price, b.currency || "₹")}</div>
                      </div>
                      <div style={{ fontSize: 13.5, color: COLORS.textMuted }}>
                        📅 Date: <strong>{b.date}</strong> at <strong>{b.time}</strong> • Service: <strong>{serviceMap[b.service] || b.service}</strong>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignSelf: "flex-end" }}>
                        <Button variant="danger" size="sm" onClick={() => handleAction(b.id, "decline")}>Decline</Button>
                        <Button variant="success" size="sm" onClick={() => handleAction(b.id, "accept")}>Accept & Confirm</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.textMuted }}>
                  🟢 All caught up! No pending booking requests at the moment.
                </div>
              )}
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Live Chat Clients</h3>
              <p style={{ color: COLORS.textMuted, fontSize: 12.5, lineHeight: 1.5, marginBottom: 20 }}>
                Once you accept requests, travelers will message you here. You can clarify bazaar timing, meeting spots, or transport.
              </p>
              {bookings.filter(b => b.status === "confirmed").length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {bookings.filter(b => b.status === "confirmed").map(b => (
                    <Button key={b.id} variant="ghost" onClick={() => onChat({ name: b.touristName, avatar: b.touristName.split(" ").map(n => n[0]).join(""), id: b.guideId })} style={{ width: "100%", justifyContent: "flex-start", gap: 10 }}>
                      💬 Chat with {b.touristName.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>No active chats listed.</div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "bookings" && (
          <Card style={{ padding: 24 }}>
            <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>All Historical Bookings</h3>
            {bookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: COLORS.text }}>{b.touristName}</div>
                      <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>Date: {b.date} at {b.time} • Service: {serviceMap[b.service] || b.service}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontWeight: 800, color: COLORS.primaryLight }}>{formatPrice(b.price, b.currency || "₹")}</span>
                      <span style={{ fontSize: 11, background: (b.status === "confirmed" ? COLORS.success : b.status === "pending" ? COLORS.warning : COLORS.danger) + "22", color: (b.status === "confirmed" ? COLORS.success : b.status === "pending" ? COLORS.warning : COLORS.danger), padding: "4px 8px", borderRadius: 10, fontWeight: 700 }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: COLORS.textMuted }}>No bookings recorded yet.</div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ bookings }) {
  const serviceMap = { heritage: "Palace Walks", spiritual: "Temple Tours", food: "Street Food", languages: "Dialect Help", stays: "Ashram Help", transit: "Transit Help", shopping: "Shopping Help", emergency: "Safety SOS" };

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: COLORS.dark }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ color: COLORS.text, fontSize: 32, fontWeight: 800, marginBottom: 8 }}>System Admin Dashboard ⚡</h1>
        <p style={{ color: COLORS.textMuted, marginBottom: 32 }}>Monitor bookings, system health, and registered local guides in India</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
          {/* Health Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>System Health</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted }}>Server Status</span>
                  <span style={{ color: COLORS.success, fontWeight: 700 }}>🟢 ONLINE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted }}>WebSockets</span>
                  <span style={{ color: COLORS.success, fontWeight: 700 }}>ACTIVE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted }}>Connected Sockets</span>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>14</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted }}>Total Database Guides</span>
                  <span style={{ color: COLORS.primaryLight, fontWeight: 700 }}>{GUIDES_DATA.length}</span>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 16 }}>Services Popularity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SERVICES.map(s => {
                  const count = bookings.filter(b => b.service === s.id).length;
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: COLORS.textMuted }}>{s.icon} {s.label}</span>
                      <span style={{ background: COLORS.accent + "33", color: COLORS.accentLight, padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{count} bookings</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Bookings Tracker */}
          <Card style={{ padding: 24 }}>
            <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Real-Time Bookings Log</h3>
            {bookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: 14, borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13.5 }}>ID: {b.id} • {b.touristName}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                        Guide ID: {b.guideId} • Service: {serviceMap[b.service] || b.service} • City: {b.city || "Local"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: COLORS.primaryLight, fontWeight: 700, fontSize: 13.5 }}>{formatPrice(b.price, b.currency || "₹")}</div>
                      <span style={{ fontSize: 10, color: b.status === "confirmed" ? COLORS.success : b.status === "pending" ? COLORS.warning : COLORS.danger, fontWeight: 700 }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textMuted }}>No system bookings stowed.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL: AUTH / SIGNUP & LOGIN WITH CUSTOM FIELDS
// ============================================================
function LoginModal({ open, onClose, onLogin, defaultRole, defaultMode = "login", onRegisterGuide }) {
  const [mode, setMode] = useState(defaultMode);
  const [role, setRole] = useState(defaultRole || "tourist");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Custom Registration fields
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState("heritage");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [stateVal, setStateVal] = useState("Rajasthan");
  const [region, setRegion] = useState("");
  const [languages, setLanguages] = useState("");
  const [aboutSelf, setAboutSelf] = useState("");
  const [preferences, setPreferences] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCountryChange = (c) => {
    setCountry(c);
    const states = COUNTRIES_AND_STATES[c] || [];
    setStateVal(states[0] || "");
  };

  useEffect(() => {
    if (open) {
      setMode(defaultMode || "login");
      setRole(defaultRole || "tourist");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMobile("");
      setService("heritage");
      setExperience("");
      setPrice("");
      setCity("");
      setCountry("India");
      setStateVal("Rajasthan");
      setRegion("");
      setLanguages("");
      setAboutSelf("");
      setPreferences("");
      setAgreeTerms(false);
    }
  }, [open, defaultRole, defaultMode]);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("⚠️ Email and password are required.");
      return;
    }

    if (mode === "signup") {
      if (!name) {
        alert("⚠️ Please enter your Full Name.");
        return;
      }
      
      if (role === "tourist") {
        if (!mobile) {
          alert("⚠️ Please enter your Mobile Number.");
          return;
        }
        if (!preferences) {
          alert("⚠️ Please enter your Travel Interests / Preferences.");
          return;
        }
      }
      
      if (role === "guide") {
        if (!mobile) {
          alert("⚠️ Please enter your Mobile Number.");
          return;
        }
        if (!city) {
          alert("⚠️ Please enter your City.");
          return;
        }
        if (!region) {
          alert("⚠️ Please enter your Region / District.");
          return;
        }
        if (!languages) {
          alert("⚠️ Please enter the languages you speak.");
          return;
        }
        if (!aboutSelf || aboutSelf.trim().length < 20) {
          alert("⚠️ Please write at least 20 characters about yourself (bio).");
          return;
        }
        if (!experience || isNaN(experience) || Number(experience) < 0) {
          alert("⚠️ Please enter a valid number of years of experience.");
          return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
          alert("⚠️ Please enter a valid hourly price.");
          return;
        }
        if (password !== confirmPassword) {
          alert("⚠️ Password and Confirm Password do not match.");
          return;
        }
        if (!agreeTerms) {
          alert("⚠️ You must agree to the trustable terms and conditions to register.");
          return;
        }
      }
    }

    setLoading(true);
    await sleep(1000);

    let guideId = null;
    let finalName = name || "Emma Wilson";

    if (mode === "signup" && role === "guide") {
      const serviceObj = SERVICES.find(s => s.id === service) || SERVICES[0];
      const newGuideId = GUIDES_DATA.length + 1;
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "G";
      
      const parsedLanguages = languages.trim() 
        ? languages.split(",").map(l => l.trim()).filter(l => l.length > 0)
        : ["Hindi", "English"];

      const badgeMap = {
        heritage: "Royal Heritage Expert",
        spiritual: "Spiritual Guru",
        food: "Culture & Culinary Guide",
        languages: "Cultural Expert",
        stays: "Eco-Tourism Specialist",
        transit: "Local Expert",
        shopping: "Premium Guide",
        emergency: "Safety Coordinator"
      };

      const newGuide = {
        id: newGuideId,
        name: name,
        email: email,
        password: password,
        mobile: mobile,
        city: city,
        state: stateVal,
        country: country,
        region: region,
        languages: parsedLanguages,
        rating: 5.0,
        reviews: 0,
        price: Number(price),
        currency: "₹",
        services: [service],
        bio: aboutSelf,
        avatar: initials,
        verified: true,
        experience: Number(experience),
        bookings: 0,
        badge: badgeMap[service] || "Verified Local Guide",
        available: true,
      };

      GUIDES_DATA.push(newGuide);
      
      if (typeof onRegisterGuide === "function") {
        onRegisterGuide(newGuide);
      }

      guideId = newGuide.id;
      finalName = newGuide.name;
      alert(`🎉 Registration Successful!\nWelcome to GuideConnect, ${name}! Your professional Guide profile has been created.`);
    } else if (mode === "login" && role === "guide") {
      const foundGuide = GUIDES_DATA.find(g => g.email?.toLowerCase() === email.toLowerCase());
      if (foundGuide) {
        if (foundGuide.password && foundGuide.password !== password) {
          alert("⚠️ Invalid password for this guide.");
          setLoading(false);
          return;
        }
        guideId = foundGuide.id;
        finalName = foundGuide.name;
      } else {
        alert("⚠️ No registered guide found with this email. Please register first or use guide signup!");
        setLoading(false);
        return;
      }
    } else if (role === "admin") {
      finalName = "System Administrator";
    }

    if (role === "tourist") {
      onLogin({ name: finalName, email, role, mobile, country, state: stateVal, preferences });
    } else {
      onLogin({ name: finalName, email, role, guideId });
    }
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === "login" ? "Welcome Back" : "Join GuideConnect"} maxWidth={mode === "signup" ? 520 : 440}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { value: "tourist", label: "🧳 Tourist" },
          { value: "guide", label: "🌟 Guide" },
        ].map(r => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: role === r.value ? COLORS.primary : "rgba(255,255,255,0.07)",
              color: role === r.value ? "#fff" : COLORS.textMuted,
              fontFamily: "inherit", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            }}
          >{r.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {mode === "signup" && (
          <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} icon="👤" />
        )}
        
        {/* Mobile Input */}
        {mode === "signup" && (role === "guide" || role === "tourist") && (
          <Input placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} type="tel" icon="📞" />
        )}
        
        <Input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} type="email" icon="✉️" />
        
        {/* Dynamic fields for Tourist onboarding */}
        {mode === "signup" && role === "tourist" && (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>Country</label>
                <select
                  value={country}
                  onChange={e => handleCountryChange(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: COLORS.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                    cursor: "pointer", height: "46px", boxSizing: "border-box"
                  }}
                >
                  {Object.keys(COUNTRIES_AND_STATES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>State / Province</label>
                <select
                  value={stateVal}
                  onChange={e => setStateVal(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: COLORS.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                    cursor: "pointer", height: "46px", boxSizing: "border-box"
                  }}
                >
                  {(COUNTRIES_AND_STATES[country] || []).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input placeholder="Travel Interests (e.g. Street Food, Fort Walks)" value={preferences} onChange={e => setPreferences(e.target.value)} icon="🧭" />
          </>
        )}

        {/* Dynamic fields for Guide onboarding */}
        {mode === "signup" && role === "guide" && (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>Country</label>
                <select
                  value={country}
                  onChange={e => handleCountryChange(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: COLORS.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                    cursor: "pointer", height: "46px", boxSizing: "border-box"
                  }}
                >
                  {Object.keys(COUNTRIES_AND_STATES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>State / Province</label>
                <select
                  value={stateVal}
                  onChange={e => setStateVal(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: COLORS.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                    cursor: "pointer", height: "46px", boxSizing: "border-box"
                  }}
                >
                  {(COUNTRIES_AND_STATES[country] || []).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>City</label>
                <Input placeholder="City (e.g. Jaipur)" value={city} onChange={e => setCity(e.target.value)} icon="📍" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 4 }}>Region / District</label>
                <Input placeholder="Region (e.g. Mewar)" value={region} onChange={e => setRegion(e.target.value)} icon="🗺️" />
              </div>
            </div>

            <Input placeholder="Languages Speak (e.g. Hindi, English)" value={languages} onChange={e => setLanguages(e.target.value)} icon="🗣️" />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>Select Tour Service Category</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 14, fontSize: 18, zIndex: 1 }}>🧭</span>
                <select
                  value={service}
                  onChange={e => setService(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px 12px 44px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: COLORS.text, fontSize: 14,
                    outline: "none", fontFamily: "inherit",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {SERVICES.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Input placeholder="Experience (Years)" value={experience} onChange={e => setExperience(e.target.value)} type="number" icon="⏳" />
              </div>
              <div style={{ flex: 1 }}>
                <Input placeholder="Price (₹ / Hour)" value={price} onChange={e => setPrice(e.target.value)} type="number" icon="₹" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>Write about yourself (Bio)</label>
              <textarea
                value={aboutSelf}
                onChange={e => setAboutSelf(e.target.value)}
                placeholder="Tell travelers about your background, passion, tour highlights, guiding experience..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: COLORS.text,
                  fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                  outline: "none", lineHeight: 1.6
                }}
              />
            </div>
          </>
        )}
        
        <Input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" icon="🔒" />
        
        {mode === "signup" && role === "guide" && (
          <>
            <Input placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" icon="🔒" />
            
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginTop: 8, fontSize: 13, color: COLORS.textMuted }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{ marginTop: 3, cursor: "pointer" }}
              />
              <span>
                I agree to the GuideConnect <span style={{ color: COLORS.primaryLight, textDecoration: "underline" }}>Trustable Terms and Conditions</span> for local guide partnerships.
              </span>
            </label>
          </>
        )}
      </div>

      <Button
        variant="primary" size="lg"
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: "100%", marginBottom: 16 }}
      >
        {loading ? <><Spinner /> {mode === "login" ? "Connecting Sockets..." : "Registering Profile..."}</> : mode === "login" ? "Login" : "Submit & Register"}
      </Button>

      <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={{ background: "none", border: "none", color: COLORS.primary, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
        >{mode === "login" ? "Sign up" : "Login"}</button>
      </div>
    </Modal>
  );
}

// ============================================================
// MODAL: CREATE BOOKING REQUEST
// ============================================================
function BookingModal({ guide, open, onClose, onConfirm, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(2);
  const [service, setService] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const serviceMap = { heritage: "Fort & Palace Walks", spiritual: "Sacred & Temple Tours", food: "Bazaar & Street Food Crawls", languages: "Dialect Interpretation", stays: "Ashram & Heritage Stays", transit: "Auto & Rickshaw Navigation", shopping: "Handicrafts & Bazaars", emergency: "24/7 Safety SOS Coordinator" };

  useEffect(() => {
    if (guide) {
      setService(guide.services[0] || "heritage");
      setStep(1);
      setDate("");
      setTime("");
      setDuration(2);
    }
  }, [guide, open]);

  if (!guide) return null;

  const total = guide.price * duration;

  const handleConfirm = async () => {
    setProcessing(true);
    await sleep(1500);

    const newBooking = {
      guideId: guide.id,
      touristEmail: user.email,
      touristName: user.name,
      date,
      time,
      duration: Number(duration),
      service,
      price: total,
      currency: guide.currency,
      city: guide.city,
      status: "pending"
    };

    socket.emit("create_booking", newBooking);
    
    if (typeof onConfirm === "function") {
      onConfirm(newBooking);
    }

    setProcessing(false);
    onClose();
    alert("🎉 Request Sent!\nThe guide has been notified via Sockets in real-time. Check status on your dashboard.");
  };

  return (
    <Modal open={open} onClose={onClose} title={`Book ${guide.name}`} maxWidth={460}>
      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12 }}>
            <Avatar initials={guide.avatar} size={44} bg={COLORS.accent} />
            <div>
              <div style={{ color: COLORS.text, fontWeight: 600 }}>{guide.name}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{guide.badge} • {formatPrice(guide.price, guide.currency)}/hr</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>Select Tour Service</label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              style={{ padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: COLORS.text, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
            >
              {guide.services.map(s => (
                <option key={s} value={s}>{serviceMap[s]}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 10 }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>Start Time</label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ padding: 10 }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>Duration ({duration} hours)</label>
            <input
              type="range" min="1" max="12"
              value={duration} onChange={e => setDuration(e.target.value)}
              style={{ width: "100%", accentColor: COLORS.primary, cursor: "pointer", height: 6 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted }}>
              <span>1 hr</span>
              <span>6 hrs</span>
              <span>12 hrs</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Total Booking price</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primaryLight }}>{formatPrice(total, guide.currency)}</div>
            </div>
            <Button variant="primary" disabled={!date || !time} onClick={() => setStep(2)}>
              Continue →
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h3 style={{ color: COLORS.text, marginTop: 0, marginBottom: 20 }}>Confirm & Send Request</h3>
          <Card style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Guide", value: guide.name },
                { label: "Date", value: date },
                { label: "Time", value: time },
                { label: "Duration", value: `${duration} hour${duration > 1 ? "s" : ""}` },
                { label: "Service", value: serviceMap[service] },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 14 }}>{row.label}</span>
                  <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: COLORS.text, fontWeight: 700 }}>Total</span>
                <span style={{ color: COLORS.primaryLight, fontWeight: 800, fontSize: 18 }}>{formatPrice(total, guide.currency)}</span>
              </div>
            </div>
          </Card>

          <div style={{
            background: "rgba(230,81,0,0.08)", border: "1px solid rgba(230,81,0,0.2)",
            borderRadius: 12, padding: 14, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>🔒</span>
            <span style={{ color: COLORS.textMuted, fontSize: 13 }}>
              This request will notify the guide instantly. Payment is only captured after acceptance.
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
            <Button variant="accent" onClick={handleConfirm} disabled={processing} style={{ flex: 2 }}>
              {processing ? <><Spinner /> Sending...</> : "💳 Book & Request"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ============================================================
// MAIN APP ENTRY
// ============================================================
export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [user, setUser] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingGuide, setBookingGuide] = useState(null);
  const [chatGuide, setChatGuide] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("tourist");
  const [loginMode, setLoginMode] = useState("login");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  
  // Real-Time States mapped over server connections
  const [guidesOnlineStatus, setGuidesOnlineStatus] = useState({});
  const [realtimeBookings, setRealtimeBookings] = useState([]);
  const [guides, setGuides] = useState(GUIDES_DATA);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    // Connect & Register via Websocket in real-time
    connectSocket(user);

    // Initial state payload
    socket.on("initial_state", ({ availabilities, bookings }) => {
      const statuses = {};
      availabilities.forEach(([id, avail]) => {
        statuses[id] = avail;
      });
      setGuidesOnlineStatus(statuses);
      setRealtimeBookings(bookings);
    });

    // Handle incoming real-time guide toggles
    socket.on("guide_availability_changed", ({ guideId, available }) => {
      setGuidesOnlineStatus(prev => ({
        ...prev,
        [guideId]: available
      }));
    });

    // Real-Time Toast notification for Guides
    socket.on("booking_received", (newBooking) => {
      setRealtimeBookings(prev => {
        if (prev.some(b => b.id === newBooking.id)) return prev;
        return [newBooking, ...prev];
      });
      alert(`🔔 NEW BOOKING REQUEST!\nTourist: ${newBooking.touristName}\nService: ${newBooking.service.toUpperCase()}\nCity: ${newBooking.city}`);
    });

    // Real-Time status update for Tourists
    socket.on("booking_status_updated", ({ bookingId, status }) => {
      setRealtimeBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status } : b)
      );

      if (user.role === "tourist") {
        alert(`🔔 BOOKING STATUS UPDATE!\nYour booking request ${bookingId} has been ${status.toUpperCase()} by the guide!`);
      }
    });

    return () => {
      socket.off("initial_state");
      socket.off("guide_availability_changed");
      socket.off("booking_received");
      socket.off("booking_status_updated");
    };
  }, [user]);

  const handleLogin = (role, mode = "login") => {
    setLoginRole(role);
    setLoginMode(mode);
    setShowLogin(true);
  };

  const handleLoginConfirm = (userData) => {
    setUser(userData);
    setShowLogin(false);
    if (userData.role === "admin") setCurrentPage("Admin");
    else if (userData.role === "guide") setCurrentPage("GuideDash");
    else setCurrentPage("TouristDash");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("Home");
  };

  const handleBook = (guide) => {
    if (!user) { handleLogin("tourist"); return; }
    setBookingGuide(guide || guides[0]);
  };

  const handleChat = (guide) => {
    if (!user) { handleLogin("tourist"); return; }
    setChatGuide(guide);
    setCurrentPage("Chat");
  };

  const handleBookingConfirm = (newBooking) => {
    setRealtimeBookings(prev => {
      if (prev.some(b => b.id === newBooking.id)) return prev;
      return [newBooking, ...prev];
    });
  };

  // Compile real guides override
  const guidesListWithLiveStatus = guides.map(g => ({
    ...g,
    available: guidesOnlineStatus[g.id] !== undefined ? guidesOnlineStatus[g.id] : g.available
  }));

  // Chat page interception
  if (currentPage === "Chat" && chatGuide) {
    return (
      <div style={{ background: COLORS.dark, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: COLORS.text }}>
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        `}</style>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <ChatPage guide={chatGuide} user={user} onClose={() => { setChatGuide(null); setCurrentPage("Guides"); }} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedGuide={setSelectedGuide} 
            onBook={handleBook} 
            onChat={handleChat}
            onLogin={handleLogin} 
            guidesList={guidesListWithLiveStatus}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />
        );
      case "Explore":
        return (
          <ExplorePage
            setCurrentPage={setCurrentPage}
            setSelectedState={setSelectedState}
            setSelectedService={setSelectedService}
          />
        );
      case "Guides":
        return (
          <GuidesPage 
            setCurrentPage={setCurrentPage} 
            setSelectedGuide={setSelectedGuide} 
            onBook={handleBook} 
            onChat={handleChat} 
            guidesList={guidesListWithLiveStatus}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />
        );
      case "GuideProfile":
        return (
          <GuideProfilePage 
            guide={guidesListWithLiveStatus.find(g => g.id === selectedGuide?.id) || selectedGuide} 
            onBook={handleBook} 
            onChat={handleChat} 
            onBack={() => setCurrentPage("Guides")} 
          />
        );
      case "AI":
        return <AIAssistantPage />;
      case "TouristDash":
        return user ? (
          <TouristDashboard 
            user={user} 
            onBook={handleBook} 
            bookings={realtimeBookings.filter(b => b.touristEmail === user.email)} 
            onChat={handleChat}
          />
        ) : null;
      case "GuideDash":
        return user ? (
          <GuideDashboard 
            user={user} 
            bookings={realtimeBookings.filter(b => Number(b.guideId) === Number(user.guideId))} 
            onChat={handleChat}
          />
        ) : null;
      case "Admin":
        return user ? <AdminDashboard bookings={realtimeBookings} /> : null;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setSelectedGuide={setSelectedGuide} onBook={handleBook} onChat={handleChat} onLogin={handleLogin} guidesList={guidesListWithLiveStatus} />;
    }
  };

  return (
    <div style={{ background: COLORS.dark, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: COLORS.text }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        select option { background: #111827; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogin={handleLogin} onLogout={handleLogout} />

      {renderPage()}

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLoginConfirm}
        defaultRole={loginRole}
        defaultMode={loginMode}
        onRegisterGuide={(newGuide) => {
          setGuides([...GUIDES_DATA]);
        }}
      />

      <BookingModal
        guide={bookingGuide}
        open={!!bookingGuide}
        onClose={() => setBookingGuide(null)}
        onConfirm={handleBookingConfirm}
        user={user}
      />

      {/* SOS Button */}
      <div
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 800,
          width: 56, height: 56, borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.danger}, #C53030)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: `0 4px 20px rgba(239,68,68,0.5)`,
          fontSize: 22, animation: "bounce 3s infinite",
        }}
        title="SOS Emergency Help"
        onClick={() => alert("🆘 Emergency assistance activated! A local emergency coordinator will contact you shortly.")}
      >
        🆘
      </div>
    </div>
  );
}
