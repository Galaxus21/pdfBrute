/**
 * UploadPDF.tsx
 * SRP: Handles only PDF file selection and validation feedback.
 */
import React from 'react';
import { Upload } from 'antd';
import { css } from 'aphrodite';
import type { UploadFile } from 'antd/es/upload/interface';
import { type ThemeTokens, getIconBoxStyle } from '../styles/theme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { utils, mobileView } from '../styles/utilities';

interface UploadPDFProps {
  onFileLoaded: (file: File) => void;
  onFileRemoved?: () => void;
  disabled?: boolean;
}

export const UploadPDF: React.FC<UploadPDFProps> = ({ onFileLoaded, onFileRemoved, disabled }) => {
  const styles = useThemeStyles(getStyles);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleBeforeUpload = (file: File): boolean => {
    setSelectedFile(file);
    onFileLoaded(file);
    return false; // prevent automatic upload
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (onFileRemoved) onFileRemoved();
  };

  return (
    <div className={css(utils.flexColumn, styles.wrapper)}>
      {!selectedFile && (
        <div className={css(utils.flexColumn, styles.uploadArea)}>
          <Upload
            accept=".pdf"
            multiple={false}
            maxCount={1}
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            disabled={disabled}
            fileList={[] as UploadFile[]}
            className={css(styles.uploadWrapper)}
          >
            <button type="button" className={css(styles.uploadBtn)} disabled={disabled}>
              <span className="material-symbols-outlined">upload_file</span>
              <span style={{ marginLeft: 8 }}>Select Target PDF</span>
            </button>
          </Upload>
        </div>
      )}

      {selectedFile && (
        <div className={css(utils.flexRow, utils.alignItemsCenter, utils.justifySpaceBetween, styles.fileInfo)}>
          <div className={css(utils.flexRow, utils.alignItemsCenter, styles.fileInfoGroup)}>
            <div className={css(styles.fileIconWrapper)}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#ba1a1a' }}>picture_as_pdf</span>
            </div>
            <div className={css(utils.flexColumn, styles.fileDetails)}>
              <span className={css(styles.fileName)} title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className={css(styles.fileMeta)}>
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>
          <button
            aria-label="Remove file"
            className={css(utils.flexColumn, utils.alignItemsCenter, styles.removeBtn)}
            onClick={handleRemove}
            disabled={disabled}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

const getStyles = (theme: ThemeTokens) => ({
  wrapper: {
    width: '100%',
    gap: theme.spacing.unit,
  },
  uploadArea: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    border: `2px dashed ${theme.colors.outlineVariant}`,
    borderRadius: theme.shape.radiusCard,
    padding: theme.spacing.gutterMd,
  },
  uploadWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontBody,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.bodyMd,
    padding: '12px 24px',
    borderRadius: theme.shape.radiusButton,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    ':hover': {
      opacity: 0.9,
    },
    ':active': {
      transform: 'scale(0.98)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  fileInfo: {
    backgroundColor: theme.colors.tintBg,
    borderRadius: theme.shape.radiusCard,
    border: `1px solid ${theme.colors.outlineVariant}`,
    padding: theme.spacing.gutterSm,
  },
  fileInfoGroup: {
    gap: theme.spacing.gutterSm,
  },
  fileIconWrapper: {
    ...getIconBoxStyle(theme),
  },
  fileDetails: {
    gap: '4px',
  },
  fileName: {
    whiteSpace: 'nowrap',
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: theme.typography.weights.semibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '320px',
    [mobileView]: { maxWidth: '200px' },
  },
  fileMeta: {
    fontFamily: theme.typography.fontMono,
    fontSize: theme.typography.sizes.labelCaps,
    color: theme.colors.onSurfaceVariant,
    fontVariantNumeric: 'tabular-nums',
  },
  removeBtn: {
    color: theme.colors.onSurfaceVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.shape.radiusIconBox, // rounded-full
    padding: theme.spacing.unit,
    border: `1px solid ${theme.colors.outlineVariant}`,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': { color: theme.colors.error },
    ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});
