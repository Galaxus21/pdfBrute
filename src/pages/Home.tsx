/**
 * Home.tsx
 * SRP: Composes all feature components into a single page layout.
 * Owns no business logic — delegates to usePDFRecovery hook.
 */
import React, { useState } from 'react';
import { Alert } from 'antd';
import { css } from 'aphrodite';
import type { ThemeTokens } from '../styles/theme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { utils, mobileView, tabletView } from '../styles/utilities';

import { usePDFRecovery } from '../hooks/usePDFRecovery';
import { UploadPDF } from '../components/UploadPDF';
import { PatternBuilder } from '../components/PatternBuilder';
import { GeneratorSettings } from '../components/GeneratorSettings';
import { RecoveryProgress } from '../components/ProgressBar';
import { ResultCard } from '../components/ResultCard';

// Layout Components
import { Header } from '../components/layout/Header';
import { SectionCard } from '../components/layout/SectionCard';
import { ActionArea } from '../components/layout/ActionArea';
import { SystemIdle } from '../components/layout/SystemIdle';

import { estimateCombinations, validatePattern } from '../utils/validators';
import { getPatternLength } from '../utils/patterns';
import type { PatternConfig } from '../types';

const DEFAULT_CONFIG: PatternConfig = {
  pattern: '',
  passwordLength: 0,
  knownChars: [],
};

interface HomeProps {
  theme: string;
  toggleTheme: () => void;
}

export const Home: React.FC<HomeProps> = ({ theme, toggleTheme }) => {
  const styles = useThemeStyles(getStyles);

  const { state, loadPDF, start, stop, reset, clearResults, setError } = usePDFRecovery();
  const [config, setConfig] = useState<PatternConfig>(DEFAULT_CONFIG);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const handleFileLoaded = async (file: File) => {
    try {
      await loadPDF(file);
      setPdfLoaded(true);
      clearResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePatternChange = (pattern: string) => {
    const newLen = getPatternLength(pattern);
    setConfig(prev => {
      const newKnown = Array(newLen).fill('*');
      for (let i = 0; i < Math.min(newLen, prev.knownChars.length); i++) {
        newKnown[i] = prev.knownChars[i];
      }
      return {
        ...prev,
        pattern,
        passwordLength: newLen,
        knownChars: newKnown,
      };
    });
    clearResults();
  };

  const handleConfigChange = (updates: Partial<PatternConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    clearResults();
  };

  const handleStart = () => {
    start(config);
  };

  const handleFileRemoved = () => {
    reset();
    setPdfLoaded(false);
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const patternError = validatePattern(config.pattern);
  const estimatedCombinations = patternError
    ? null
    : estimateCombinations(config.pattern, config.knownChars);

  const isRunning = state.status === 'running';
  const isDone = state.status === 'found' || state.status === 'exhausted';
  const canStart = pdfLoaded && !patternError && !isRunning;

  return (
    <div className={css(utils.flexColumn, styles.page)}>
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className={css(utils.flexColumn, styles.main)}>
        <div className={css(utils.grid, styles.grid)}>
          <div className={css(utils.flexColumn, styles.leftCol)}>
            <SectionCard title="1. TARGET FILE">
              <UploadPDF
                onFileLoaded={handleFileLoaded}
                onFileRemoved={handleFileRemoved}
                disabled={isRunning}
              />
            </SectionCard>

            <SectionCard title="2. PATTERN DEFINITION">
              <PatternBuilder
                value={config.pattern}
                onChange={handlePatternChange}
                disabled={isRunning}
              />
              <GeneratorSettings
                config={config}
                onChange={handleConfigChange}
                disabled={isRunning}
              />
              {/* Validation errors */}
              {patternError && config.pattern && (
                <Alert type="error" title={patternError} showIcon style={{ borderRadius: 8, marginTop: 8 }} />
              )}
            </SectionCard>

            <ActionArea
              canStart={canStart}
              isRunning={isRunning}
              onStart={handleStart}
              onStop={stop}
            />
          </div>

          {/* Right Column: Status & Execution Console */}
          <div className={css(utils.flexColumn, styles.rightCol)}>
            {state.status === 'idle' && (
              <SystemIdle estimatedCombinations={estimatedCombinations} />
            )}

            {isRunning && (
              <RecoveryProgress state={state} />
            )}

            {(isDone || state.status === 'error') && (
              <ResultCard state={state} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  page: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    color: theme.colors.onSurface,
    fontFamily: theme.typography.fontBody,
  },
  main: {
    flexGrow: 1,
    maxWidth: 1280,
    margin: '0 auto',
    padding: `32px ${theme.spacing.marginDesktop} ${theme.spacing.marginDesktop}`,
    gap: theme.spacing.marginDesktop,
    [mobileView]: { padding: `${theme.spacing.gutterMd} ${theme.spacing.marginMobile}` },
  },
  grid: {
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: theme.spacing.gutterMd,
    [tabletView]: { gridTemplateColumns: '1fr' },
    width: '100%',
    minWidth: 0,
  },
  leftCol: {
    gridColumn: 'span 7 / span 7',
    gap: theme.spacing.gutterMd,
    [tabletView]: { gridColumn: 'span 1 / span 1' },
    minWidth: 0,
  },
  rightCol: {
    gridColumn: 'span 5 / span 5',
    gap: theme.spacing.gutterMd,
    [tabletView]: { gridColumn: 'span 1 / span 1' },
    minWidth: 0,
  },
});
