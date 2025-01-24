import {
  subjects as _subjectSlugs,
  subjectTitles,
  keystages as _keyStages,
  keystageTitles,
} from '~/lib/oakConsts';

export const keyStageSlugs = _keyStages.filter((_) => _.startsWith('ks'));
export const keyStages = _keyStages.map((slug, index) => ({
  slug,
  title: keystageTitles[index],
}));
export const subjectsByKeyStage = () =>
  _subjectSlugs.map((slug, index) => ({ slug, title: subjectTitles[index] }));
export const subjectSlugs = Array.from(_subjectSlugs).sort();
export const subjects = subjectTitles;
