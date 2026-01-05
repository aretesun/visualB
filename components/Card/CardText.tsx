import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { TemplateId } from '../../types';

interface CardTextProps {
  text?: string;
  isEditing: boolean;
  hasImage: boolean;
  tone: 'light' | 'dark';
  templateId?: TemplateId;
  onTextChange: (text: string) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  onDelete: () => void;
}

/**
 * 카드 텍스트 편집 컴포넌트
 * 텍스트 입력, 편집, 저장 기능을 담당
 */
const CardText: React.FC<CardTextProps> = ({
  text,
  isEditing,
  hasImage,
  tone,
  templateId,
  onTextChange,
  onEditStart,
  onEditEnd,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [editText, setEditText] = useState(text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasEditingRef = useRef(false);

  // 모바일 감지 (터치 디바이스)
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isChecklistTemplate = templateId === 'checklist';
  const isGoalTemplate = templateId === 'goal';
  const isRetroTemplate = templateId === 'retro';
  const isProjectTemplate = templateId === 'project';
  const isStructuredTemplate = isGoalTemplate || isRetroTemplate;

  // 편집 모드 진입 시 포커스 (모바일은 자동 포커스 방지)
  useEffect(() => {
    if (isEditing && textareaRef.current && !isMobile) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
    }
  }, [isEditing, isMobile]);

  // text prop이 변경되면 editText도 업데이트
  useEffect(() => {
    setEditText(text || '');
  }, [text]);


  const textClass = tone === 'light' ? 'text-slate-900' : 'text-white';
  const placeholderClass = tone === 'light' ? 'placeholder-slate-500' : 'placeholder-white/40';
  const hintClass = tone === 'light' ? 'text-slate-500 hover:text-slate-700' : 'text-white/30 hover:text-white/50';
  const checkboxClass = tone === 'light'
    ? 'border-slate-300 text-slate-900 focus:ring-slate-400'
    : 'border-white/40 text-white/90 focus:ring-white/60';
  const textShadow = tone === 'light'
    ? '0 1px 2px rgba(255, 255, 255, 0.6)'
    : '0 1px 2px rgba(0, 0, 0, 0.6)';
  const inputClass = tone === 'light'
    ? 'border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-400'
    : 'border-white/30 text-white placeholder-white/40 focus:ring-white/60';

  const getStructuredSections = useCallback(() => {
    if (isGoalTemplate) {
      return [
        { token: '[[goal]]', label: t.templates.sections.goal.goal || 'Goal' },
        { token: '[[reason]]', label: t.templates.sections.goal.reason || 'Why' },
        { token: '[[firstStep]]', label: t.templates.sections.goal.firstStep || 'First step' },
      ];
    }
    if (isRetroTemplate) {
      return [
        { token: '[[keep]]', label: t.templates.sections.retro.keep || 'Keep' },
        { token: '[[problem]]', label: t.templates.sections.retro.problem || 'Problem' },
        { token: '[[try]]', label: t.templates.sections.retro.try || 'Try' },
      ];
    }
    return [];
  }, [isGoalTemplate, isRetroTemplate, t.templates.sections.goal, t.templates.sections.retro]);

  const parseStructuredText = useCallback((
    value: string,
    tokens: { token: string; label: string }[],
    legacyLabels: string[][]
  ) => {
    const lines = value.split('\n');
    const values: string[] = [];
    let currentIndex = -1;

    const tokenMap = new Map(tokens.map((item, index) => [item.token, index]));
    const hasToken = lines.some((line) => tokenMap.has(line.trim()));

    if (hasToken) {
      lines.forEach((line) => {
        if (tokenMap.has(line.trim())) {
          currentIndex = tokenMap.get(line.trim()) ?? -1;
          if (currentIndex >= values.length) {
            values[currentIndex] = '';
          }
          return;
        }
        if (currentIndex >= 0) {
          values[currentIndex] = values[currentIndex]
            ? `${values[currentIndex]}\n${line}`
            : line;
        }
      });
    } else if (legacyLabels.length) {
      const labelMap = legacyLabels.map((labels) =>
        labels
          .filter(Boolean)
          .map((label) => label.trim().toLowerCase())
      );

      lines.forEach((line) => {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();
        const matchedIndex = labelMap.findIndex((labels) =>
          labels.some((label) => lower === label || lower === `${label}:`)
        );

        if (matchedIndex >= 0) {
          currentIndex = matchedIndex;
          values[currentIndex] = '';
          const inlineValue = trimmed.replace(/^[^:]+:\s*/, '');
          if (inlineValue) {
            values[currentIndex] = inlineValue;
          }
          return;
        }

        if (currentIndex >= 0) {
          values[currentIndex] = values[currentIndex]
            ? `${values[currentIndex]}\n${line}`
            : line;
        }
      });
    }

    return tokens.map((_, index) => values[index] || '');
  }, []);

  const buildStructuredText = useCallback((values: string[], tokens: { token: string; label: string }[]) => {
    return tokens
      .map((item, index) => `${item.token}\n${values[index] || ''}`.trimEnd())
      .join('\n');
  }, []);

  const createEmptyProjectValues = useCallback(() => ({
    name: '',
    deadlineDate: '',
    planning: { done: false, text: '' },
    design: { done: false, text: '' },
    development: { done: false, text: '' },
  }), []);

  const parseProjectText = useCallback((value: string) => {
    const tokens = {
      name: '[[projectName]]',
      deadlineDate: '[[deadlineDate]]',
      planning: '[[planning]]',
      design: '[[design]]',
      development: '[[development]]',
    };

    const empty = createEmptyProjectValues();
    const lines = value.split('\n');
    const sections: Record<string, string[]> = {
      name: [],
      deadlineDate: [],
      planning: [],
      design: [],
      development: [],
    };

    let currentKey: keyof typeof sections | null = null;
    const tokenToKey = new Map<string, keyof typeof sections>([
      [tokens.name, 'name'],
      [tokens.deadlineDate, 'deadlineDate'],
      [tokens.planning, 'planning'],
      [tokens.design, 'design'],
      [tokens.development, 'development'],
    ]);

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (tokenToKey.has(trimmed)) {
        currentKey = tokenToKey.get(trimmed) || null;
        return;
      }
      if (currentKey) {
        sections[currentKey].push(line);
      }
    });

    const parseChecklistSection = (lines: string[]) => {
      if (!lines.length) {
        return { done: false, text: '' };
      }
      const [firstLine, ...rest] = lines;
      const match = firstLine.match(/^\s*([xX])\s*\|\s*(.*)$/);
      if (match) {
        const text = [match[2], ...rest].join('\n').trim();
        return { done: true, text };
      }
      const emptyMatch = firstLine.match(/^\s*\|\s*(.*)$/);
      if (emptyMatch) {
        const text = [emptyMatch[1], ...rest].join('\n').trim();
        return { done: false, text };
      }
      return { done: false, text: [firstLine, ...rest].join('\n').trim() };
    };

    return {
      ...empty,
      name: sections.name.join('\n').trim(),
      deadlineDate: sections.deadlineDate.join('\n').trim(),
      planning: parseChecklistSection(sections.planning),
      design: parseChecklistSection(sections.design),
      development: parseChecklistSection(sections.development),
    };
  }, [createEmptyProjectValues]);

  const buildProjectText = useCallback((values: ReturnType<typeof createEmptyProjectValues>) => {
    const buildChecklistLine = (section: { done: boolean; text: string }) => {
      const prefix = section.done ? 'x' : ' ';
      return `${prefix}|${section.text || ''}`.trimEnd();
    };

    return [
      '[[projectName]]',
      values.name || '',
      '[[deadlineDate]]',
      values.deadlineDate || '',
      '[[planning]]',
      buildChecklistLine(values.planning),
      '[[design]]',
      buildChecklistLine(values.design),
      '[[development]]',
      buildChecklistLine(values.development),
    ].join('\n');
  }, [createEmptyProjectValues]);

  const structuredTokens = useMemo(() => getStructuredSections(), [getStructuredSections]);
  const legacyLabels = useMemo(() => {
    if (isGoalTemplate) {
      return [
        [t.templates.sections.goal.goal, 'Goal', '목표'],
        [t.templates.sections.goal.reason, 'Why', '이유'],
        [t.templates.sections.goal.firstStep, 'First step', '첫 행동'],
      ];
    }
    if (isRetroTemplate) {
      return [
        [t.templates.sections.retro.keep, 'Keep'],
        [t.templates.sections.retro.problem, 'Problem'],
        [t.templates.sections.retro.try, 'Try'],
      ];
    }
    return [];
  }, [isGoalTemplate, isRetroTemplate, t.templates.sections.goal, t.templates.sections.retro]);
  const [structuredValues, setStructuredValues] = useState<string[]>(
    () => (isStructuredTemplate ? parseStructuredText(text || '', structuredTokens, legacyLabels) : [])
  );
  const [projectValues, setProjectValues] = useState<ReturnType<typeof createEmptyProjectValues>>(
    () => (isProjectTemplate ? parseProjectText(text || '') : createEmptyProjectValues())
  );

  useEffect(() => {
    if (!isStructuredTemplate) {
      setStructuredValues([]);
      return;
    }
    setStructuredValues(parseStructuredText(text || '', structuredTokens, legacyLabels));
  }, [text, isStructuredTemplate, parseStructuredText, structuredTokens, legacyLabels]);

  useEffect(() => {
    if (!isProjectTemplate) {
      setProjectValues(createEmptyProjectValues());
      return;
    }
    setProjectValues(parseProjectText(text || ''));
  }, [text, isProjectTemplate, parseProjectText, createEmptyProjectValues]);

  const handleSave = useCallback(() => {
    const nextText = isProjectTemplate
      ? buildProjectText(projectValues)
      : isStructuredTemplate
        ? buildStructuredText(structuredValues, structuredTokens)
        : editText;
    const currentText = text || '';
    if (nextText === currentText) {
      return;
    }
    if (nextText.trim()) {
      onTextChange(nextText);
      return;
    }
    if (!hasImage && currentText !== '') {
      onTextChange('');
      return;
    }
    if (hasImage) {
      onTextChange('');
    }
  }, [
    buildProjectText,
    buildStructuredText,
    editText,
    hasImage,
    isProjectTemplate,
    isStructuredTemplate,
    onTextChange,
    projectValues,
    structuredTokens,
    structuredValues,
    text,
  ]);

  useEffect(() => {
    if (wasEditingRef.current && !isEditing) {
      handleSave();
    }
    wasEditingRef.current = isEditing;
  }, [handleSave, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && isChecklistTemplate) {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? editText.length;
      const end = textarea?.selectionEnd ?? editText.length;
      const needsLeadingNewline = start > 0 && editText[start - 1] !== '\n';
      const insertText = `${needsLeadingNewline ? '\n' : ''}- [ ] `;
      const nextText = `${editText.slice(0, start)}${insertText}${editText.slice(end)}`;
      setEditText(nextText);
      requestAnimationFrame(() => {
        if (textarea) {
          const cursor = start + insertText.length;
          textarea.setSelectionRange(cursor, cursor);
        }
      });
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (!text && !hasImage) {
        onDelete();
      } else {
        setEditText(text || '');
        onEditEnd();
      }
    }
  };

  const renderChecklist = () => {
    const lines = (text || '').split('\n');
    const items = lines
      .map((line) => {
        const match = line.match(/^- \[( |x|X)\]\s*(.*)$/);
        if (match) {
          return { checked: match[1].toLowerCase() === 'x', label: match[2].trim() };
        }
        const trimmed = line.trim();
        if (!trimmed) {
          return null;
        }
        return { checked: false, label: trimmed };
      })
      .filter((item): item is { checked: boolean; label: string } => !!item);

    if (items.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <label
            key={`${item.label}-${index}`}
            className={`flex items-start gap-2 text-sm ${textClass}`}
            style={{ textShadow }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {
                const nextItems = items.map((current, itemIndex) =>
                  itemIndex === index ? { ...current, checked: !current.checked } : current
                );
                const nextText = nextItems
                  .map((current) => `- [${current.checked ? 'x' : ' '}] ${current.label}`)
                  .join('\n');
                onTextChange(nextText);
              }}
              className={`mt-1 h-4 w-4 rounded bg-transparent focus:ring-1 ${checkboxClass}`}
            />
            <span className={item.checked ? 'line-through opacity-60' : ''}>{item.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderStructuredPreview = () => {
    const sections = structuredTokens.map((section, index) => ({
      label: section.label,
      value: structuredValues[index] || '',
    }));

    return (
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
              {section.label}
            </div>
            <div className={`text-sm whitespace-pre-wrap ${textClass}`} style={{ textShadow }}>
              {section.value || '—'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectPreview = () => {
    const sections = [
      {
        label: t.templates.sections.project.name,
        value: projectValues.name,
      },
      {
        label: t.templates.sections.project.deadlineDate,
        value: projectValues.deadlineDate,
      },
      {
        label: t.templates.sections.project.planning,
        value: projectValues.planning.text,
        done: projectValues.planning.done,
      },
      {
        label: t.templates.sections.project.design,
        value: projectValues.design.text,
        done: projectValues.design.done,
      },
      {
        label: t.templates.sections.project.development,
        value: projectValues.development.text,
        done: projectValues.development.done,
      },
    ];

    return (
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
              {section.label}
            </div>
            <div
              className={`text-sm whitespace-pre-wrap ${textClass} ${
                section.done ? 'line-through opacity-60' : ''
              }`}
              style={{ textShadow }}
            >
              {section.value || '—'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectEditor = () => {
    const updateField = (field: 'name' | 'deadlineDate', value: string) => {
      setProjectValues((prev) => ({ ...prev, [field]: value }));
    };

    const updateSection = (
      field: 'planning' | 'design' | 'development',
      updates: Partial<{ done: boolean; text: string }>
    ) => {
      setProjectValues((prev) => ({
        ...prev,
        [field]: { ...prev[field], ...updates },
      }));
    };

    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
            {t.templates.sections.project.name}
          </label>
          <input
            type="text"
            value={projectValues.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={handleSave}
            className={`w-full bg-transparent focus:outline-none rounded-md border border-dashed px-2 py-1 ${inputClass}`}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
            {t.templates.sections.project.deadlineDate}
          </label>
          <input
            type="date"
            value={projectValues.deadlineDate}
            onChange={(e) => updateField('deadlineDate', e.target.value)}
            onBlur={handleSave}
            className={`w-full bg-transparent focus:outline-none rounded-md border border-dashed px-2 py-1 ${inputClass}`}
          />
        </div>

        {(['planning', 'design', 'development'] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
              {t.templates.sections.project[field]}
            </label>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={projectValues[field].done}
                onChange={() => updateSection(field, { done: !projectValues[field].done })}
                className={`mt-1 h-4 w-4 rounded bg-transparent focus:ring-1 ${checkboxClass}`}
              />
              <textarea
                value={projectValues[field].text}
                onChange={(e) => updateSection(field, { text: e.target.value })}
                onBlur={handleSave}
                rows={2}
                className={`w-full bg-transparent focus:outline-none resize-none rounded-md border border-dashed px-2 py-1 ${inputClass}`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isEditing && !text && hasImage) {
    return null;
  }

  return (
    <div className="flex-1 mb-3">
      {isEditing ? (
        isProjectTemplate ? (
          renderProjectEditor()
        ) : isStructuredTemplate ? (
          <div className="space-y-3">
            {structuredTokens.map((section, index) => (
              <div key={section.token} className="space-y-1">
                <label className={`text-xs uppercase tracking-wide ${textClass}`} style={{ textShadow }}>
                  {section.label}
                </label>
                <textarea
                  value={structuredValues[index] || ''}
                  onChange={(e) => {
                    const nextValues = [...structuredValues];
                    nextValues[index] = e.target.value;
                    setStructuredValues(nextValues);
                  }}
                  onBlur={handleSave}
                  rows={3}
                  className={`w-full bg-transparent focus:outline-none resize-none rounded-md border border-dashed px-2 py-1 ${inputClass}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={t.card.placeholder}
            maxLength={300}
            className={`w-full h-24 bg-transparent focus:outline-none resize-none ${textClass} ${placeholderClass}`}
            style={{ textShadow }}
          />
        )
      ) : text ? (
        isChecklistTemplate ? (
          <div
            onClick={onEditStart}
            className="cursor-text"
          >
            {renderChecklist()}
          </div>
        ) : isProjectTemplate ? (
          <div
            onClick={onEditStart}
            className="cursor-text"
          >
            {renderProjectPreview()}
          </div>
        ) : isStructuredTemplate ? (
          <div
            onClick={onEditStart}
            className="cursor-text"
          >
            {renderStructuredPreview()}
          </div>
        ) : (
          <p
            onClick={onEditStart}
            className={`text-base font-light break-words cursor-text ${textClass}`}
            style={{ textShadow }}
          >
            {text}
          </p>
        )
      ) : isMobile ? (
        // 모바일: "텍스트 추가" 버튼 표시
        <button
          onClick={onEditStart}
          className="w-full h-12 border-2 border-dashed border-white/30 rounded-md flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white/70 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">{t.card.addText || '텍스트 추가'}</span>
        </button>
      ) : (
        // 데스크톱: 빈 영역 클릭 시 편집 모드
        <div
          onClick={onEditStart}
          className={`w-full h-12 flex items-center justify-center cursor-text transition-colors ${hintClass}`}
        >
          <span className="text-sm">{t.card.placeholder || '텍스트를 입력하세요...'}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(CardText, (prev, next) => {
  return (
    prev.text === next.text &&
    prev.isEditing === next.isEditing &&
    prev.hasImage === next.hasImage &&
    prev.tone === next.tone &&
    prev.templateId === next.templateId
  );
});
