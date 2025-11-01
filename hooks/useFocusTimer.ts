import { useState, useEffect, useRef } from 'react';

export const useFocusTimer = (initialMinutes: number, soundUrl: string) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect for initializing and cleaning up the audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    
    // On unmount, pause audio and release the reference
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Effect to update total seconds if initialMinutes changes while timer is not active
  useEffect(() => {
    if (!isActive) {
      setTotalSeconds(initialMinutes * 60);
    }
  }, [initialMinutes, isActive]);

  // Effect for managing the timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (isActive && totalSeconds === 0) {
      setIsFinished(true);
      setIsActive(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, totalSeconds]);

  // Consolidated effect for managing audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only attempt to play if the timer is active and soundUrl is a non-empty string.
    if (isActive && soundUrl.length > 0) {
      if (audio.src !== soundUrl) {
        audio.src = soundUrl;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore AbortError which occurs when play() is interrupted by pause() or a new source load.
          if (error.name !== 'AbortError') {
            console.error("Audio playback failed:", error);
          }
        });
      }
    } else {
      // If timer is paused or sound is muted, pause the audio.
      audio.pause();
    }
  }, [isActive, soundUrl]);
  
  const start = () => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
    }
    setTotalSeconds(initialMinutes * 60);
    setIsFinished(false);
    setIsActive(true);
  };

  const pause = () => {
    setIsActive(false);
  };

  const resume = () => {
    if (!isFinished) {
      setIsActive(true);
    }
  };

  const reset = () => {
    setIsActive(false);
    setIsFinished(false);
    setTotalSeconds(initialMinutes * 60);
  };
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds, isActive, isFinished, start, pause, resume, reset, initialMinutes };
};
