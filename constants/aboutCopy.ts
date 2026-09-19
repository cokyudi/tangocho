// Copy for the public /about page. JA mirrors the portfolio's i18n tone.
// `built` alternates plain / bold segments (even index plain, odd bold).

export type Language = 'en' | 'ja';

const en = {
  toggle: { label: 'EN', aria: 'EN, switch to Japanese' },
  hero: {
    badge: 'Personal project · 単語帳 = “vocabulary notebook”',
    titleBefore: 'Capture Japanese words the moment you hear them — and never ',
    titleHighlight: 'forget',
    titleAfter: ' them.',
    body: 'A single-user app I built to learn Japanese while living in Japan: fast AI-assisted capture, the memory of where each word came from, and spaced-repetition review.',
    signIn: 'Sign in',
    portfolio: 'Portfolio ↗',
    private: 'It’s a private, single-account app (email allowlist) — this page is the tour.',
    mockupAlts: ['Capture screen', 'Practice flashcard', 'Browse list'],
  },
  features: [
    { title: 'Capture', jp: '取り込む', body: 'Type a word; Jisho + Gemini auto-fill the reading, Indonesian & English meanings, and an example. Tag where you heard it.' },
    { title: 'Browse', jp: '一覧', body: 'Every word as a table or bento grid, with furigana. Filter by source, mastery, or what’s due. Tap for full detail.' },
    { title: 'Practice', jp: '復習', body: 'SM-2 spaced-repetition flashcards. Flip, rate forgot / hard / easy, and the app schedules the next review.' },
    { title: 'Speak', jp: '話す', body: 'See the meaning, say the word out loud. Speech recognition checks what it heard against the word, then plays the correct pronunciation so you can compare.' },
  ],
  seeIt: 'See it in action',
  shots: {
    capture: { alt: 'Capture screen auto-filling a word', caption: 'Capture · AI auto-fill' },
    browse: { alt: 'Browse list with filters', caption: 'Browse · filter & search' },
    detail: { alt: 'Word detail with furigana example', caption: 'Detail · meaning, example, source' },
    practice: { alt: 'Practice flashcard', caption: 'Practice · SM-2 flashcards' },
    speak: { alt: 'Speak mode: meaning shown, spoken answer heard and marked correct', caption: 'Speak · say it out loud' },
    progress: { alt: 'Progress dashboard', caption: 'Progress · mastery & streak' },
    home: { alt: 'Home dashboard', caption: 'Home · at a glance' },
  },
  carousel: {
    prev: 'Previous screen',
    next: 'Next screen',
    goTo: (n: number) => `Go to screen ${n}`,
  },
  builtHeading: 'How it’s built',
  built: [
    'A full-stack PWA on entirely free tiers. Words are auto-enriched by a ',
    'Jisho → Gemini fallback',
    ' pipeline, review scheduling uses a hand-implemented ',
    'SM-2',
    ' algorithm, Speak mode runs entirely in the browser on the ',
    'Web Speech API',
    ' (recognition + Japanese text-to-speech, no audio stored), and every row is protected by Postgres ',
    'row-level security',
    ' with a single-user Google OAuth allowlist.',
  ],
  footerBefore: 'Built by ',
  footerAfter: '.',
};

export type AboutCopy = typeof en;

const ja: AboutCopy = {
  toggle: { label: 'JP', aria: 'JP, switch to English' },
  hero: {
    badge: '個人プロジェクト · tangocho = 単語帳',
    titleBefore: '聞いたその瞬間に、日本語の単語を取り込む。もう',
    titleHighlight: '忘れない',
    titleAfter: '。',
    body: '日本で暮らしながら日本語を学ぶために作った、自分専用のアプリ。AIでサッと単語を取り込み、どこで覚えたかを記録し、間隔反復で復習する。',
    signIn: 'ログイン',
    portfolio: 'ポートフォリオ ↗',
    private: '許可された1アカウントだけが使える非公開アプリ（メール許可リスト）。このページはその紹介です。',
    mockupAlts: ['取り込み画面', '復習フラッシュカード', '単語一覧'],
  },
  features: [
    { title: 'Capture', jp: '取り込む', body: '単語を入力するだけで、Jisho + Geminiが読み・インドネシア語と英語の意味・例文を自動入力。どこで聞いたかもタグ付けできる。' },
    { title: 'Browse', jp: '一覧', body: '全単語をテーブルかベントーグリッドで、ふりがな付きで表示。出典・習熟度・復習期限で絞り込み、タップで詳細を確認。' },
    { title: 'Practice', jp: '復習', body: 'SM-2の間隔反復フラッシュカード。めくって「忘れた／難しい／簡単」で評価すると、次の復習日が自動で決まる。' },
    { title: 'Speak', jp: '話す', body: '意味を見て、単語を声に出して言う。音声認識が聞き取った内容を答えと照合し、正しい発音を再生して聞き比べられる。' },
  ],
  seeIt: '実際の画面',
  shots: {
    capture: { alt: '単語を自動入力している取り込み画面', caption: 'Capture · AIで自動入力' },
    browse: { alt: 'フィルター付きの単語一覧', caption: 'Browse · 絞り込み・検索' },
    detail: { alt: 'ふりがな付き例文のある単語詳細', caption: 'Detail · 意味・例文・出典' },
    practice: { alt: '復習フラッシュカード', caption: 'Practice · SM-2フラッシュカード' },
    speak: { alt: 'Speakモード：意味が表示され、話した答えが正解と判定された画面', caption: 'Speak · 声に出して言う' },
    progress: { alt: '進捗ダッシュボード', caption: 'Progress · 習熟度と連続記録' },
    home: { alt: 'ホームダッシュボード', caption: 'Home · ひと目で確認' },
  },
  carousel: {
    prev: '前の画面',
    next: '次の画面',
    goTo: (n: number) => `画面${n}へ`,
  },
  builtHeading: '技術構成',
  built: [
    'すべて無料枠で動くフルスタックPWA。単語は',
    'Jisho → Geminiフォールバック',
    'のパイプラインで自動補完し、復習スケジュールは自前で実装した',
    'SM-2',
    'アルゴリズムで管理。Speakモードは',
    'Web Speech API',
    'を使ってブラウザ内だけで完結（音声認識＋日本語読み上げ、音声は保存しない）。全テーブルをPostgresの',
    '行レベルセキュリティ',
    'で保護し、Google OAuthの許可リストで利用者を1人に限定。',
  ],
  footerBefore: '制作：',
  footerAfter: '',
};

export const aboutCopy: Record<Language, AboutCopy> = { en, ja };
