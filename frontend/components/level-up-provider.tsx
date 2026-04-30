import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { LevelUpOverlay } from './level-up-overlay';
import { useTranslation } from '../i18n';

type LevelUpContextValue = {
  showLevelUp: (level: number) => void;
  syncPlayerLevel: (level: number) => void;
};

const LevelUpContext = createContext<LevelUpContextValue>({
  showLevelUp: () => {},
  syncPlayerLevel: () => {},
});

export function LevelUpProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [visibleLevel, setVisibleLevel] = useState<number | null>(null);
  const [animationNonce, setAnimationNonce] = useState(0);
  const highestKnownLevelRef = useRef<number | null>(null);

  const showLevelUp = useCallback((level: number) => {
    highestKnownLevelRef.current = Math.max(highestKnownLevelRef.current ?? level, level);
    setVisibleLevel(level);
    setAnimationNonce((value) => value + 1);
  }, []);

  const syncPlayerLevel = useCallback((level: number) => {
    if (level <= 0) return;

    if (highestKnownLevelRef.current === null) {
      highestKnownLevelRef.current = level;
      return;
    }

    if (level > highestKnownLevelRef.current) {
      showLevelUp(level);
      return;
    }

    highestKnownLevelRef.current = Math.max(highestKnownLevelRef.current, level);
  }, [showLevelUp]);

  const value = useMemo(
    () => ({ showLevelUp, syncPlayerLevel }),
    [showLevelUp, syncPlayerLevel]
  );

  return (
    <LevelUpContext.Provider value={value}>
      {children}
      <LevelUpOverlay
        visible={visibleLevel !== null}
        level={visibleLevel ?? 1}
        nonce={animationNonce}
        onDone={() => setVisibleLevel(null)}
        title={t('home_level_up_title')}
        levelLabel={t('level_label')}
      />
    </LevelUpContext.Provider>
  );
}

export function useLevelUpAnimation() {
  return useContext(LevelUpContext);
}
