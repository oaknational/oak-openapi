declare module 'array.prototype.tosorted';
declare module 'object.groupby';

type Category = {
  categoryTitle: string;
  categorySlug?: string;
};

type UnitOption = {
  unitTitle: string;
  unitSlug: string;
};

type UnitWithOptions = {
  unitTitle: string;
  unitOrder: number;
  unitOptions: UnitOption[];
  categories?: Category[];
};

type UnitNoOptions = {
  unitTitle: string;
  unitOrder: number;
  unitSlug: string;
  categories?: Category[];
};

type Unit = UnitWithOptions | UnitNoOptions;

type Tier = {
  tier: string;
  units: Unit[];
};

type ExamSubjectsWithTiers = {
  examSubjectTitle: string;
  examSubjectSlug?: string;
  tiers: Tier[];
};

type ExamSubjectsWithoutTiers = {
  examSubjectTitle: string;
  examSubjectSlug?: string;
  units: Unit[];
};

type YearSequenceKS4 = {
  year: number;
  examSubjects: (ExamSubjectsWithTiers | ExamSubjectsWithoutTiers)[];
};

type YearSequence = {
  year: number;
  units: Unit[];
};

type Sequence = YearSequence | YearSequenceKS4;
