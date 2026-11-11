import type ja from "./ja";

/**
 * ja.ts と同じキー構造であることをコンパイル時に強制する型。
 * ja は as const でリテラル型になっているため、値まで一致させず
 * 文字列は string へ広げて「構造だけ」を比較する。
 */
type Shape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends (...args: never[]) => unknown
      ? T[K]
      : Shape<T[K]>;
};

export default {
  site: {
    name: "Sapporo Chess Club",
    // JSON-LD の alternateName: 検索エンジンに他言語名を知らせる（表示言語の逆側の名前）
    alternateName: "札幌チェスクラブ",
    description:
      "Sapporo Chess Club is a community for chess enthusiasts in Hokkaido. We hold meetups twice a month and three official tournaments a year. Observation is free, beginners welcome.",
  },
  seo: {
    home: {
      titleSuffix: "Chess Meetups & Tournaments in Hokkaido",
      description:
        "Official site of Sapporo Chess Club. A community of chess players in Hokkaido, Japan — twice-monthly meetups and three annual tournaments (Hokkaido Chess Championship and more). Free observation, visitors welcome.",
    },
    schedule: {
      description:
        "Annual schedule for Sapporo Chess Club meetups and tournaments (Hokkaido Chess Championship, Sapporo Open, and more) — twice-monthly meetings and three official tournaments per year.",
    },
    tournaments: {
      description:
        "Tournament archive of Sapporo Chess Club from 2000 to present. Details PDFs, results PDFs, and PGN game records. Hokkaido Chess Championship and more.",
    },
    announcementsList: {
      description:
        "Latest news and announcements from Sapporo Chess Club — meetup reports, tournament notices, and venue updates.",
    },
    announcementsArchive: {
      description:
        "Archive of past Sapporo Chess Club announcements. Browse older meetup reports and tournament notices by year.",
    },
  },
  nav: {
    home: "Home",
    tournaments: "Tournaments",
    skipToMain: "Skip to main content",
    openInNewTab: "(opens in new tab)",
    switchLanguage: "日本語に切り替え",
    close: "閉じる",
    languageShort: "JA",
    languageFull: "日本語",
    // aria-label 用。ホームリンクは可視テキスト "SAPPORO CHESS CLUB" を含める (label-in-name)
    homeLink: "SAPPORO CHESS CLUB — Home",
    mainNav: "Main navigation",
    breadcrumb: "Breadcrumb",
  },
  hero: {
    subtitle: "A community for chess enthusiasts in Hokkaido. Beginners welcome.",
  },
  nextEvent: {
    meeting: "Next Meeting",
    event: "Next Event",
  },
  about: {
    label: "About the Club",
    body: "Sapporo Chess Club is a chess circle that has been active in Sapporo since the 1990s. Anyone can join regardless of age or experience — from elementary school students to working adults and seniors. If you're new to the game, members are happy to show you the rules and how to play. Whether you want to try chess for the first time or are looking for opponents, feel free to drop by.",
  },
  activities: {
    label: "Activities",
    meetup: "Meetups",
    meetupDesc: "Twice a month",
    tournament: "Tournaments",
    tournamentDesc: "Hokkaido Championship, 3 per year",
    lesson: "Lessons",
    lessonDesc: "By a member, off-site",
  },
  schedule: {
    label: "Schedule",
    pageTitle: "Schedule",
    pageSubtitle: "Annual Schedule",
    viewFullSchedule: "View full schedule",
    noUpcoming: "No upcoming events.",
    filterByYear: "Filter by year",
    allYears: "All years",
    all: "All",
    moreYears: "More years",
    roomSuffix: "",
    roomTbd: "TBD",
    timeLabel: "Time",
    roomLabel: "Room",
    timeTbd: "TBD",
    yearSuffix: "",
    monthSuffix: "",
    recordsLabel: "Past event records",
    recordsTournaments: "View the tournament archive",
    recordsAnnouncements: "View meetup reports",
  },
  clubInfo: {
    fee: "Entry Fee",
    venue: "Venue",
    general: "General",
    students: "Students",
    observation: "Observation & First Visit",
    free: "Free",
    viewOnMap: "View on Google Maps",
    // {link} は checkSchedule のリンクに置換される
    roomNotice: "The room varies by {link}.",
    checkSchedule: "schedule",
  },
  faq: {
    label: "FAQ",
    belongings: {
      question: "What should I bring to a meetup?",
      answer: "Please bring a notepad and a pen to record your moves when playing.",
    },
    lateArrival: {
      question: "Can I join a meetup late?",
      answer: "You can join from any round.",
    },
  },
  aiGuide: {
    freshness: "See the schedule for dates, times, rooms, and cancellations, and each tournament announcement and regulations for entry requirements. Past news and tournament records do not describe upcoming events. All times are Japan Standard Time (JST, UTC+09:00).",
    pages: "Official pages",
  },
  lessons: {
    label: "Chess Lessons",
    viewDetails: "View details",
  },
  notFound: {
    message: "Page not found",
    homeLink: "Back to home",
  },
  rss: {
    title: "Sapporo Chess Club — News",
    description: "Latest updates from Sapporo Chess Club",
  },
  announcements: {
    label: "News",
    pageTitle: "News",
    pageSubtitle: "Latest updates from the club",
    viewAll: "View all news",
    indexLabel: "All news",
    prev: "Previous",
    next: "Next",
    paginationLabel: "Announcement pagination",
    empty: "No news yet.",
    englishNotAvailable: "Some articles are not yet available in English and are shown in Japanese.",
    englishNotAvailableDetail: "This article is not yet available in English. The content below is shown in Japanese.",
    englishNotAvailableShort: "Shown in Japanese.",
    archivePageTitle: "News Archive",
    viewArchive: "View older announcements",
    archiveEmpty: "Archive is empty.",
    subscribeRss: "Subscribe via RSS",
  },
  resources: {
    label: "Links & Resources",
    pamphlet: "Club Pamphlet (PDF)",
    jca: "Japan Chess Federation",
  },
  contact: {
    label: "Contact",
  },
  tournament: {
    pageTitle: "Tournaments",
    pageSubtitle: "Full archive from 2000 to present",
    detailsPdf: "Details PDF",
    resultsPdf: "Results PDF",
    gamesPgn: "Game Records PGN",
    gamesPgnAnnotated: "Game Records PGN (Annotated)",
    chessResults: "Chess-Results",
    downloadAria: (label: string) => `${label} download`,
    // 年フィルタ変更時に aria-live へ書き込むテンプレート。{label} {count} はクライアント側で置換
    filterAnnounce: "Showing {count} tournaments — {label}",
  },
  badge: {
    tournamentTag: "Tournament",
    meetingTag: "Meeting",
    cancelledTag: "Cancelled",
  },
  menu: {
    sectionLabel: "Sections",
    dialogLabel: "Navigation menu",
    openLabel: "Open menu",
    closeLabel: "Close menu",
    activities: "Activities",
    info: "Entry Fee & Venue",
    lessons: "Chess Lessons",
    links: "Links",
    contact: "Contact",
  },
} as const satisfies Shape<typeof ja>;
