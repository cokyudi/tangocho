// Public update history for /about (latest few) and /changelog (all).
// Newest first. One entry per user-visible feature, not per fix.

type Text = { title: string; body: string };

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  en: Text;
  ja: Text;
  post?: { en: string; ja: string };
};

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-09-26',
    en: {
      title: 'Daily notification at 07:00',
      body: 'A web push every morning with a friend’s line and what’s due for review — including on the iPhone home-screen app.',
    },
    ja: {
      title: '毎朝7時の通知',
      body: '友達のひとことと今日の復習数を、毎朝プッシュ通知でお知らせ。iPhoneのホーム画面アプリにも対応。',
    },
  },
  {
    date: '2026-09-26',
    en: {
      title: 'AI friends',
      body: 'Characters I create — a casual friend, a polite coworker — mention 4 new words a day in their own voice. Coworkers pick business vocabulary, friends pick slang; Progress shows how many I keep.',
    },
    ja: {
      title: 'AIの友達',
      body: 'タメ口の友達や敬語の同僚など、自分で作ったキャラクターが毎日4つの単語をひとことで教えてくれる。同僚はビジネス語彙、友達はスラング。保存率は進捗ページで確認できる。',
    },
  },
  {
    date: '2026-09-20',
    en: {
      title: 'Dictionary re-check',
      body: 'Compares every saved word’s reading, part of speech and JLPT level against Jisho, and applies fixes only when I confirm.',
    },
    ja: {
      title: '辞書で再チェック',
      body: '保存した単語の読み・品詞・JLPTレベルをJishoと照合し、確認したものだけ修正する。',
    },
  },
  {
    date: '2026-09-20',
    en: {
      title: 'Speak mode',
      body: 'See the meaning, say the word out loud; speech recognition checks it and plays the correct pronunciation. All in the browser, no audio stored.',
    },
    ja: {
      title: 'Speakモード',
      body: '意味を見て、単語を声に出して言う。音声認識が判定し、正しい発音を再生する。すべてブラウザ内で完結し、音声は保存しない。',
    },
    post: {
      en: 'https://www.yudidputra.com/blog/checking-japanese-pronunciation-in-the-browser',
      ja: 'https://www.yudidputra.com/blog/checking-japanese-pronunciation-in-the-browser-ja',
    },
  },
  {
    date: '2026-06-28',
    en: {
      title: 'Relearning and data export',
      body: 'Forgotten cards come back in the same session, and all words, sources and review history can be downloaded as JSON.',
    },
    ja: {
      title: '再学習とデータ書き出し',
      body: '忘れたカードは同じセッション内でもう一度出題。単語・出典・復習履歴をJSONでダウンロードできる。',
    },
  },
  {
    date: '2026-06-27',
    en: {
      title: 'Word detail with furigana',
      body: 'Tap any word in Browse for its full detail, with furigana on the example sentence.',
    },
    ja: {
      title: 'ふりがな付きの単語詳細',
      body: '一覧で単語をタップすると詳細を表示。例文にもふりがなが付く。',
    },
  },
  {
    date: '2026-06-25',
    en: {
      title: 'Installable app and progress',
      body: 'Add it to the home screen like a native app, with an offline shell, plus a progress page for mastery, streak and daily reviews.',
    },
    ja: {
      title: 'アプリとしてインストール・進捗',
      body: 'ホーム画面に追加してアプリのように使える（オフライン対応）。習熟度・連続記録・毎日の復習数を見られる進捗ページも。',
    },
  },
  {
    date: '2026-06-25',
    en: {
      title: 'First version',
      body: 'Capture with Jisho + Gemini auto-fill, Browse with filters, and SM-2 spaced-repetition flashcards.',
    },
    ja: {
      title: '最初のバージョン',
      body: 'Jisho + Geminiで自動入力する取り込み、絞り込みできる一覧、SM-2の間隔反復フラッシュカード。',
    },
  },
];
