import type { Translations } from '../locales';
import type { TemplateId } from '../types';

export const DEFAULT_TEMPLATE_ID: TemplateId = 'note';
export const CARD_TEMPLATE_IDS: TemplateId[] = [
  'note',
  'checklist',
  'goal',
  'retro',
  'project',
];

export const getTemplateDefaultText = (t: Translations, templateId: TemplateId): string => {
  const template = t.templates?.items?.[templateId];
  return template?.defaultText || '';
};
