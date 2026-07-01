import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Eye, Sparkles, Check, HelpCircle, AlertCircle } from 'lucide-react';

export default function AccessibilityHelper() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('gonggam_tts_enabled');
    return saved === 'true';
  });
  const [speechRate, setSpeechRate] = useState<number>(1.1); // Speed of the reader
  const [speechVolume, setSpeechVolume] = useState<number>(1.0); // Volume
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  
  const lastSpokenRef = useRef<Element | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Save selection
  useEffect(() => {
    localStorage.setItem('gonggam_tts_enabled', String(isEnabled));
    if (!isEnabled && synthRef.current) {
      synthRef.current.cancel();
    }
  }, [isEnabled]);

  // Voice utterance maker
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    try {
      // Cancel any ongoing utterance to respond instantly to current hover
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = speechRate;
      utterance.volume = speechVolume;

      // Find standard Korean Voice if preferred
      const voices = synthRef.current.getVoices();
      const koVoice = voices.find(v => v.lang.startsWith('ko') || v.lang.includes('KR'));
      if (koVoice) {
        utterance.voice = koVoice;
      }

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('TTS Speech synthesis error:', e);
    }
  };

  // Global mouseover listener
  useEffect(() => {
    if (!isEnabled) {
      lastSpokenRef.current = null;
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      if (!isEnabled) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Find the closest interactive tag
      const interactive = target.closest('button, a, [role="button"], input, select, textarea, [data-tts]');
      
      if (interactive) {
        if (lastSpokenRef.current === interactive) return; // Prevent repeated triggers
        lastSpokenRef.current = interactive;

        // Compose helpful screen reader text
        let description = '';
        const ariaLabel = interactive.getAttribute('aria-label');
        const title = interactive.getAttribute('title');
        const dataTts = interactive.getAttribute('data-tts');
        const labelText = interactive.getAttribute('placeholder');

        // Extract text based on interactive type
        let textSource = '';
        if (dataTts) {
          textSource = dataTts;
        } else if (ariaLabel) {
          textSource = ariaLabel;
        } else if (title) {
          textSource = title;
        } else if (interactive.tagName === 'INPUT' && labelText) {
          textSource = `${labelText} 입력창`;
        } else {
          // Fallback to text inside
          textSource = interactive.textContent || '';
        }

        // Clean up text
        textSource = textSource.trim().replace(/\s+/g, ' ');

        // Prevent speaking redundant words or long system logs
        if (textSource.length > 100) {
          textSource = textSource.slice(0, 100) + '...';
        }

        // Determine accessible element roles
        let roleName = '요소';
        const tagName = interactive.tagName;

        if (tagName === 'BUTTON' || interactive.getAttribute('role') === 'button') {
          roleName = '버튼';
        } else if (tagName === 'A') {
          roleName = '링크';
        } else if (tagName === 'INPUT') {
          const type = (interactive as HTMLInputElement).type;
          if (type === 'checkbox') roleName = '선택 상자';
          else if (type === 'radio') roleName = '라디오 버튼';
          else roleName = '입력 항목';
        } else if (tagName === 'SELECT') {
          roleName = '선택 옵션 상자';
        }

        if (textSource) {
          description = `${textSource} ${roleName}`;
          // Speak clearly
          speakText(description);
        }
      } else {
        // If cursor moves completely away from interactive elements
        // Keep tracking clean
        const curTagName = target.tagName;
        // If it's a major heading, we can facilitate fast reading for accessibility
        if (['H1', 'H2', 'H3', 'H4'].includes(curTagName)) {
          if (lastSpokenRef.current === target) return;
          lastSpokenRef.current = target;
          const text = target.textContent?.trim() || '';
          if (text) {
            speakText(`제목: ${text}`);
          }
        } else {
          lastSpokenRef.current = null;
        }
      }
    };

    // Attach listener
    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isEnabled, speechRate, speechVolume]);

  // Read toggle status when user switches it manually
  const speakStatusChange = (active: boolean) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const txt = active 
      ? '시각 장애인 및 경로 우대용 음성 안내 가이드 서비스가 활성화되었습니다. 마우스 포인터를 버튼이나 배너 위로 올려 보세요.' 
      : '음성 안내 가이드 서비스가 종료되었습니다.';
    
    // Temporarily declare utterance
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  };

  const toggleTts = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    speakStatusChange(nextState);

    // Show floating alert toast for 4 seconds
    setAlertVisible(true);
    const timer = setTimeout(() => {
      setAlertVisible(false);
    }, 4500);
    return () => clearTimeout(timer);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans" id="tts-accessibility-controller">
      
      {/* 1. Quick Floating Status Alert Toast */}
      {alertVisible && (
        <div className="absolute bottom-16 left-0 w-80 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 animate-zoom-in space-y-2 mb-2">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span className="text-xs font-black">배리어 프리(Barrier-Free) 스피커 안내</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            {isEnabled 
              ? '화면의 구석기 유적 이야기부터 대표 소개, 모든 메뉴와 상호작용 카드를 마우스 오버 시 상냥한 우리말 목소리로 음성 설명해 드립니다.' 
              : '메뉴 음성 서비스를 종료하였습니다. 언제든지 다시 클릭해 활성화 수립이 가능합니다.'}
          </p>
        </div>
      )}

      {/* 2. Interactive Adaptive Floating Accessibility Controller badge */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-full shadow-lg border border-slate-200/90 hover:border-sky-300 transition-all group">
        
        {/* Toggle speak assistive button */}
        <button
          onClick={toggleTts}
          aria-label={isEnabled ? '음성 가이드 비활성화' : '시각장애인용 마우스 오버 음성 가이드 활성화'}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-black transition-all cursor-pointer ${
            isEnabled 
              ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-xs' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isEnabled ? (
            <>
              <Volume2 className="h-3.5 w-3.5 animate-bounce text-yellow-300" />
              <span>음성 안내 ON</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              <span>음성 안내 OFF</span>
            </>
          )}
        </button>

        {/* Audio rate controller popup when ON */}
        {isEnabled && (
          <div className="hidden group-hover:flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold text-slate-500 animate-fade-in border-l border-slate-100">
            <span className="shrink-0 text-slate-400">속도:</span>
            <button 
              onClick={() => { setSpeechRate(0.85); speakText('느린 속도'); }}
              className={`px-1.5 py-0.5 rounded-md hover:bg-slate-100 ${speechRate === 0.85 ? 'text-sky-600 bg-sky-50' : ''}`}
            >
              느림
            </button>
            <button 
              onClick={() => { setSpeechRate(1.1); speakText('보통 속도'); }}
              className={`px-1.5 py-0.5 rounded-md hover:bg-slate-100 ${speechRate === 1.1 ? 'text-sky-600 bg-sky-50' : ''}`}
            >
              보통
            </button>
            <button 
              onClick={() => { setSpeechRate(1.45); speakText('빠른 속도'); }}
              className={`px-1.5 py-0.5 rounded-md hover:bg-slate-100 ${speechRate === 1.45 ? 'text-sky-600 bg-sky-50' : ''}`}
            >
              빠름
            </button>
          </div>
        )}

        {/* Info Signifier */}
        <div 
          className="p-1 px-2 rounded-md font-medium text-[9px] text-slate-400 pointer-events-none text-right hidden lg:block"
          title="시각 장애인을 위한 공감플러스 배리어프리 편의 도우미"
        >
          배리어프리 휠
        </div>

      </div>
    </div>
  );
}
