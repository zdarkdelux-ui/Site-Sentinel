import { PageMetadata, ChangeEvent, Criticality } from '../types';

export function compareMetadata(
  projectId: string,
  url: string,
  oldMeta: PageMetadata,
  newMeta: PageMetadata
): ChangeEvent[] {
  const changes: ChangeEvent[] = [];
  const timestamp = new Date().toISOString();

  const addChange = (
    type: ChangeEvent['type'],
    field: string,
    oldVal: any,
    newVal: any,
    criticality: Criticality
  ) => {
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        id: Math.random().toString(36).substring(2),
        projectId,
        url,
        type,
        field,
        oldValue: oldVal,
        newValue: newVal,
        criticality,
        timestamp,
        isViewed: false,
      });
    }
  };

  // Status
  if (newMeta.status >= 500) {
    addChange('Status', 'HTTP Status', oldMeta.status, newMeta.status, 'Critical');
  } else if (newMeta.status !== oldMeta.status) {
    addChange('Status', 'HTTP Status', oldMeta.status, newMeta.status, 'High');
  }

  // SEO
  addChange('SEO', 'Title', oldMeta.title, newMeta.title, 'High');
  addChange('SEO', 'Description', oldMeta.description, newMeta.description, 'High');
  addChange('SEO', 'H1', oldMeta.h1, newMeta.h1, 'High');
  addChange('SEO', 'Canonical', oldMeta.canonical, newMeta.canonical, 'High');
  addChange('SEO', 'Robots', oldMeta.robots, newMeta.robots, 'High');

  // Content
  const lengthDiff = Math.abs(newMeta.textLength - oldMeta.textLength);
  const lengthRatio = lengthDiff / (oldMeta.textLength || 1);
  if (lengthRatio > 0.5) {
    addChange('Content', 'Text Content', 'Significant change', 'Significant change', 'High');
  } else if (lengthRatio > 0.1) {
    addChange('Content', 'Text Content', 'Minor change', 'Minor change', 'Medium');
  }

  // Structure
  addChange('Structure', 'Forms', oldMeta.formsCount, newMeta.formsCount, 'Critical');
  addChange('Structure', 'H2s', oldMeta.h2s.length, newMeta.h2s.length, 'Medium');

  // Links & Images
  addChange('Links', 'Links Count', oldMeta.linksCount, newMeta.linksCount, 'Medium');
  addChange('Images', 'Images Count', oldMeta.imagesCount, newMeta.imagesCount, 'Medium');

  return changes;
}
