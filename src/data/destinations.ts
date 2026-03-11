export interface Sightseeing {
  name: string;
  description: string;
  rating: number;
  estimatedTime: string;
  imageUrl: string;
  category: "landmark" | "museum" | "nature" | "cultural" | "adventure";
}

export interface FoodSpot {
  name: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  description: string;
  specialtyDish: string;
  address: string;
}

export interface InstagramSpot {
  name: string;
  description: string;
  whyFamous: string;
  bestTimeToVisit: string;
  hashtag: string;
  imageUrl: string;
}

export interface Flight {
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: "economy" | "business" | "first";
  price: number;
  stops: number;
}

export interface Destination {
  name: string;
  country: string;
  continent: string;
  slug: string;
  description: string;
  imageUrl: string;
  language: string;
  currency: string;
  timezone: string;
  bestTimeToVisit: string;
  averageTemp: string;
  topSightseeing: Sightseeing[];
  foodSpots: FoodSpot[];
  instagramSpots: InstagramSpot[];
  flights: Flight[];
}

export const destinations: Destination[] = [
  {
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    slug: "tokyo",
    description:
      "A dazzling mix of ultramodern and traditional, Tokyo pulses with neon-lit skyscrapers, ancient temples, world-class cuisine, and cutting-edge technology.",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    language: "Japanese",
    currency: "JPY (¥)",
    timezone: "JST (UTC+9)",
    bestTimeToVisit: "Mar - May",
    averageTemp: "16°C",
    topSightseeing: [
      { name: "Senso-ji Temple", description: "Tokyo's oldest and most significant Buddhist temple in Asakusa, with its iconic red lantern gate.", rating: 4.8, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400", category: "cultural" },
      { name: "Shibuya Crossing", description: "The world's busiest pedestrian crossing — a mesmerising spectacle of organized chaos.", rating: 4.6, estimatedTime: "30 min", imageUrl: "https://images.unsplash.com/photo-1532236204992-f5e85c024202?w=400", category: "landmark" },
      { name: "Meiji Shrine", description: "A serene Shinto shrine surrounded by a lush forest in the heart of Harajuku.", rating: 4.7, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400", category: "cultural" },
      { name: "teamLab Borderless", description: "A breathtaking digital art museum where immersive installations blend art and technology.", rating: 4.9, estimatedTime: "2.5 hrs", imageUrl: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=400", category: "museum" },
      { name: "Tsukiji Outer Market", description: "A bustling market filled with the freshest seafood, street food, and Japanese delicacies.", rating: 4.5, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Tokyo Skytree", description: "Japan's tallest structure offering panoramic views of the entire Tokyo metropolis.", rating: 4.4, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400", category: "landmark" },
      { name: "Shinjuku Gyoen", description: "A stunning national garden blending Japanese, English, and French garden styles.", rating: 4.6, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400", category: "nature" },
      { name: "Akihabara Electric Town", description: "The epicenter of anime, manga, and electronics culture in Japan.", rating: 4.3, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400", category: "cultural" },
      { name: "Imperial Palace", description: "The primary residence of the Emperor of Japan, surrounded by beautiful gardens and moats.", rating: 4.4, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400", category: "landmark" },
      { name: "Mount Takao", description: "A scenic mountain just outside Tokyo, perfect for hiking with temple visits and city views.", rating: 4.5, estimatedTime: "4 hrs", imageUrl: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400", category: "nature" },
    ],
    foodSpots: [
      { name: "Ichiran Ramen", cuisine: "Ramen", priceLevel: 2, rating: 4.6, description: "Famous tonkotsu ramen chain with individual booth seating for a focused ramen experience.", specialtyDish: "Tonkotsu Ramen", address: "Shibuya, Tokyo" },
      { name: "Sukiyabashi Jiro", cuisine: "Sushi", priceLevel: 4, rating: 4.9, description: "Legendary 3-Michelin-star sushi restaurant featured in 'Jiro Dreams of Sushi'.", specialtyDish: "Omakase Sushi", address: "Ginza, Tokyo" },
      { name: "Afuri", cuisine: "Ramen", priceLevel: 2, rating: 4.5, description: "Known for its refreshing yuzu-flavored ramen — lighter than traditional styles.", specialtyDish: "Yuzu Shio Ramen", address: "Ebisu, Tokyo" },
      { name: "Gonpachi", cuisine: "Japanese", priceLevel: 3, rating: 4.4, description: "The restaurant that inspired the 'Kill Bill' fight scene. Great yakitori and soba.", specialtyDish: "Charcoal Grilled Yakitori", address: "Nishi-Azabu, Tokyo" },
      { name: "Tsuta", cuisine: "Ramen", priceLevel: 2, rating: 4.7, description: "The world's first Michelin-starred ramen restaurant with truffle-infused broth.", specialtyDish: "Shoyu Truffle Ramen", address: "Sugamo, Tokyo" },
      { name: "Nakiryu", cuisine: "Ramen", priceLevel: 1, rating: 4.6, description: "Michelin-starred tantanmen (spicy sesame ramen) at incredibly affordable prices.", specialtyDish: "Tantanmen", address: "Otsuka, Tokyo" },
      { name: "Uobei Sushi", cuisine: "Sushi", priceLevel: 1, rating: 4.3, description: "Fun conveyor belt sushi where you order via tablet and plates zoom to your seat.", specialtyDish: "Salmon Sushi Set", address: "Shibuya, Tokyo" },
      { name: "Tempura Kondo", cuisine: "Tempura", priceLevel: 4, rating: 4.8, description: "Two-Michelin-star tempura master serving the lightest, crispiest tempura in Tokyo.", specialtyDish: "Sweet Potato Tempura", address: "Ginza, Tokyo" },
      { name: "Fuunji", cuisine: "Tsukemen", priceLevel: 1, rating: 4.5, description: "Famous for its rich, concentrated dipping ramen near Shinjuku station.", specialtyDish: "Tsukemen", address: "Shinjuku, Tokyo" },
      { name: "Den", cuisine: "Japanese", priceLevel: 4, rating: 4.9, description: "Playful, creative Japanese cuisine ranked among Asia's 50 Best Restaurants.", specialtyDish: "Den-tucky Fried Chicken", address: "Jingumae, Tokyo" },
    ],
    instagramSpots: [
      { name: "Shibuya Crossing from Above", description: "The iconic scramble crossing viewed from the Shibuya Sky observation deck.", whyFamous: "The ultimate Tokyo shot — thousands of people crossing from every direction under neon lights.", bestTimeToVisit: "Evening for neon glow", hashtag: "#ShibuyaCrossing", imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400" },
      { name: "Chidorigafuchi Moat", description: "Cherry blossom-lined moat near the Imperial Palace, stunning during sakura season.", whyFamous: "Pink cherry blossoms reflecting on calm water — peak spring aesthetics.", bestTimeToVisit: "Late March - Early April", hashtag: "#TokyoCherryBlossom", imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400" },
      { name: "teamLab Borderless", description: "Immersive digital art installations that react to your presence.", whyFamous: "Every photo looks like you're inside a living painting — pure visual magic.", bestTimeToVisit: "Weekday mornings", hashtag: "#teamLabBorderless", imageUrl: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=400" },
      { name: "Nakamise Street, Asakusa", description: "Traditional shopping street leading to Senso-ji Temple.", whyFamous: "Colourful stalls, paper lanterns, and the massive red Kaminarimon gate in the background.", bestTimeToVisit: "Early morning for fewer crowds", hashtag: "#Asakusa", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400" },
      { name: "Golden Gai", description: "Tiny alleyways packed with over 200 micro-bars in Shinjuku.", whyFamous: "Atmospheric narrow lanes with glowing signs — feels like stepping into a Blade Runner set.", bestTimeToVisit: "After 8 PM", hashtag: "#GoldenGai", imageUrl: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=400" },
    ],
    flights: [
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "15:45+1", duration: "11h 15m", cabinClass: "economy", price: 650, stops: 0 },
      { airline: "ANA", departureTime: "13:00", arrivalTime: "18:30+1", duration: "11h 30m", cabinClass: "economy", price: 620, stops: 0 },
      { airline: "British Airways", departureTime: "09:00", arrivalTime: "19:00+1", duration: "14h 00m", cabinClass: "economy", price: 520, stops: 1 },
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "15:45+1", duration: "11h 15m", cabinClass: "business", price: 3200, stops: 0 },
      { airline: "ANA", departureTime: "13:00", arrivalTime: "18:30+1", duration: "11h 30m", cabinClass: "business", price: 3400, stops: 0 },
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "15:45+1", duration: "11h 15m", cabinClass: "first", price: 8500, stops: 0 },
      { airline: "Emirates", departureTime: "20:00", arrivalTime: "18:30+1", duration: "16h 30m", cabinClass: "economy", price: 480, stops: 1 },
      { airline: "Emirates", departureTime: "20:00", arrivalTime: "18:30+1", duration: "16h 30m", cabinClass: "business", price: 4100, stops: 1 },
      { airline: "Emirates", departureTime: "20:00", arrivalTime: "18:30+1", duration: "16h 30m", cabinClass: "first", price: 9200, stops: 1 },
    ],
  },
  {
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    slug: "kyoto",
    description:
      "Japan's cultural heart — a city of thousands of temples, stunning bamboo groves, traditional geisha districts, and exquisite kaiseki cuisine.",
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    language: "Japanese",
    currency: "JPY (¥)",
    timezone: "JST (UTC+9)",
    bestTimeToVisit: "Mar - May",
    averageTemp: "15°C",
    topSightseeing: [
      { name: "Fushimi Inari Shrine", description: "Thousands of vermillion torii gates winding up a forested mountainside.", rating: 4.9, estimatedTime: "2.5 hrs", imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400", category: "cultural" },
      { name: "Arashiyama Bamboo Grove", description: "A magical path through towering bamboo stalks that filter the sunlight.", rating: 4.8, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400", category: "nature" },
      { name: "Kinkaku-ji (Golden Pavilion)", description: "A stunning Zen temple covered in gold leaf, reflected in a tranquil pond.", rating: 4.8, estimatedTime: "1 hr", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400", category: "cultural" },
      { name: "Nijo Castle", description: "A UNESCO World Heritage site with 'nightingale floors' that chirp when walked upon.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400", category: "landmark" },
      { name: "Philosopher's Path", description: "A scenic canal-side walk lined with hundreds of cherry trees.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400", category: "nature" },
      { name: "Gion District", description: "Kyoto's famous geisha district with traditional wooden machiya houses.", rating: 4.7, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400", category: "cultural" },
      { name: "Kiyomizu-dera", description: "An ancient hilltop temple with a massive wooden stage offering panoramic city views.", rating: 4.8, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400", category: "landmark" },
      { name: "Nishiki Market", description: "A vibrant 400-year-old market known as 'Kyoto's Kitchen' with over 100 vendors.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Monkey Park Iwatayama", description: "A hilltop park where wild macaque monkeys roam freely with views over Kyoto.", rating: 4.4, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1528164344885-47b852f56fd7?w=400", category: "nature" },
      { name: "Tenryu-ji Temple", description: "A World Heritage Zen temple in Arashiyama with a magnificent landscape garden.", rating: 4.6, estimatedTime: "1 hr", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400", category: "cultural" },
    ],
    foodSpots: [
      { name: "Kikunoi", cuisine: "Kaiseki", priceLevel: 4, rating: 4.9, description: "Three-Michelin-star kaiseki restaurant offering the pinnacle of Kyoto cuisine.", specialtyDish: "Seasonal Kaiseki Course", address: "Higashiyama, Kyoto" },
      { name: "Nishiki Warai", cuisine: "Okonomiyaki", priceLevel: 2, rating: 4.4, description: "Hearty Osaka-style okonomiyaki in the heart of Nishiki Market.", specialtyDish: "Pork Okonomiyaki", address: "Nishiki Market, Kyoto" },
      { name: "Omen", cuisine: "Udon", priceLevel: 2, rating: 4.5, description: "Famous for handmade udon noodles served with seasonal vegetables.", specialtyDish: "Omen Udon", address: "Gion, Kyoto" },
      { name: "Gion Kappa", cuisine: "Sushi", priceLevel: 3, rating: 4.6, description: "Intimate sushi counter in Gion serving fresh Kyoto-style sushi.", specialtyDish: "Mackerel Sushi", address: "Gion, Kyoto" },
      { name: "Mameya", cuisine: "Tofu", priceLevel: 2, rating: 4.5, description: "Specializes in silky Kyoto-style tofu dishes in a traditional setting.", specialtyDish: "Yudofu (Hot Tofu)", address: "Nanzenji, Kyoto" },
      { name: "Gyatei", cuisine: "Japanese Set Meal", priceLevel: 1, rating: 4.3, description: "Popular student-friendly spot near temples with hearty set meals.", specialtyDish: "Daily Teishoku Set", address: "Arashiyama, Kyoto" },
      { name: "Musubi", cuisine: "Matcha & Sweets", priceLevel: 1, rating: 4.4, description: "Cosy café serving Kyoto's finest matcha desserts.", specialtyDish: "Matcha Parfait", address: "Higashiyama, Kyoto" },
      { name: "Hyotei", cuisine: "Kaiseki", priceLevel: 4, rating: 4.8, description: "A 400-year-old restaurant and Kyoto institution for traditional multi-course dining.", specialtyDish: "Morning Kaiseki Set", address: "Nanzenji, Kyoto" },
      { name: "Ramen Sen no Kaze", cuisine: "Ramen", priceLevel: 1, rating: 4.3, description: "Rich chicken-based ramen with a Kyoto twist.", specialtyDish: "Tori Paitan Ramen", address: "Kawaramachi, Kyoto" },
      { name: "Izuju", cuisine: "Sushi", priceLevel: 2, rating: 4.5, description: "Historic Gion sushi shop famous for Kyoto-style pressed mackerel sushi.", specialtyDish: "Sabazushi (Mackerel Sushi)", address: "Gion, Kyoto" },
    ],
    instagramSpots: [
      { name: "Fushimi Inari Gates", description: "Endless rows of bright orange torii gates creating a magical tunnel.", whyFamous: "One of Japan's most photographed spots — the repetition of gates creates a mesmerising perspective.", bestTimeToVisit: "Sunrise (5-6 AM) for empty shots", hashtag: "#FushimiInari", imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400" },
      { name: "Arashiyama Bamboo Grove", description: "Towering bamboo stalks creating an otherworldly green corridor.", whyFamous: "The scale and atmosphere feel like walking into another dimension.", bestTimeToVisit: "Early morning before 8 AM", hashtag: "#BambooGrove", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400" },
      { name: "Kinkaku-ji Reflection", description: "The Golden Pavilion perfectly mirrored in the still pond.", whyFamous: "Gold against green — the reflection doubles the beauty for a perfect symmetrical shot.", bestTimeToVisit: "Morning for calm water", hashtag: "#GoldenPavilion", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
      { name: "Yasaka Pagoda Street", description: "A traditional Kyoto street with the five-story Yasaka Pagoda towering above.", whyFamous: "The quintessential Kyoto photo — kimonos, old streets, and a pagoda backdrop.", bestTimeToVisit: "Late afternoon golden hour", hashtag: "#YasakaPagoda", imageUrl: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=400" },
      { name: "Sagano Scenic Railway", description: "A romantic train ride through the Hozugawa River valley.", whyFamous: "Cherry blossoms or autumn foliage flanking the open-air train — seasonal perfection.", bestTimeToVisit: "Spring or Autumn", hashtag: "#SaganoTrain", imageUrl: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400" },
    ],
    flights: [
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "16:00+1", duration: "12h 30m", cabinClass: "economy", price: 680, stops: 1 },
      { airline: "ANA", departureTime: "11:00", arrivalTime: "17:30+1", duration: "12h 30m", cabinClass: "economy", price: 660, stops: 1 },
      { airline: "British Airways", departureTime: "09:00", arrivalTime: "20:00+1", duration: "15h 00m", cabinClass: "economy", price: 550, stops: 1 },
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "16:00+1", duration: "12h 30m", cabinClass: "business", price: 3500, stops: 1 },
      { airline: "ANA", departureTime: "11:00", arrivalTime: "17:30+1", duration: "12h 30m", cabinClass: "business", price: 3600, stops: 1 },
      { airline: "Japan Airlines", departureTime: "10:30", arrivalTime: "16:00+1", duration: "12h 30m", cabinClass: "first", price: 8800, stops: 1 },
    ],
  },
  {
    name: "Paris",
    country: "France",
    continent: "Europe",
    slug: "paris",
    description:
      "The City of Light enchants with its iconic landmarks, world-class art, romantic boulevards, and a food scene that sets the global standard.",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    language: "French",
    currency: "EUR (€)",
    timezone: "CET (UTC+1)",
    bestTimeToVisit: "Apr - Jun",
    averageTemp: "12°C",
    topSightseeing: [
      { name: "Eiffel Tower", description: "The iconic iron lattice tower and symbol of Paris, offering stunning city views from its platforms.", rating: 4.7, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400", category: "landmark" },
      { name: "Louvre Museum", description: "The world's largest art museum, home to the Mona Lisa and 35,000 other masterpieces.", rating: 4.8, estimatedTime: "4 hrs", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400", category: "museum" },
      { name: "Sacré-Cœur Basilica", description: "A stunning white-domed basilica atop Montmartre with panoramic views of Paris.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400", category: "landmark" },
      { name: "Musée d'Orsay", description: "A former railway station housing the world's finest collection of Impressionist art.", rating: 4.8, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400", category: "museum" },
      { name: "Notre-Dame Cathedral", description: "A masterpiece of French Gothic architecture on the Île de la Cité.", rating: 4.7, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400", category: "landmark" },
      { name: "Palace of Versailles", description: "The opulent royal palace with its legendary Hall of Mirrors and vast gardens.", rating: 4.8, estimatedTime: "5 hrs", imageUrl: "https://images.unsplash.com/photo-1551410224-699683e15636?w=400", category: "landmark" },
      { name: "Montmartre & Artists' Square", description: "A charming hilltop village within Paris, famous for its artistic history and cobbled streets.", rating: 4.5, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400", category: "cultural" },
      { name: "Seine River Cruise", description: "A scenic boat ride past Paris's most famous landmarks illuminated at night.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400", category: "adventure" },
      { name: "Luxembourg Gardens", description: "Beautiful formal gardens perfect for a leisurely Parisian stroll.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "nature" },
      { name: "Champs-Élysées & Arc de Triomphe", description: "The world's most famous avenue leading to the monumental triumphal arch.", rating: 4.6, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400", category: "landmark" },
    ],
    foodSpots: [
      { name: "Le Comptoir du Panthéon", cuisine: "French Bistro", priceLevel: 2, rating: 4.5, description: "Classic Parisian bistro with sidewalk seating and excellent traditional dishes.", specialtyDish: "Croque Monsieur", address: "5th Arrondissement, Paris" },
      { name: "L'Ambroisie", cuisine: "French Fine Dining", priceLevel: 4, rating: 4.9, description: "Three-Michelin-star restaurant in Place des Vosges — the pinnacle of French cuisine.", specialtyDish: "Chocolate Tart", address: "Place des Vosges, Paris" },
      { name: "Breizh Café", cuisine: "Crêpes", priceLevel: 2, rating: 4.6, description: "The best galettes and crêpes in Paris, made with organic Breton buckwheat.", specialtyDish: "Complete Galette", address: "Le Marais, Paris" },
      { name: "Chez Janou", cuisine: "French", priceLevel: 3, rating: 4.5, description: "Famous for its legendary chocolate mousse served from a giant bowl.", specialtyDish: "Chocolate Mousse", address: "3rd Arrondissement, Paris" },
      { name: "Pink Mamma", cuisine: "Italian", priceLevel: 2, rating: 4.4, description: "A massive, vibrant four-story Italian restaurant that's become a Paris hotspot.", specialtyDish: "Truffle Pizza", address: "10th Arrondissement, Paris" },
      { name: "Du Pain et des Idées", cuisine: "Bakery", priceLevel: 1, rating: 4.8, description: "One of the best bakeries in Paris, housed in a beautiful 19th-century shop.", specialtyDish: "Pain des Amis", address: "10th Arrondissement, Paris" },
      { name: "Le Bouillon Chartier", cuisine: "French", priceLevel: 1, rating: 4.3, description: "A historic 1896 workers' canteen serving classic French food at incredible prices.", specialtyDish: "Steak Frites", address: "9th Arrondissement, Paris" },
      { name: "Septime", cuisine: "Modern French", priceLevel: 4, rating: 4.8, description: "One-Michelin-star restaurant on the World's 50 Best list with creative tasting menus.", specialtyDish: "Seasonal Tasting Menu", address: "11th Arrondissement, Paris" },
      { name: "L'As du Fallafel", cuisine: "Middle Eastern", priceLevel: 1, rating: 4.5, description: "The legendary falafel spot in the Marais — always a queue, always worth it.", specialtyDish: "Falafel Pita", address: "Le Marais, Paris" },
      { name: "Café de Flore", cuisine: "French Café", priceLevel: 3, rating: 4.3, description: "The iconic literary café once frequented by Sartre and Hemingway.", specialtyDish: "Café Crème & Croissant", address: "Saint-Germain, Paris" },
    ],
    instagramSpots: [
      { name: "Eiffel Tower from Trocadéro", description: "The classic Eiffel Tower shot from across the Seine at the Trocadéro esplanade.", whyFamous: "The most iconic Paris photo — the full tower framed perfectly with fountains in the foreground.", bestTimeToVisit: "Sunrise for golden light and no crowds", hashtag: "#EiffelTower", imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400" },
      { name: "Rue Crémieux", description: "A tiny, colourful cobblestoned street with pastel-painted houses.", whyFamous: "The most colourful street in Paris — every door is a different candy shade.", bestTimeToVisit: "Morning on weekdays", hashtag: "#RueCremieux", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
      { name: "Louvre Pyramid", description: "The glass pyramid entrance to the Louvre Museum.", whyFamous: "Modern glass meets classical architecture — stunning reflections at golden hour.", bestTimeToVisit: "Sunset or blue hour", hashtag: "#Louvre", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400" },
      { name: "Pont Alexandre III", description: "Paris's most ornate bridge with gilded statues and Art Nouveau lamps.", whyFamous: "The most beautiful bridge in Paris with the Eiffel Tower and Invalides as backdrop.", bestTimeToVisit: "Golden hour", hashtag: "#PontAlexandreIII", imageUrl: "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400" },
      { name: "Montmartre Steps", description: "The sweeping stairs leading up to Sacré-Cœur with all of Paris below.", whyFamous: "The classic 'Amélie' Paris aesthetic — romantic, bohemian, and endlessly photogenic.", bestTimeToVisit: "Early morning", hashtag: "#Montmartre", imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400" },
    ],
    flights: [
      { airline: "Air France", departureTime: "07:30", arrivalTime: "10:00", duration: "1h 30m", cabinClass: "economy", price: 120, stops: 0 },
      { airline: "British Airways", departureTime: "09:00", arrivalTime: "11:20", duration: "1h 20m", cabinClass: "economy", price: 95, stops: 0 },
      { airline: "EasyJet", departureTime: "06:30", arrivalTime: "08:50", duration: "1h 20m", cabinClass: "economy", price: 45, stops: 0 },
      { airline: "Air France", departureTime: "07:30", arrivalTime: "10:00", duration: "1h 30m", cabinClass: "business", price: 450, stops: 0 },
      { airline: "British Airways", departureTime: "09:00", arrivalTime: "11:20", duration: "1h 20m", cabinClass: "business", price: 480, stops: 0 },
      { airline: "Air France", departureTime: "18:30", arrivalTime: "21:00", duration: "1h 30m", cabinClass: "first", price: 850, stops: 0 },
    ],
  },
  {
    name: "Rome",
    country: "Italy",
    continent: "Europe",
    slug: "rome",
    description:
      "The Eternal City layers nearly 3,000 years of history with world-famous ruins, Renaissance art, vibrant piazzas, and unforgettable Italian food.",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
    language: "Italian",
    currency: "EUR (€)",
    timezone: "CET (UTC+1)",
    bestTimeToVisit: "Apr - Jun",
    averageTemp: "15°C",
    topSightseeing: [
      { name: "Colosseum", description: "The iconic ancient amphitheatre that once hosted gladiatorial combat for 50,000 spectators.", rating: 4.8, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", category: "landmark" },
      { name: "Vatican Museums & Sistine Chapel", description: "One of the world's greatest art collections, culminating in Michelangelo's breathtaking ceiling.", rating: 4.9, estimatedTime: "4 hrs", imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400", category: "museum" },
      { name: "Trevi Fountain", description: "Rome's most famous baroque fountain — throw a coin to ensure your return.", rating: 4.6, estimatedTime: "30 min", imageUrl: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400", category: "landmark" },
      { name: "Pantheon", description: "A perfectly preserved 2,000-year-old temple with the world's largest unreinforced concrete dome.", rating: 4.8, estimatedTime: "1 hr", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", category: "landmark" },
      { name: "Roman Forum", description: "The ruins of ancient Rome's political and social heart.", rating: 4.6, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", category: "landmark" },
      { name: "Trastevere Neighborhood", description: "Rome's most charming neighbourhood with cobblestone streets, ivy-covered buildings, and lively nightlife.", rating: 4.7, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400", category: "cultural" },
      { name: "Borghese Gallery", description: "A stunning art gallery housing masterpieces by Bernini, Caravaggio, and Raphael.", rating: 4.8, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400", category: "museum" },
      { name: "Spanish Steps", description: "The famous 135-step staircase connecting Piazza di Spagna to the Trinità dei Monti church.", rating: 4.4, estimatedTime: "30 min", imageUrl: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400", category: "landmark" },
      { name: "Piazza Navona", description: "A beautiful baroque square with three fountains and constant street performances.", rating: 4.5, estimatedTime: "1 hr", imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400", category: "cultural" },
      { name: "Appian Way", description: "One of the oldest and most important Roman roads, lined with ruins and catacombs.", rating: 4.4, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", category: "adventure" },
    ],
    foodSpots: [
      { name: "Da Enzo al 29", cuisine: "Roman", priceLevel: 2, rating: 4.7, description: "Trastevere's best-loved trattoria with queues down the street for authentic Roman pasta.", specialtyDish: "Cacio e Pepe", address: "Trastevere, Rome" },
      { name: "Roscioli", cuisine: "Italian", priceLevel: 3, rating: 4.7, description: "Part bakery, part deli, part restaurant — a Roman food institution.", specialtyDish: "Carbonara", address: "Centro Storico, Rome" },
      { name: "Pizzarium", cuisine: "Pizza", priceLevel: 1, rating: 4.6, description: "Gabriele Bonci's legendary pizza al taglio with creative, seasonal toppings.", specialtyDish: "Mortadella Pizza", address: "Near Vatican, Rome" },
      { name: "La Pergola", cuisine: "Italian Fine Dining", priceLevel: 4, rating: 4.9, description: "Rome's only three-Michelin-star restaurant with panoramic views of the city.", specialtyDish: "Mediterranean Tasting Menu", address: "Monte Mario, Rome" },
      { name: "Supplì", cuisine: "Street Food", priceLevel: 1, rating: 4.5, description: "The best supplì (fried rice balls) in Rome — crispy outside, gooey mozzarella inside.", specialtyDish: "Supplì al Telefono", address: "Trastevere, Rome" },
      { name: "Armando al Pantheon", cuisine: "Roman", priceLevel: 3, rating: 4.6, description: "A family-run trattoria steps from the Pantheon, serving Roman classics since 1961.", specialtyDish: "Amatriciana", address: "Near Pantheon, Rome" },
      { name: "Tonnarello", cuisine: "Roman", priceLevel: 2, rating: 4.4, description: "Huge portions of classic Roman pasta in a lively Trastevere piazza.", specialtyDish: "Tonnarelli Cacio e Pepe", address: "Trastevere, Rome" },
      { name: "Giolitti", cuisine: "Gelato", priceLevel: 1, rating: 4.5, description: "Rome's most famous gelateria since 1900 — creamy, authentic Italian gelato.", specialtyDish: "Pistachio Gelato", address: "Near Pantheon, Rome" },
      { name: "Trattoria Da Teo", cuisine: "Roman", priceLevel: 2, rating: 4.5, description: "Charming ivy-covered terrace in Trastevere with superb fried artichokes.", specialtyDish: "Carciofi alla Giudia", address: "Trastevere, Rome" },
      { name: "Il Pagliaccio", cuisine: "Modern Italian", priceLevel: 4, rating: 4.8, description: "Two-Michelin-star restaurant blending Italian tradition with Japanese influences.", specialtyDish: "Creative Tasting Menu", address: "Centro Storico, Rome" },
    ],
    instagramSpots: [
      { name: "Colosseum at Golden Hour", description: "The ancient amphitheatre bathed in warm golden light.", whyFamous: "The ultimate Rome shot — 2,000 years of history glowing at sunset.", bestTimeToVisit: "1 hour before sunset", hashtag: "#Colosseum", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
      { name: "Trevi Fountain", description: "The magnificent baroque fountain lit up at night.", whyFamous: "Dramatic sculptures, cascading water, and blue lighting make this pure Instagram gold.", bestTimeToVisit: "Late night (after 11 PM) for no crowds", hashtag: "#TreviFountain", imageUrl: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400" },
      { name: "Trastevere Streets", description: "Narrow cobblestone streets draped in ivy and warm lamplight.", whyFamous: "The most photogenic neighbourhood in Rome — every corner looks like a movie set.", bestTimeToVisit: "Evening for warm street lights", hashtag: "#Trastevere", imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400" },
      { name: "St. Peter's Basilica Dome", description: "The view from inside the dome looking down into the basilica.", whyFamous: "The geometric patterns and sheer scale create a mind-bending perspective shot.", bestTimeToVisit: "Early morning", hashtag: "#StPeters", imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400" },
      { name: "Orange Garden (Giardino degli Aranci)", description: "A hilltop garden with a stunning view of St. Peter's dome framed by orange trees.", whyFamous: "A hidden gem — the dome of St. Peter's perfectly framed through a keyhole-like view.", bestTimeToVisit: "Sunset", hashtag: "#OrangeGarden", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
    ],
    flights: [
      { airline: "Ryanair", departureTime: "06:30", arrivalTime: "10:00", duration: "2h 30m", cabinClass: "economy", price: 35, stops: 0 },
      { airline: "British Airways", departureTime: "08:00", arrivalTime: "11:30", duration: "2h 30m", cabinClass: "economy", price: 110, stops: 0 },
      { airline: "Alitalia", departureTime: "10:00", arrivalTime: "13:20", duration: "2h 20m", cabinClass: "economy", price: 95, stops: 0 },
      { airline: "British Airways", departureTime: "08:00", arrivalTime: "11:30", duration: "2h 30m", cabinClass: "business", price: 420, stops: 0 },
      { airline: "Alitalia", departureTime: "10:00", arrivalTime: "13:20", duration: "2h 20m", cabinClass: "business", price: 380, stops: 0 },
    ],
  },
  {
    name: "Bangkok",
    country: "Thailand",
    continent: "Asia",
    slug: "bangkok",
    description:
      "A sensory overload of ornate temples, bustling street markets, vibrant nightlife, and some of the most exciting street food on the planet.",
    imageUrl:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
    language: "Thai",
    currency: "THB (฿)",
    timezone: "ICT (UTC+7)",
    bestTimeToVisit: "Nov - Feb",
    averageTemp: "28°C",
    topSightseeing: [
      { name: "Grand Palace", description: "A dazzling complex of royal buildings and the sacred Temple of the Emerald Buddha.", rating: 4.8, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "landmark" },
      { name: "Wat Arun", description: "The Temple of Dawn with its iconic porcelain-decorated spires on the Chao Phraya River.", rating: 4.7, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "cultural" },
      { name: "Chatuchak Weekend Market", description: "One of the world's largest outdoor markets with over 15,000 stalls.", rating: 4.6, estimatedTime: "4 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Wat Pho", description: "Home to the enormous 46-metre reclining golden Buddha and a famous massage school.", rating: 4.7, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "cultural" },
      { name: "Khao San Road", description: "Bangkok's legendary backpacker street — vibrant, chaotic, and full of life.", rating: 4.2, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "cultural" },
      { name: "Jim Thompson House", description: "The beautifully preserved traditional Thai house of the American silk entrepreneur.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "museum" },
      { name: "Lumphini Park", description: "Bangkok's answer to Central Park — a green oasis with lakes, trails, and monitor lizards.", rating: 4.4, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "nature" },
      { name: "Chinatown (Yaowarat)", description: "A bustling district that comes alive at night with incredible street food and neon signs.", rating: 4.6, estimatedTime: "2.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "cultural" },
      { name: "Mahanakhon SkyWalk", description: "A thrilling glass-floor observation deck on Bangkok's tallest building.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "adventure" },
      { name: "Floating Markets", description: "Traditional markets on the canals where vendors sell food and goods from boats.", rating: 4.4, estimatedTime: "4 hrs", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", category: "cultural" },
    ],
    foodSpots: [
      { name: "Jay Fai", cuisine: "Thai Street Food", priceLevel: 3, rating: 4.8, description: "The legendary Michelin-starred street food queen, famous for her crab omelette.", specialtyDish: "Crab Omelette", address: "Mahachai Rd, Bangkok" },
      { name: "Pad Thai Thip Samai", cuisine: "Thai", priceLevel: 1, rating: 4.6, description: "The most famous pad thai in Bangkok — wrapped in a crispy egg blanket.", specialtyDish: "Superb Pad Thai", address: "Phra Nakhon, Bangkok" },
      { name: "Som Tam Nua", cuisine: "Isaan Thai", priceLevel: 1, rating: 4.5, description: "Famous for its spicy green papaya salad and crispy fried chicken.", specialtyDish: "Som Tam (Papaya Salad)", address: "Siam Square, Bangkok" },
      { name: "Gaggan Anand", cuisine: "Progressive Indian", priceLevel: 4, rating: 4.9, description: "Multiple-time Asia's Best Restaurant winner with a playful emoji tasting menu.", specialtyDish: "25-Course Emoji Menu", address: "Sukhumvit, Bangkok" },
      { name: "Raan Jay Fai", cuisine: "Thai Seafood", priceLevel: 2, rating: 4.6, description: "The ultimate drunken noodles with perfectly seared seafood.", specialtyDish: "Drunken Noodles with Seafood", address: "Old Town, Bangkok" },
      { name: "Yaowarat Street Food", cuisine: "Chinese-Thai", priceLevel: 1, rating: 4.5, description: "Chinatown's legendary street food strip — everything from roast duck to mango sticky rice.", specialtyDish: "Roast Duck on Rice", address: "Yaowarat, Bangkok" },
      { name: "Nai Mong Hoi Tod", cuisine: "Thai", priceLevel: 1, rating: 4.4, description: "Crispy oyster omelette cooked in blazing woks on the street.", specialtyDish: "Hoi Tod (Oyster Omelette)", address: "Yaowarat, Bangkok" },
      { name: "Nahm", cuisine: "Thai Fine Dining", priceLevel: 4, rating: 4.7, description: "One-Michelin-star restaurant offering refined, complex Thai flavours.", specialtyDish: "Southern Thai Curry", address: "Sathorn, Bangkok" },
      { name: "Or Tor Kor Market", cuisine: "Market", priceLevel: 2, rating: 4.5, description: "Bangkok's finest fresh market — tropical fruits, curries, and Thai desserts.", specialtyDish: "Mango Sticky Rice", address: "Chatuchak, Bangkok" },
      { name: "After You", cuisine: "Dessert", priceLevel: 2, rating: 4.4, description: "Hugely popular Thai dessert café famous for its honey toast and kakigori.", specialtyDish: "Shibuya Honey Toast", address: "Various locations, Bangkok" },
    ],
    instagramSpots: [
      { name: "Wat Arun at Sunrise", description: "The Temple of Dawn glowing across the Chao Phraya River.", whyFamous: "The ornate spires lit by the rising sun with the river in the foreground — magical.", bestTimeToVisit: "Sunrise from the east bank", hashtag: "#WatArun", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
      { name: "Mahanakhon SkyWalk Glass Floor", description: "Standing on the glass floor 314 metres above Bangkok.", whyFamous: "The vertigo-inducing glass floor shot with the city grid far below your feet.", bestTimeToVisit: "Sunset for golden hour views", hashtag: "#MahanakhonSkyWalk", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
      { name: "Yaowarat Neon Street", description: "Chinatown's main road glowing with neon signs and street food smoke.", whyFamous: "Neon Chinese characters, tuk-tuks, and food stalls create an electric atmosphere.", bestTimeToVisit: "After dark (7-10 PM)", hashtag: "#BangkokChinatown", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
      { name: "Giant Swing (Sao Ching Cha)", description: "A towering red ceremonial swing in the old city.", whyFamous: "The striking red structure against blue sky or golden temple backdrop.", bestTimeToVisit: "Morning", hashtag: "#GiantSwing", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
      { name: "Train Market (Talad Rod Fai)", description: "A massive night market in a retro train yard setting.", whyFamous: "Aerial views of the colourful tent tops stretching endlessly — drone shots go viral.", bestTimeToVisit: "Evening (5-10 PM)", hashtag: "#TrainMarket", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
    ],
    flights: [
      { airline: "Thai Airways", departureTime: "21:30", arrivalTime: "15:30+1", duration: "11h 00m", cabinClass: "economy", price: 420, stops: 0 },
      { airline: "Emirates", departureTime: "20:00", arrivalTime: "17:00+1", duration: "14h 00m", cabinClass: "economy", price: 380, stops: 1 },
      { airline: "British Airways", departureTime: "09:00", arrivalTime: "05:30+1", duration: "13h 30m", cabinClass: "economy", price: 450, stops: 1 },
      { airline: "Thai Airways", departureTime: "21:30", arrivalTime: "15:30+1", duration: "11h 00m", cabinClass: "business", price: 2800, stops: 0 },
      { airline: "Emirates", departureTime: "20:00", arrivalTime: "17:00+1", duration: "14h 00m", cabinClass: "business", price: 3200, stops: 1 },
      { airline: "Thai Airways", departureTime: "21:30", arrivalTime: "15:30+1", duration: "11h 00m", cabinClass: "first", price: 7500, stops: 0 },
    ],
  },
  {
    name: "London",
    country: "United Kingdom",
    continent: "Europe",
    slug: "london",
    description:
      "A global capital blending centuries of royal heritage with cutting-edge culture, iconic landmarks, world-class museums, and an incredibly diverse food scene.",
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    language: "English",
    currency: "GBP (£)",
    timezone: "GMT (UTC+0)",
    bestTimeToVisit: "May - Sep",
    averageTemp: "11°C",
    topSightseeing: [
      { name: "Tower of London", description: "A 1,000-year-old castle housing the Crown Jewels and centuries of royal intrigue.", rating: 4.7, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "landmark" },
      { name: "British Museum", description: "One of the world's greatest museums with free entry — from the Rosetta Stone to Egyptian mummies.", rating: 4.8, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "museum" },
      { name: "Buckingham Palace", description: "The official London residence of the monarch — catch the Changing of the Guard.", rating: 4.5, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "landmark" },
      { name: "Westminster Abbey", description: "A Gothic masterpiece where monarchs have been crowned since 1066.", rating: 4.7, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "landmark" },
      { name: "South Bank & London Eye", description: "A vibrant riverside walk with street performers, the London Eye, and Tate Modern.", rating: 4.5, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "cultural" },
      { name: "Tower Bridge", description: "London's iconic Victorian bascule bridge with glass-floor walkways.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "landmark" },
      { name: "Hyde Park", description: "One of London's largest royal parks — perfect for boating, picnics, and the Serpentine Gallery.", rating: 4.5, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "nature" },
      { name: "Borough Market", description: "London's oldest and most famous food market, packed with artisan producers.", rating: 4.7, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Natural History Museum", description: "A stunning Romanesque building housing dinosaur skeletons and a massive blue whale.", rating: 4.7, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "museum" },
      { name: "Camden Market", description: "An eclectic market in North London bursting with street food, vintage fashion, and live music.", rating: 4.4, estimatedTime: "2.5 hrs", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", category: "cultural" },
    ],
    foodSpots: [
      { name: "Dishoom", cuisine: "Indian", priceLevel: 2, rating: 4.7, description: "Bombay-inspired café serving the best bacon naan roll and black daal in London.", specialtyDish: "Black Daal", address: "Covent Garden, London" },
      { name: "Sketch (The Gallery)", cuisine: "Modern European", priceLevel: 4, rating: 4.6, description: "A pink-hued, Instagram-famous restaurant with Michelin-quality food and whimsical decor.", specialtyDish: "Afternoon Tea", address: "Mayfair, London" },
      { name: "Borough Market Stalls", cuisine: "Various", priceLevel: 1, rating: 4.6, description: "London's best food market — raclette, paella, scotch eggs, and more.", specialtyDish: "Raclette Cheese", address: "Southwark, London" },
      { name: "Padella", cuisine: "Italian", priceLevel: 2, rating: 4.7, description: "Handmade pasta at incredible prices — always a queue, always worth it.", specialtyDish: "Pici Cacio e Pepe", address: "Borough Market, London" },
      { name: "The Ledbury", cuisine: "Modern British", priceLevel: 4, rating: 4.8, description: "Two-Michelin-star restaurant with inventive British cuisine.", specialtyDish: "Flame-grilled Mackerel", address: "Notting Hill, London" },
      { name: "Bao", cuisine: "Taiwanese", priceLevel: 2, rating: 4.5, description: "Iconic steamed bao buns with inventive fillings in a tiny Soho spot.", specialtyDish: "Classic Bao", address: "Soho, London" },
      { name: "Flat Iron", cuisine: "Steak", priceLevel: 2, rating: 4.5, description: "One cut, one price — incredible flat iron steak with unlimited salad.", specialtyDish: "Flat Iron Steak", address: "Various locations, London" },
      { name: "E Pellicci", cuisine: "Italian Café", priceLevel: 1, rating: 4.5, description: "A family-run East End café since 1900 with an Art Deco interior and full English breakfasts.", specialtyDish: "Full English Breakfast", address: "Bethnal Green, London" },
      { name: "Hawksmoor", cuisine: "Steakhouse", priceLevel: 3, rating: 4.7, description: "London's finest steakhouse using the best British-reared beef.", specialtyDish: "Bone-in Prime Rib", address: "Various locations, London" },
      { name: "The Wolseley", cuisine: "European", priceLevel: 3, rating: 4.5, description: "A grand café-restaurant on Piccadilly, perfect for a classic London breakfast.", specialtyDish: "Eggs Benedict", address: "Piccadilly, London" },
    ],
    instagramSpots: [
      { name: "Tower Bridge at Blue Hour", description: "The iconic bridge lit up in blue and white against a twilight sky.", whyFamous: "The symmetry of the twin towers and chains create a stunning composition.", bestTimeToVisit: "Blue hour (just after sunset)", hashtag: "#TowerBridge", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
      { name: "Notting Hill Colourful Houses", description: "Rows of pastel-coloured Georgian townhouses in West London.", whyFamous: "Candy-coloured facades that look like a Wes Anderson movie set.", bestTimeToVisit: "Morning on weekdays", hashtag: "#NottingHill", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
      { name: "Sky Garden", description: "A free-entry rooftop garden with 360° views of the London skyline.", whyFamous: "Lush tropical plants with panoramic city views — looks like a jungle in the sky.", bestTimeToVisit: "Sunset (book free tickets in advance)", hashtag: "#SkyGarden", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
      { name: "Neal's Yard", description: "A tiny hidden courtyard in Covent Garden with rainbow-coloured buildings.", whyFamous: "The most colourful spot in London — every wall is a different vivid shade.", bestTimeToVisit: "Midday for best light", hashtag: "#NealsYard", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
      { name: "St Paul's from Millennium Bridge", description: "The dome of St Paul's Cathedral framed by the Millennium Bridge.", whyFamous: "A perfect leading-lines shot — the bridge draws your eye straight to the dome.", bestTimeToVisit: "Early morning", hashtag: "#StPaulsCathedral", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
    ],
    flights: [
      { airline: "British Airways", departureTime: "Domestic", arrivalTime: "N/A", duration: "N/A", cabinClass: "economy", price: 0, stops: 0 },
    ],
  },
  {
    name: "Barcelona",
    country: "Spain",
    continent: "Europe",
    slug: "barcelona",
    description:
      "A Mediterranean gem where Gaudí's surreal architecture meets golden beaches, world-class nightlife, and an unrivalled tapas culture.",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
    language: "Spanish / Catalan",
    currency: "EUR (€)",
    timezone: "CET (UTC+1)",
    bestTimeToVisit: "May - Jun",
    averageTemp: "16°C",
    topSightseeing: [
      { name: "Sagrada Família", description: "Gaudí's unfinished masterpiece — a jaw-dropping basilica that's been under construction since 1882.", rating: 4.9, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "landmark" },
      { name: "Park Güell", description: "A whimsical public park with colourful mosaic-covered structures designed by Gaudí.", rating: 4.7, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "landmark" },
      { name: "La Boqueria Market", description: "Barcelona's most famous food market on La Rambla, bursting with colour and flavour.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Gothic Quarter", description: "A labyrinth of medieval streets, hidden squares, and centuries-old churches.", rating: 4.7, estimatedTime: "2.5 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "cultural" },
      { name: "Casa Batlló", description: "Gaudí's dreamlike apartment building with a dragon-scaled roof and organic forms.", rating: 4.8, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "landmark" },
      { name: "Barceloneta Beach", description: "The city's most popular beach — golden sand, seafood restaurants, and Mediterranean vibes.", rating: 4.4, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "nature" },
      { name: "Picasso Museum", description: "An extensive collection of Picasso's early works in five adjoining medieval palaces.", rating: 4.6, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "museum" },
      { name: "La Rambla", description: "Barcelona's most famous tree-lined pedestrian boulevard stretching to the sea.", rating: 4.3, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "cultural" },
      { name: "Montjuïc Hill & Magic Fountain", description: "A hilltop fortress with gardens, museums, and a spectacular evening fountain show.", rating: 4.5, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "adventure" },
      { name: "Camp Nou", description: "FC Barcelona's legendary stadium and museum — a pilgrimage for football fans.", rating: 4.5, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", category: "landmark" },
    ],
    foodSpots: [
      { name: "Tickets", cuisine: "Creative Tapas", priceLevel: 3, rating: 4.8, description: "Albert Adrià's fun, circus-themed tapas bar with mind-blowing molecular creations.", specialtyDish: "Liquid Olive", address: "Parallel, Barcelona" },
      { name: "Can Culleretes", cuisine: "Catalan", priceLevel: 2, rating: 4.4, description: "Barcelona's oldest restaurant (1786) serving traditional Catalan home cooking.", specialtyDish: "Escudella (Catalan Stew)", address: "Gothic Quarter, Barcelona" },
      { name: "Bar Mut", cuisine: "Tapas", priceLevel: 3, rating: 4.6, description: "Elegant neighbourhood tapas bar with exceptional wine selection and classic bites.", specialtyDish: "Jamón Ibérico", address: "Eixample, Barcelona" },
      { name: "La Boqueria Stalls", cuisine: "Market Food", priceLevel: 1, rating: 4.5, description: "Fresh fruit smoothies, seafood cones, and jamón straight from the market.", specialtyDish: "Mixed Seafood Cone", address: "La Rambla, Barcelona" },
      { name: "Cervecería Catalana", cuisine: "Tapas", priceLevel: 2, rating: 4.5, description: "One of Barcelona's most popular tapas bars — vibrant, bustling, and delicious.", specialtyDish: "Patatas Bravas", address: "Eixample, Barcelona" },
      { name: "Disfrutar", cuisine: "Modern Spanish", priceLevel: 4, rating: 4.9, description: "Two-Michelin-star restaurant recently named the World's Best Restaurant.", specialtyDish: "Multi-Spherical Pesto", address: "Eixample, Barcelona" },
      { name: "El Xampanyet", cuisine: "Tapas & Cava", priceLevel: 1, rating: 4.4, description: "Tiny, buzzing tapas bar famous for cheap cava and anchovies since 1929.", specialtyDish: "Anchovies & Cava", address: "Born, Barcelona" },
      { name: "Can Paixano (La Xampanyeria)", cuisine: "Spanish", priceLevel: 1, rating: 4.3, description: "Standing-room-only cava bar in Barceloneta — dirt cheap cava and sandwiches.", specialtyDish: "Rosé Cava & Bocadillo", address: "Barceloneta, Barcelona" },
      { name: "ABaC", cuisine: "Modern Catalan", priceLevel: 4, rating: 4.8, description: "Three-Michelin-star temple of avant-garde Catalan cuisine.", specialtyDish: "Tasting Menu", address: "Tibidabo, Barcelona" },
      { name: "Flax & Kale", cuisine: "Healthy/Flexitarian", priceLevel: 2, rating: 4.4, description: "Trendy health-focused restaurant with creative plant-based dishes.", specialtyDish: "Green Pizza", address: "Raval, Barcelona" },
    ],
    instagramSpots: [
      { name: "Sagrada Família Interior", description: "The kaleidoscopic stained glass light show inside the basilica.", whyFamous: "Rainbow light floods through the windows creating an otherworldly interior — truly breathtaking.", bestTimeToVisit: "Morning for east-facing light", hashtag: "#SagradaFamilia", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { name: "Park Güell Mosaic Terrace", description: "Gaudí's colourful mosaic bench with Barcelona and the sea behind.", whyFamous: "The wavy mosaic bench overlooking the whole city — Gaudí's vision at its most playful.", bestTimeToVisit: "Opening time (8:30 AM)", hashtag: "#ParkGuell", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { name: "Bunkers del Carmel", description: "A hilltop viewpoint with 360° views of Barcelona.", whyFamous: "The best panoramic view of Barcelona — locals' secret that's now an Instagram legend.", bestTimeToVisit: "Sunset", hashtag: "#BunkersDelCarmel", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { name: "Casa Batlló Facade", description: "Gaudí's flowing, skeletal facade with iridescent tiles.", whyFamous: "Looks like a building from a dream — the organic shapes and colours are mesmerising.", bestTimeToVisit: "Afternoon for best lighting", hashtag: "#CasaBatllo", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { name: "Gothic Quarter Alleyways", description: "Narrow medieval streets with overhead bridges and dramatic shadows.", whyFamous: "The moody lighting and ancient stone create atmospheric, cinematic shots.", bestTimeToVisit: "Midday for dramatic overhead light", hashtag: "#BarcelonaGothic", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
    ],
    flights: [
      { airline: "Vueling", departureTime: "07:00", arrivalTime: "10:15", duration: "2h 15m", cabinClass: "economy", price: 40, stops: 0 },
      { airline: "British Airways", departureTime: "09:30", arrivalTime: "12:45", duration: "2h 15m", cabinClass: "economy", price: 95, stops: 0 },
      { airline: "EasyJet", departureTime: "11:00", arrivalTime: "14:15", duration: "2h 15m", cabinClass: "economy", price: 35, stops: 0 },
      { airline: "British Airways", departureTime: "09:30", arrivalTime: "12:45", duration: "2h 15m", cabinClass: "business", price: 380, stops: 0 },
      { airline: "Iberia", departureTime: "14:00", arrivalTime: "17:15", duration: "2h 15m", cabinClass: "business", price: 350, stops: 0 },
    ],
  },
  {
    name: "Florence",
    country: "Italy",
    continent: "Europe",
    slug: "florence",
    description:
      "The birthplace of the Renaissance — a compact city overflowing with artistic treasures, stunning architecture, incredible Tuscan food, and rolling hillside views.",
    imageUrl:
      "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=800",
    language: "Italian",
    currency: "EUR (€)",
    timezone: "CET (UTC+1)",
    bestTimeToVisit: "Apr - Jun",
    averageTemp: "14°C",
    topSightseeing: [
      { name: "Uffizi Gallery", description: "One of the world's most important art galleries with works by Botticelli, Leonardo, and Michelangelo.", rating: 4.9, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "museum" },
      { name: "Florence Cathedral (Duomo)", description: "Brunelleschi's magnificent dome dominates the skyline — climb 463 steps for incredible views.", rating: 4.8, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "landmark" },
      { name: "Ponte Vecchio", description: "A medieval stone bridge lined with jewellery shops, spanning the Arno River since 1345.", rating: 4.6, estimatedTime: "30 min", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "landmark" },
      { name: "Galleria dell'Accademia", description: "Home to Michelangelo's David — one of the most recognised sculptures in the world.", rating: 4.8, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "museum" },
      { name: "Palazzo Pitti & Boboli Gardens", description: "A massive Renaissance palace with opulent rooms and spectacular terraced gardens.", rating: 4.6, estimatedTime: "3 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "landmark" },
      { name: "Piazzale Michelangelo", description: "A hilltop square offering the most famous panoramic view of Florence.", rating: 4.7, estimatedTime: "1 hr", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "nature" },
      { name: "San Lorenzo Market", description: "A lively outdoor market for leather goods surrounded by food stalls.", rating: 4.4, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", category: "cultural" },
      { name: "Basilica di Santa Croce", description: "The burial place of Michelangelo, Galileo, and Machiavelli with stunning frescoes.", rating: 4.6, estimatedTime: "1.5 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "cultural" },
      { name: "Oltrarno Quarter", description: "The artisan quarter across the Arno — workshops, trattorias, and authentic Florentine life.", rating: 4.5, estimatedTime: "2 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "cultural" },
      { name: "Chianti Day Trip", description: "Rolling Tuscan hills, vineyards, and medieval villages just outside Florence.", rating: 4.7, estimatedTime: "6 hrs", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400", category: "adventure" },
    ],
    foodSpots: [
      { name: "Trattoria Mario", cuisine: "Tuscan", priceLevel: 1, rating: 4.6, description: "No-frills, communal-table trattoria that's been serving hearty Tuscan food since 1953.", specialtyDish: "Bistecca alla Fiorentina", address: "San Lorenzo, Florence" },
      { name: "All'Antico Vinaio", cuisine: "Sandwiches", priceLevel: 1, rating: 4.7, description: "The world-famous sandwich shop with queues down the street — massive, stuffed schiacciata.", specialtyDish: "La Favolosa", address: "Near Uffizi, Florence" },
      { name: "Enoteca Pinchiorri", cuisine: "Italian Fine Dining", priceLevel: 4, rating: 4.8, description: "Three-Michelin-star restaurant with one of Italy's greatest wine cellars.", specialtyDish: "Tasting Menu with Wine Pairing", address: "Santa Croce, Florence" },
      { name: "Mercato Centrale", cuisine: "Market Food", priceLevel: 1, rating: 4.5, description: "A stunning food hall on the upper floor of San Lorenzo Market with artisan vendors.", specialtyDish: "Lampredotto Sandwich", address: "San Lorenzo, Florence" },
      { name: "Il Latini", cuisine: "Tuscan", priceLevel: 3, rating: 4.5, description: "A boisterous, old-school Tuscan restaurant with hanging hams and flowing Chianti.", specialtyDish: "Bistecca alla Fiorentina", address: "Santa Maria Novella, Florence" },
      { name: "Buca Mario", cuisine: "Tuscan", priceLevel: 3, rating: 4.4, description: "Florence's oldest restaurant (1886) serving classic Tuscan cuisine in a cellar setting.", specialtyDish: "Ribollita", address: "Centro, Florence" },
      { name: "Vivoli", cuisine: "Gelato", priceLevel: 1, rating: 4.5, description: "Florence's most famous gelateria since 1930 — rich, creamy, and traditional.", specialtyDish: "Crema Gelato", address: "Santa Croce, Florence" },
      { name: "Trattoria Sostanza", cuisine: "Tuscan", priceLevel: 2, rating: 4.6, description: "A legendary no-menu spot famous for its butter chicken and artichoke omelette.", specialtyDish: "Pollo al Burro (Butter Chicken)", address: "Centro, Florence" },
      { name: "Da Nerbone", cuisine: "Tuscan Street Food", priceLevel: 1, rating: 4.4, description: "Inside San Lorenzo Market since 1872 — the original lampredotto sandwich.", specialtyDish: "Lampredotto", address: "Mercato Centrale, Florence" },
      { name: "Ora d'Aria", cuisine: "Modern Tuscan", priceLevel: 4, rating: 4.7, description: "One-Michelin-star creative Tuscan cuisine near the Uffizi.", specialtyDish: "Pigeon with Truffle", address: "Near Uffizi, Florence" },
    ],
    instagramSpots: [
      { name: "Piazzale Michelangelo Sunset", description: "The terrace overlooking all of Florence with the Duomo, Ponte Vecchio, and Arno.", whyFamous: "THE Florence panoramic shot — the entire Renaissance skyline in one frame at golden hour.", bestTimeToVisit: "30 minutes before sunset", hashtag: "#PiazzaleMichelangelo", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400" },
      { name: "Ponte Vecchio at Sunset", description: "The medieval bridge glowing golden as the sun sets over the Arno.", whyFamous: "A 700-year-old bridge reflecting in the river — timeless romance.", bestTimeToVisit: "Golden hour from Ponte Santa Trinita", hashtag: "#PonteVecchio", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400" },
      { name: "Duomo Close-Up", description: "The intricate marble facade of the cathedral in pink, green, and white.", whyFamous: "The sheer detail and scale of the marble work is overwhelming up close.", bestTimeToVisit: "Early morning for soft light", hashtag: "#FlorenceDuomo", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400" },
      { name: "Boboli Gardens", description: "Renaissance gardens behind Palazzo Pitti with sculptures and fountains.", whyFamous: "Manicured hedges, ancient statues, and the Florence skyline in the distance.", bestTimeToVisit: "Morning", hashtag: "#BoboliGardens", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400" },
      { name: "Oltrarno Artisan Streets", description: "Narrow streets with craftsmen's workshops and ivy-covered walls.", whyFamous: "Authentic, non-touristy Florence — leather workshops, tiny trattorias, and Vespa-lined streets.", bestTimeToVisit: "Late afternoon", hashtag: "#Oltrarno", imageUrl: "https://images.unsplash.com/photo-1543429776-2782f8f3fcdb?w=400" },
    ],
    flights: [
      { airline: "Ryanair", departureTime: "06:30", arrivalTime: "10:00", duration: "2h 30m", cabinClass: "economy", price: 40, stops: 0 },
      { airline: "British Airways", departureTime: "10:00", arrivalTime: "13:30", duration: "2h 30m", cabinClass: "economy", price: 120, stops: 0 },
      { airline: "Vueling", departureTime: "14:00", arrivalTime: "17:30", duration: "2h 30m", cabinClass: "economy", price: 55, stops: 0 },
      { airline: "British Airways", departureTime: "10:00", arrivalTime: "13:30", duration: "2h 30m", cabinClass: "business", price: 450, stops: 0 },
    ],
  },
];
