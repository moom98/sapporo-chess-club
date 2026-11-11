export default {
  site: {
    name: "札幌チェスクラブ",
    // JSON-LD の alternateName: 検索エンジンに他言語名を知らせる（表示言語の逆側の名前）
    alternateName: "Sapporo Chess Club",
    description:
      "札幌チェスクラブは、北海道のチェス愛好家が集まるコミュニティです。月2回の例会と年3回の公式大会を開催。見学無料、初心者歓迎。",
  },
  seo: {
    home: {
      // ページtitleの末尾に付く補足文（ブランド名だけでは検索対象が狭いため）
      titleSuffix: "北海道のチェスサークル・チェス大会・初心者歓迎",
      description:
        "札幌チェスクラブ公式サイト。月2回の例会と年3回の公式大会（北海道チェス選手権ほか）を開催。見学・初回参加は無料、初心者から経験者まで歓迎。札幌市中央区で活動する北海道のチェスサークル。",
    },
    schedule: {
      description:
        "札幌チェスクラブの年間スケジュール。月2回の例会と年3回の公式大会（北海道チェス選手権、札幌オープンほか）の日程を一覧で掲載。",
    },
    tournaments: {
      description:
        "札幌チェスクラブが主催・参加した大会記録アーカイブ。要項PDF・結果PDF・棋譜PGNを2000年から掲載。北海道チェス選手権ほか。",
    },
    announcementsList: {
      description:
        "札幌チェスクラブからの最新お知らせ一覧。例会報告、大会告知、会場変更などの情報を掲載。",
    },
    announcementsArchive: {
      description:
        "札幌チェスクラブの過去のお知らせアーカイブ。年別に過去の例会報告や大会告知を閲覧できます。",
    },
  },
  nav: {
    home: "ホーム",
    tournaments: "大会記録",
    skipToMain: "メインコンテンツへスキップ",
    openInNewTab: "（新しいタブで開く）",
    switchLanguage: "Switch to English",
    close: "Close",
    languageShort: "EN",
    languageFull: "English",
    // aria-label 用。ホームリンクは可視テキスト "SAPPORO CHESS CLUB" を含める (label-in-name)
    homeLink: "SAPPORO CHESS CLUB — ホーム",
    mainNav: "メインナビゲーション",
    breadcrumb: "パンくずリスト",
  },
  hero: {
    subtitle: "北海道のチェス愛好家が集うコミュニティです。初心者歓迎。",
  },
  nextEvent: {
    meeting: "次回の例会",
    event: "次回のイベント",
  },
  about: {
    label: "クラブについて",
    body: "札幌チェスクラブは、1990年代から札幌で活動しているチェスサークルです。小学生から社会人、シニアまで、年齢や経験にかかわらず参加できます。初めての方も、メンバーにルールや指し方を聞きながら楽しめます。チェスを始めてみたい方も、対局相手を探している方も、気軽に遊びに来てください。",
  },
  activities: {
    label: "活動内容",
    meetup: "例会",
    meetupDesc: "月2回の定期開催",
    tournament: "大会",
    tournamentDesc: "北海道選手権など年3回",
    lesson: "講座",
    lessonDesc: "メンバーが別会場で開講",
  },
  schedule: {
    label: "スケジュール",
    pageTitle: "スケジュール",
    pageSubtitle: "年間スケジュール",
    viewFullSchedule: "年間スケジュールを見る",
    noUpcoming: "予定されているイベントはありません。",
    filterByYear: "年で絞り込み",
    allYears: "すべての年",
    all: "すべて",
    moreYears: "もっと見る",
    roomSuffix: "室",
    roomTbd: "未定",
    timeLabel: "時間",
    roomLabel: "部屋",
    timeTbd: "未定",
    yearSuffix: "年",
    monthSuffix: "月",
    recordsLabel: "終了したイベントの記録",
    recordsTournaments: "大会記録を見る",
    recordsAnnouncements: "例会報告を見る",
  },
  clubInfo: {
    fee: "参加案内",
    venue: "会場",
    general: "一般",
    students: "学生",
    observation: "見学・初回参加",
    free: "無料",
    viewOnMap: "Google マップで見る",
    // {link} は checkSchedule のリンクに置換される
    roomNotice: "部屋は{link}により異なります。",
    checkSchedule: "スケジュール",
  },
  faq: {
    label: "よくある質問",
    belongings: {
      question: "例会に必要な持ち物は？",
      answer: "対局の記録用に、メモ用紙と筆記用具をお持ちください。",
    },
    lateArrival: {
      question: "途中からでも参加できますか？",
      answer: "どのラウンドからでも参加できます。",
    },
  },
  aiGuide: {
    freshness: "日程・時刻・部屋・中止情報はスケジュール、各大会の参加条件は大会のお知らせ・要項を確認してください。過去のお知らせ・大会記録は現在の開催予定ではありません。時刻は日本標準時（JST、UTC+09:00）です。",
    pages: "公式ページ",
  },
  lessons: {
    label: "チェス講座",
    viewDetails: "詳細を見る",
  },
  notFound: {
    message: "ページが見つかりませんでした",
    homeLink: "ホームに戻る",
  },
  rss: {
    title: "札幌チェスクラブ お知らせ",
    description: "札幌チェスクラブの新着情報",
  },
  announcements: {
    label: "お知らせ",
    pageTitle: "お知らせ",
    pageSubtitle: "新着情報・お知らせ一覧",
    viewAll: "お知らせ一覧を見る",
    indexLabel: "お知らせ一覧",
    prev: "前のお知らせ",
    next: "次のお知らせ",
    paginationLabel: "前後のお知らせ",
    empty: "まだお知らせはありません。",
    englishNotAvailable: "",
    englishNotAvailableDetail: "",
    englishNotAvailableShort: "",
    archivePageTitle: "お知らせアーカイブ",
    viewArchive: "過去のお知らせを見る",
    archiveEmpty: "アーカイブはまだありません。",
    subscribeRss: "RSS で購読",
  },
  resources: {
    label: "リンク / 資料",
    pamphlet: "クラブ案内 (PDF)",
    jca: "日本チェス連盟",
  },
  contact: {
    label: "お問い合わせ",
  },
  tournament: {
    pageTitle: "大会記録",
    pageSubtitle: "2000年〜現在までの全大会アーカイブ",
    detailsPdf: "要項 PDF",
    resultsPdf: "結果 PDF",
    gamesPgn: "棋譜 PGN",
    gamesPgnAnnotated: "棋譜 PGN (解析付)",
    chessResults: "Chess-Results",
    downloadAria: (label: string) => `${label}をダウンロード`,
    // 年フィルタ変更時に aria-live へ書き込むテンプレート。{label} {count} はクライアント側で置換
    filterAnnounce: "{label}: {count}件表示中",
  },
  badge: {
    tournamentTag: "大会",
    meetingTag: "例会",
    cancelledTag: "中止",
  },
  menu: {
    sectionLabel: "セクション",
    dialogLabel: "ナビゲーションメニュー",
    openLabel: "メニューを開く",
    closeLabel: "メニューを閉じる",
    activities: "活動内容",
    info: "参加案内・会場",
    lessons: "チェス講座",
    links: "リンク",
    contact: "お問い合わせ",
  },
} as const;
