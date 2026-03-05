flowchart TD
  A["Start: lessonAllowedAsset?"] --> B{isLessonBlocked?}
  B -- Yes --> B1["Return blocked:<br/>Lesson is blocked / restricted"]
  B -- No --> C["getSubjectAndUnitForLesson"]
  C --> D{Found subject + unit?}
  D -- No --> D1["Return blocked:<br/>Subject and unit not found"]
  D -- Yes --> E{isUnitBlocked?}
  E -- Yes --> E1["Return blocked:<br/>Unit is blocked / restricted"]
  E -- No --> F{isSubjectSupported?}
  F -- Yes --> F1["Return allowed:<br/>Subject is supported"]
  F -- No --> G{isUnitSupported?}
  G -- Yes --> G1["Return allowed:<br/>Unit is supported"]
  G -- No --> H{isLessonSupported?}
  H -- Yes --> H1["Return allowed:<br/>Lesson is supported"]
  H -- No --> I["Return blocked:<br/>Lesson not available,<br/>subject and unit blocked"]