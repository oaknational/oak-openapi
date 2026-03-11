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
