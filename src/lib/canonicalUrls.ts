import { keyStageToPhaseMap } from './oakConsts';

export function getOakUrlForLesson(lessonSlug: string): string {
  return `https://www.thenational.academy/teachers/lessons/${lessonSlug}`;
}

export function getCanonicalUrlForLesson(
  lessonSlug: string,
  unitSlug?: string,
  programmeSlug?: string,
): string {
  if (unitSlug && !programmeSlug) {
    throw new Error(
      'Programme is required to generate canonical URL for lesson',
    );
  }

  if (unitSlug && programmeSlug) {
    return `https://www.thenational.academy/teachers/programmes/${programmeSlug}/units/${unitSlug}/lessons/${lessonSlug}`;
  }

  return `https://www.thenational.academy/teachers/lessons/${lessonSlug}`;
}

export function getCanonicalUrlForUnit(
  unitSlug: string,
  programmeSlug: string,
): string {
  if (!programmeSlug) {
    throw new Error('Programme is required to generate canonical URL for unit');
  }

  return `https://www.thenational.academy/teachers/programmes/${programmeSlug}/units/${unitSlug}/lessons`;
}

export function getCanonicalUrlForSubject(programmeSlug: string): string {
  return `https://www.thenational.academy/teachers/programmes/${programmeSlug}/units`;
}

export function getCanonicalUrlForKeyStage(keyStageSlug: string): string {
  return `https://www.thenational.academy/teachers/key-stages/${keyStageSlug}/subjects`;
}

export function createProgrammeSlug(
  subjectSlug: string,
  keystageSlug: string,
  examboardSlug?: string | null,
  tierSlug?: string | null,
  pathwaySlug?: string | null,
) {
  const phaseSlug = keyStageToPhaseMap[keystageSlug];

  if (keystageSlug === 'ks4') {
    const parts: string[] = [subjectSlug, phaseSlug, keystageSlug];

    if (tierSlug) {
      parts.push(tierSlug);
    }

    if (pathwaySlug) {
      parts.push(pathwaySlug);
    }

    if (
      examboardSlug &&
      pathwaySlug !== 'core' &&
      examboardSlug !== pathwaySlug
    ) {
      parts.push(examboardSlug);
    }

    return parts.join('-');
  } else if (subjectSlug && phaseSlug && keystageSlug) {
    return [subjectSlug, phaseSlug, keystageSlug].join('-');
  }
  return '';
}
