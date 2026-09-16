'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface VoiceNavigationProps {
  userName?: string;
  onNavigate: (viewName: string) => void;
}

export default function VoiceNavigation({ userName, onNavigate }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isUserActivatedRef = useRef<boolean>(false);

  const getRandomResponse = (responses: string[]) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const toastSuccess = (msg: string) => {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: msg,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // 1. HELPER MENGHENTIKAN RECOGNITION
  const stopListening = useCallback(() => {
    isUserActivatedRef.current = false;
    isSpeakingRef.current = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    setTranscript('');
  }, []);

  // 2. HELPER SCROLL UNIVERSAL
  const handleScroll = (direction: 'down' | 'up' | 'top' | 'bottom') => {
    if (typeof window === 'undefined') return;

    const scrollAmount = window.innerHeight * 0.7;
    const scrollContainer = document.querySelector('.overflow-y-auto') || document.documentElement || document.body;

    if (direction === 'down') {
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    } else if (direction === 'up') {
      window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      scrollContainer.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (direction === 'bottom') {
      const maxScroll = Math.max(document.body.scrollHeight, scrollContainer.scrollHeight);
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      scrollContainer.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  };

  // 3. HELPER MULAI MENDENGARKAN
  const startListening = useCallback(() => {
    if (!isUserActivatedRef.current || isSpeakingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      Swal.fire({
        icon: 'error',
        title: 'Fitur Tidak Didukung',
        text: 'Browser ini belum mendukung navigasi suara.',
      });
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Mendengarkan...');
      };

      recognition.onresult = (event: any) => {
        if (isSpeakingRef.current) return;

        const lastIndex = event.results.length - 1;
        const rawText = event.results[lastIndex][0].transcript.toLowerCase().trim();
        const text = rawText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

        setTranscript(text);

        // --- A. PERINTAH MATIKAN MIKROFON ---
        if (
          text.includes('matikan') ||
          text.includes('stop') ||
          text.includes('berhenti') ||
          text.includes('tutup mik') ||
          text.includes('off') ||
          text.includes('diam')
        ) {
          isUserActivatedRef.current = false;
          speakText('Baik, mikrofon dimatikan.', () => {
            stopListening();
          });
          return;
        }

        // --- B. PERINTAH SCROLL / GULIR ---
        else if (
          text.includes('paling bawah') ||
          text.includes('dasar') ||
          text.includes('paling akhir') ||
          text.includes('ujung bawah')
        ) {
          handleScroll('bottom');
          toastSuccess('Menggulir ke paling bawah');
        } else if (
          text.includes('paling atas') ||
          text.includes('puncak') ||
          text.includes('paling awal') ||
          text.includes('ujung atas')
        ) {
          handleScroll('top');
          toastSuccess('Menggulir ke paling atas');
        } else if (
          text.includes('bawah') ||
          text.includes('turun') ||
          text.includes('sekrol bawah') ||
          text.includes('surol bawah') ||
          text.includes('kebawah')
        ) {
          handleScroll('down');
          toastSuccess('Menggulir ke bawah');
        } else if (
          text.includes('atas') ||
          text.includes('naik') ||
          text.includes('sekrol atas') ||
          text.includes('surol atas') ||
          text.includes('keatas')
        ) {
          handleScroll('up');
          toastSuccess('Menggulir ke atas');
        }

        // --- C. NAVIGASI MENU ---
        else if (
          text.includes('lahan') ||
          text.includes('kebun') ||
          text.includes('sawah') ||
          text.includes('padi') ||
          text.includes('tanaman')
        ) {
          const res = getRandomResponse([
            'Baik pak, mari kita lihat data lahan dan sawah Anda.',
            'Siap, menampilkan informasi lahan pertanian Anda.',
            'Membuka data kebun dan lahan Anda sekarang.',
          ]);
          speakAndNavigate(res, 'lands', text);
        } else if (
          text.includes('pupuk') ||
          text.includes('koperasi') ||
          text.includes('kdkmp') ||
          text.includes('subsidi') ||
          text.includes('stok')
        ) {
          const res = getRandomResponse([
            'Baik, ini informasi stok dan pengambilan pupuk KDKMP.',
            'Siap, membuka layanan pupuk untuk Anda.',
            'Menampilkan menu pupuk dan ketersediaannya.',
          ]);
          speakAndNavigate(res, 'fertilizers', text);
        } 
        // 1. DIBEDAKAN: MENU TRANSAKSI / NOTA
        else if (
          text.includes('nota') ||
          text.includes('transaksi') ||
          text.includes('bukti') ||
          text.includes('pembayaran')
        ) {
          const res = getRandomResponse([
            'Baik, ini daftar nota dan transaksi Anda.',
            'Membuka daftar nota pembayaran.',
            'Menampilkan catatan transaksi Anda.',
          ]);
          speakAndNavigate(res, 'transactions', text);
        } 
        // 2. DITAMBAHKAN: MENU RIWAYAT & JADWAL PEMUPUKAN
        else if (
          text.includes('riwayat') ||
          text.includes('jadwal') ||
          text.includes('pemupukan') ||
          text.includes('histori') ||
          text.includes('history')
        ) {
          const res = getRandomResponse([
            'Baik, membuka riwayat dan jadwal pemupukan Anda.',
            'Siap, menampilkan catatan dan jadwal pemupukan.',
            'Menampilkan riwayat pemupukan lahan Anda.',
          ]);
          speakAndNavigate(res, 'fertilizer-history', text);
        } else if (
          text.includes('beranda') ||
          text.includes('home') ||
          text.includes('awal') ||
          text.includes('depan') ||
          text.includes('utama')
        ) {
          const res = getRandomResponse([
            'Baik, kembali ke halaman utama.',
            'Siap, kita balik ke beranda.',
            'Menampilkan menu utama.',
          ]);
          speakAndNavigate(res, 'home', text);
        } else if (
          text.includes('menu') ||
          text.includes('bantuan') ||
          text.includes('apa saja') ||
          text.includes('pilihan')
        ) {
          const helpText =
            'Anda bisa sebutkan menu Lahan, Pupuk, Nota, atau Riwayat Pemupukan. Gunakan kata turun atau bawah untuk geser layar, atau katakan matikan untuk berhenti.';
          speakText(helpText);
        } else {
          const unknownText =
            'Maaf, saya belum paham perintah itu. Anda bisa sebutkan Lahan, Pupuk, Nota, Riwayat Pemupukan, atau Perintah Bawah.';
          speakText(unknownText, () => {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'warning',
              title: `Perintah "${text}" tidak dikenali`,
              showConfirmButton: false,
              timer: 2500,
            });
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isUserActivatedRef.current && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, []);

  // 4. HELPER TEXT-TO-SPEECH (TTS)
  const speakText = useCallback(
    (text: string, onEndCallback?: () => void) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        isSpeakingRef.current = true;

        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        const handleEnd = () => {
          isSpeakingRef.current = false;
          if (onEndCallback) onEndCallback();
          if (isUserActivatedRef.current) {
            startListening();
          }
        };

        utterance.onend = handleEnd;
        utterance.onerror = () => {
          isSpeakingRef.current = false;
          if (onEndCallback) onEndCallback();
          if (isUserActivatedRef.current) {
            startListening();
          }
        };

        window.speechSynthesis.speak(utterance);
      } else {
        if (onEndCallback) onEndCallback();
        if (isUserActivatedRef.current) {
          startListening();
        }
      }
    },
    [startListening]
  );

  const speakAndNavigate = (
    responseText: string,
    viewTarget: string,
    rawTranscript: string
  ) => {
    speakText(responseText, () => {
      onNavigate(viewTarget);
      toastSuccess(`Perintah: "${rawTranscript}"`);
    });
  };

  // 5. TOGGLE UTAMA TOMBOL
  const toggleListening = () => {
    if (isListening || isUserActivatedRef.current) {
      isUserActivatedRef.current = false;
      speakText('Navigasi suara dimatikan.', () => {
        stopListening();
      });
    } else {
      isUserActivatedRef.current = true;
      startListening();

      const name = userName ? `Bapak ${userName}` : 'Petani';
      const greetingText = `Navigasi suara aktif, ${name}. Silakan sebutkan menu atau perintah gulir layar.`;
      speakText(greetingText);
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <>
      {/* Indikator Transkrip Melayang */}
      {isListening && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md shadow-lg animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🎙️ {transcript || 'Silakan bicara...'}</span>
        </div>
      )}

      {/* Tombol Mikrofon Floating */}
      <button
        onClick={toggleListening}
        aria-label="Navigasi Suara"
        className={`fixed bottom-20 right-4 z-40 p-3.5 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 animate-pulse'
            : 'bg-slate-700 text-white hover:bg-slate-800 hover:scale-105 active:scale-95'
        }`}
      >
        {isListening ? (
          <FaMicrophone className="text-xl" />
        ) : (
          <FaMicrophoneSlash className="text-xl" />
        )}
      </button>
    </>
  );
}