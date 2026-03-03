flowchart TD
  A["Start: blockUnitForCopyrightText"] --> B{Unit slug<br/>ends with -digit?<br/>i.e. unit variant}
  B -- Yes --> B1{supportedUnits<br/>includes unit base?}
  B1 -- Yes --> B1a["Return allowed:<br/>Unit base is in supported content"]
  B1 -- No --> C{supportedUnits<br/>includes unit?}
  B -- No --> C{supportedUnits<br/>includes unit?}
  C -- Yes --> C1["Return allowed:<br/>Unit is in supported content"]
  C -- No --> D["getSubjectForUnit"]
  D --> E{Found subject?}
  E -- No --> E1["Return blocked:<br/>Unknown subject"]
  E -- Yes --> F{blockedSubjects<br/>includes subject?}
  F -- Yes --> F1["Return blocked:<br/>Subject is blocked,<br/>without unit or lesson allow rule"]
  F -- No --> F2["Return allowed:<br/>Unit and subject are supported"]