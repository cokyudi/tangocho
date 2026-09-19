'use client';

// ponytail: throwaway spike to check Web Speech API support in the installed iOS PWA. Delete after.
import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SpeechTest() {
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString()} ${line}`]);

  const w = typeof window !== 'undefined' ? (window as any) : null;
  const Recognition = w && (w.SpeechRecognition || w.webkitSpeechRecognition);
  const standalone =
    w && (w.matchMedia('(display-mode: standalone)').matches || w.navigator.standalone === true);

  function listen() {
    if (!Recognition) return add('SpeechRecognition NOT available');
    const r = new Recognition();
    r.lang = 'ja-JP';
    r.maxAlternatives = 5;
    r.interimResults = false;
    r.continuous = false;
    for (const e of ['start', 'audiostart', 'speechstart', 'speechend', 'audioend', 'end', 'nomatch']) {
      r.addEventListener(e, () => add(e));
    }
    r.onerror = (e: any) => add(`error: ${e.error} ${e.message ?? ''}`);
    r.onresult = (e: any) => {
      const alts = Array.from(e.results[0] as ArrayLike<any>).map(
        (a) => `${a.transcript} (${a.confidence?.toFixed?.(2) ?? '?'})`,
      );
      add(`result: ${alts.join(' | ')}`);
    };
    try {
      r.start();
    } catch (err) {
      add(`start threw: ${String(err)}`);
    }
  }

  function speak() {
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja'));
    add(`ja voices: ${voices.map((v) => v.name).join(', ') || 'none'}`);
    const u = new SpeechSynthesisUtterance('たべもの');
    u.lang = 'ja-JP';
    u.onend = () => add('tts: end');
    u.onerror = (e) => add(`tts error: ${e.error}`);
    speechSynthesis.speak(u);
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Speech test</h1>
      <ul className="text-sm text-muted">
        <li>Recognition: {Recognition ? 'available' : 'NOT available'}</li>
        <li>Standalone (installed PWA): {standalone ? 'yes' : 'no'}</li>
        <li className="break-all">UA: {w?.navigator.userAgent}</li>
      </ul>
      <div className="flex gap-3">
        <button onClick={listen} className="border-2 border-ink bg-accent px-4 py-2 font-bold text-on-accent shadow-retro-sm">
          Listen (say たべもの)
        </button>
        <button onClick={speak} className="border-2 border-ink bg-surface px-4 py-2 font-bold text-ink shadow-retro-sm">
          Speak
        </button>
      </div>
      <pre className="whitespace-pre-wrap border-2 border-ink bg-surface p-3 text-xs text-ink">
        {log.join('\n') || 'log…'}
      </pre>
    </div>
  );
}
