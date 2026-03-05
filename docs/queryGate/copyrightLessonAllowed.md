flowchart TD
  A["Start: blockLessonForCopyrightText"] --> B{supportedLessons<br/>includes lesson?}
  B -- Yes --> B1["Return allowed:<br/>Lesson is in supported content"]
  B -- No --> C["getSubjectAndUnitForLesson"]
  C --> D{Found subject + unit?}
  D -- No --> D1["Return blocked:<br/>Unknown subject"]
  D -- Yes --> E{supportedUnits<br/>includes unit?}
  E -- Yes --> E1["Return allowed:<br/>Unit is in supported content"]
  E -- No --> F{blockedSubjects<br/>includes subject?}
  F -- Yes --> F1["Return blocked:<br/>Subject is blocked,<br/>without unit allow rule"]
  F -- No --> F2["Return allowed:<br/>Unit and subject are supported"]