/**
 * ═══════════════════════════════════════════════════════════
 *  PERSONALIZATION CONFIG — Soo's Birthday
 * ═══════════════════════════════════════════════════════════
 */
const BIRTHDAY_CONFIG = {
  // ── Basic Info ──────────────────────────────────────────
  name: "Soo",
  yourName: "Atharva",
  birthdayDate: "2026-08-11",
  age: 20,

  // ── Theme Colors ────────────────────────────────────────
  colors: {
    primary: "#ff6b9d",
    secondary: "#c44dff",
    accent: "#ffd93d",
    background: "#0a0a1a",
    text: "#ffffff",
    glow: "#ff6b9d",
  },

  // ── Loading Screen ──────────────────────────────────────
  loadingMessages: [
    "Preparing something special...",
    "Decorating your surprise...",
    "Adding a little magic...",
    "Almost ready...",
    "Welcome, Soo ❤️",
  ],

  // ── Welcome Screen ──────────────────────────────────────
  welcomeTitle: "Happy Birthday, Soo! 🎉",
  welcomeSubtitle:
    "Today is your day, and I hope it brings you endless smiles, happiness, and beautiful memories.",
  welcome: {
    buttonText: "Open Your Surprise ✨",
  },

  // ── Birthday Cake ───────────────────────────────────────
  cake: {
    message:
      "Close your eyes, make a wish, and blow out the candles. May every wish you make today find its way to you. 🎂",
    candleCount: 5,
    blowSensitivity: 0.15,
  },

  // ── Birthday Wishes ─────────────────────────────────────
  wishes: [
    "Happy Birthday, Soo! 🎂 Wishing you a day filled with love, laughter, and countless beautiful moments.",
    "May this new chapter of your life bring happiness, success, good health, and endless opportunities.",
    "Keep smiling because your smile makes the world a little brighter.",
    "May every dream you chase become a beautiful reality.",
    "I hope today becomes one of the happiest days of your life.",
    "May every sunrise bring new hope and every sunset leave you with beautiful memories.",
    "You deserve every bit of happiness this world has to offer.",
    "Never stop believing in yourself—you are stronger and more capable than you know.",
    "Happy Birthday once again, Soo. May your life always be filled with peace, joy, and love.",
  ],

  // ── Inspirational Quotes ────────────────────────────────
  quotes: [
    "Every birthday is a fresh beginning.",
    "Smile more. Worry less.",
    "The best moments are still waiting for you.",
    "May happiness always find its way to you.",
    "Dream without limits.",
    "Stay kind. Stay happy. Stay amazing.",
    "Life becomes beautiful when we celebrate every little moment.",
    "Today belongs to you—enjoy every second.",
  ],

  // ── Photo Gallery ───────────────────────────────────────
  galleryTitle: "Beautiful Memories 📸",
  welcomePhoto: "assets/photos/photo5.png",
  photos: [
    { src: "assets/photos/photo1.png", caption: "That beautiful smile of yours ✨" },
    { src: "assets/photos/photo2.png", caption: "Lost in the tea gardens 🌿" },
    { src: "assets/photos/photo3.png", caption: "Views that take your breath away 🏔️" },
    { src: "assets/photos/photo4.png", caption: "Peaceful moments in the mountains ☁️" },
    { src: "assets/photos/photo5.png", caption: "Every moment with you is special 💫" },
    { src: "assets/photos/photo6.png", caption: "Golden hour, golden memories 🌅" },
    { src: "assets/photos/photo7.png", caption: "Adventures on the open road 🛣️" },
    { src: "assets/photos/photo8.png", caption: "Joy in every adventure 🐘" },
    { src: "assets/photos/photo9.png", caption: "Unforgettable moments together ❤️" },
  ],

  // ── Memory Cards (Little Chapters) ───────────────────────
  timelineTitle: "Little Chapters",
  timelineSubtitle: "Tap a card to flip it open ✨",
  timeline: [
    {
      emoji: "😄",
      title: "That Laugh",
      message: "Your laugh is contagious — the kind that makes ordinary days feel a little brighter.",
    },
    {
      emoji: "💬",
      title: "Our Chats",
      message: "Every conversation with you feels easy, fun, and genuinely real. Never change that.",
    },
    {
      emoji: "✨",
      title: "Your Energy",
      message: "You carry this calm confidence that makes everything around you feel lighter.",
    },
    {
      emoji: "🌟",
      title: "That Smile",
      message: "Honestly? Your smile is unfairly beautiful. I hope it never fades.",
    },
    {
      emoji: "🎯",
      title: "Your Dreams",
      message: "Keep chasing what you want — you're stronger and more capable than you know.",
    },
    {
      emoji: "🎂",
      title: "Today",
      message: "Happy Birthday, Soo. This little website was made just for you. Enjoy every second of today. ❤️",
    },
  ],

  // ── Personal Letter ─────────────────────────────────────
  letter: `Dear Soo ❤️,

Happy Birthday!! 🎉🎂

Finally, your special day is here!

I just wanted to take a moment to wish you a birthday filled with genuine happiness, endless laughter, delicious cake, and beautiful surprises.

You have a wonderful way of making conversations fun and bringing positive energy wherever you go. I truly hope your smile never fades.

May this year bless you with success in everything you do, good health, peace of mind, amazing opportunities, and countless unforgettable memories.

Keep smiling.
Keep believing in yourself.
Keep chasing your dreams.
Never let anything stop you from becoming the amazing person you're meant to be.

Thank you for being exactly who you are.

Enjoy every moment today.
Take lots of pictures.
Laugh a little louder.
Smile a little brighter.
And make this birthday one you'll always remember.

And yes...
Today I'll let you win every argument. 😄❤️

Happy Birthday once again, Soo!

Wishing you nothing but happiness, success, and beautiful moments always.

With Best Wishes,

Atharva ❤️`,
  letterButton: "Read My Letter ❤️",

  // ── Gift Box Surprise ───────────────────────────────────
  gift: {
    message: `🎁

This website is a small surprise made especially for you.

I hope it brings a smile to your face and makes your birthday a little more special.

Happy Birthday, Soo! ❤️`,
    buttonText: "Open Your Surprise 🎁",
    emoji: "🎁",
  },

  // ── Music ───────────────────────────────────────────────
  music: {
    enabled: true,
    src: "assets/music/birthday-song.mp3",
    volume: 0.3,
    message: "Let the celebration begin! 🎵",
  },

  // ── Finale ──────────────────────────────────────────────
  finale: {
    title: "Happy Birthday, Soo ❤️",
    message: `Thank you for taking this little birthday journey.

I hope it made you smile, even if just for a moment.

May your heart always be filled with happiness, your dreams always find their way to reality, and your life always be surrounded by people who truly care about you.

Have an unforgettable birthday and an even more wonderful year ahead.

Happy Birthday once again, Soo! 🎉🎂❤️

— Atharva`,
  },
};
