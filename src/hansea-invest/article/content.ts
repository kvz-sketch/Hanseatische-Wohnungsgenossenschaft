// Advertorial article for the Hanseatische Invest eG Taboola campaign
// (ratgeber.hanseainvest.de). Text as supplied by the client; dashes were
// replaced with commas per the client's style, and the locations and term
// details were aligned with the terms on hanseainvest.de.

export const article = {
  kicker: "Ratgeber Vermögensplanung",
  title: "Immobilien kaufen oder sich beteiligen? Was Anleger vorher wissen sollten",
  dek: "Wer in Immobilien investieren möchte, muss nicht zwangsläufig selbst eine Wohnung kaufen. Welche Möglichkeiten es gibt und warum Kapitalbindung, persönlicher Aufwand und Lebensplanung bei der Entscheidung eine wichtige Rolle spielen.",
  readingMinutes: 5,
};

// A section body is a list of blocks: plain paragraphs, highlighted
// statements, or numbered points with a short title.
export type Block =
  | { kind: "p"; text: string }
  | { kind: "highlight"; text: string }
  | { kind: "points"; items: { title: string; text: string }[] };

export type Section = {
  id: string;
  heading: string;
  blocks: Block[];
};

const p = (text: string): Block => ({ kind: "p", text });

export const sections: Section[] = [
  {
    id: "einstieg",
    heading: "Immobilien sind interessant. Aber ist eine eigene Wohnung immer die richtige Entscheidung?",
    blocks: [
      p("Immobilien gehören für viele Menschen zu einer langfristigen Vermögensstrategie. Sie bieten die Möglichkeit, an Mieteinnahmen und der wirtschaftlichen Entwicklung von Wohnimmobilien teilzuhaben."),
      p("Doch wer heute über eine Immobilieninvestition nachdenkt, stellt möglicherweise andere Fragen als noch vor einigen Jahren."),
      p("Möchte ich wirklich selbst eine Wohnung kaufen? Wie viel Zeit will ich in Verwaltung und Vermietung investieren? Und wie lange kann ich auf mein Kapital verzichten?"),
      p("Denn eine Immobilieninvestition sollte nicht nur wirtschaftlich sinnvoll erscheinen. Sie muss auch zu den eigenen Zielen, der persönlichen Lebenssituation und dem verfügbaren Kapital passen."),
      p("Dabei lohnt es sich, über den klassischen Wohnungskauf hinauszuschauen."),
    ],
  },
  {
    id: "eigene-wohnung",
    heading: "Eine eigene Wohnung bedeutet mehr als nur den Kaufpreis",
    blocks: [
      p("Wer eine Eigentumswohnung als Investment kauft, erwirbt einen konkreten Vermögenswert. Gleichzeitig entstehen Aufgaben und Verpflichtungen, die häufig unterschätzt werden."),
      p("Bereits vor dem Kauf müssen Standort, Objektzustand, Finanzierung und mögliche Mieterträge geprüft werden. Anschließend folgen laufende Themen wie Vermietung, Instandhaltung, Hausgeldabrechnungen und mögliche Modernisierungen."),
      p("Viele dieser Aufgaben lassen sich an eine professionelle Verwaltung übertragen. Die wirtschaftliche Verantwortung bleibt jedoch beim Eigentümer."),
      p("Für manche Anleger ist das genau das richtige Modell. Sie möchten selbst entscheiden, welche Immobilie gekauft wird, und die Entwicklung ihres Eigentums aktiv gestalten."),
      p("Andere interessieren sich vor allem für Immobilien als Anlageklasse, ohne die zusätzliche Verantwortung eines eigenen Wohnungsbestands übernehmen zu wollen."),
      {
        kind: "highlight",
        text: "Deshalb stellt sich vor dem Kauf eine grundlegende Frage: Möchte ich selbst Immobilieneigentümer werden oder mich lieber an einer Immobilienstrategie beteiligen?",
      },
    ],
  },
  {
    id: "lebensplanung",
    heading: "Wenn sich die Lebensplanung verändert, verändern sich auch die Anforderungen",
    blocks: [
      p("Eine Investition, die heute gut zur persönlichen Situation passt, kann in einigen Jahren anders bewertet werden."),
      p("Gerade Unternehmer und Freiberufler kennen diese Herausforderung. Kapital, das momentan zur Verfügung steht, könnte später für die Expansion des eigenen Unternehmens, eine Praxisübernahme oder größere Investitionen benötigt werden."),
      p("Auch Menschen, die bereits Vermögen aufgebaut haben, setzen mit zunehmender Lebenserfahrung häufig andere Prioritäten."),
      p("Vielleicht steht nicht mehr der Aufbau eines weiteren eigenen Immobilienbestands im Vordergrund, sondern der Wunsch nach weniger organisatorischem Aufwand und einer übersichtlicheren Vermögensstruktur."),
      p("Eine weitere Eigentumswohnung kann weiterhin infrage kommen. Ebenso kann es sinnvoll sein, andere Formen der Immobilieninvestition zu prüfen."),
      p("Entscheidend ist dabei nicht das Alter oder der Beruf, sondern die Frage, welche Anforderungen die jeweilige Investition erfüllen soll."),
    ],
  },
  {
    id: "unterschied",
    heading: "Wohnungskauf oder Immobilienbeteiligung: Wo liegt der Unterschied?",
    blocks: [
      p("Neben dem direkten Immobilienkauf gibt es die Möglichkeit, sich an Unternehmen oder Genossenschaften zu beteiligen, die selbst Immobilien erwerben, entwickeln und bewirtschaften."),
      p("Bei einem eigenen Wohnungskauf wird der Anleger Eigentümer einer konkreten Immobilie."),
      p("Bei einer Genossenschaftsbeteiligung erwirbt er dagegen Anteile an einer Genossenschaft. Die operative Umsetzung der Immobilienstrategie liegt bei dieser Organisation."),
      p("Dadurch unterscheiden sich beide Ansätze insbesondere in drei Punkten:"),
      {
        kind: "points",
        items: [
          {
            title: "Persönlicher Aufwand",
            text: "Eigentümer müssen die Verwaltung ihrer Immobilie selbst organisieren oder Dienstleister damit beauftragen. Bei einer Immobiliengenossenschaft wird die operative Arbeit gemeinschaftlich organisiert.",
          },
          {
            title: "Einfluss und Verantwortung",
            text: "Der Eigentümer entscheidet unmittelbar über seine Immobilie und trägt die damit verbundenen Verpflichtungen. Bei einer Beteiligung richten sich die Mitwirkungsrechte nach den rechtlichen und vertraglichen Bedingungen.",
          },
          {
            title: "Kapitalbindung und Risiken",
            text: "Eine eigene Immobilie lässt sich grundsätzlich verkaufen, wobei Verkaufsdauer, Marktbedingungen und mögliche Finanzierungskosten eine Rolle spielen. Eine Genossenschaftsbeteiligung unterliegt dagegen den jeweiligen Laufzeit-, Kündigungs- und Rückzahlungsbedingungen. Zudem besteht ein unternehmerisches Risiko, das bis zum Verlust des eingesetzten Kapitals reichen kann.",
          },
        ],
      },
      p("Keine dieser Anlageformen ist grundsätzlich die bessere Wahl. Entscheidend ist, welche Struktur zu den individuellen Zielen und Möglichkeiten passt."),
    ],
  },
  {
    id: "praxis",
    heading: "Wie funktioniert eine Immobilienbeteiligung in der Praxis?",
    blocks: [
      p("Ein Beispiel für ein solches Modell ist die Hanseatische Invest eG aus Hamburg."),
      p("Über Genossenschaftsanteile können sich Anleger an einer gemeinschaftlichen Immobilienstrategie beteiligen, ohne selbst eine Wohnung kaufen, finanzieren oder verwalten zu müssen."),
      p("Die Immobilienprojekte werden gemeinsam mit der Gerlach Immobilien Gruppe umgesetzt."),
      p("Im Mittelpunkt stehen Mehrfamilienhäuser in deutschen A-Städten und Wachstumsregionen. Sie werden angekauft, modernisiert, vermietet und die Wohnungen anschließend einzeln verkauft."),
      p("Das Ziel ist es, durch die Entwicklung und Bewirtschaftung der Immobilien wirtschaftliche Überschüsse zu erwirtschaften."),
      p("Mit dem Erwerb von Genossenschaftsanteilen entsteht jedoch kein direktes Eigentum an einer bestimmten Immobilie. Mitglieder beteiligen sich unternehmerisch an der Genossenschaft und tragen die damit verbundenen Risiken."),
    ],
  },
  {
    id: "kapitalbindung",
    heading: "Warum eine kurze Projektdauer nicht automatisch eine kurze Kapitalbindung bedeutet",
    blocks: [
      p("Bei Immobilienbeteiligungen werden häufig verschiedene Zeiträume miteinander verwechselt."),
      p("Die erste Zeitspanne betrifft das Immobilienprojekt selbst: Ein Objekt wird angekauft, entwickelt, vermietet oder verkauft."),
      p("Die zweite betrifft den Anleger und sein eingesetztes Kapital."),
      p("Auch wenn ein Immobilienprojekt erfolgreich abgeschlossen und eine Immobilie verkauft wurde, bedeutet das nicht automatisch, dass Genossenschaftsmitglieder ihre Anteile unmittelbar zurückgeben oder eine Rückzahlung verlangen können."),
      p("Bei der Hanseatischen Invest eG beträgt die Laufzeit zunächst 12 Monate. Wer nicht spätestens neun Monate vor Ablauf kündigt, bleibt ein weiteres Jahr beteiligt. Nach einer Kündigung wird das Guthaben aus dem Jahresabschluss ermittelt und kann unter der Einzahlung liegen. Maßgeblich sind die Satzung und die Beteiligungsbedingungen."),
      p("Eine vollständige Rückzahlung des eingesetzten Kapitals ist nicht garantiert."),
      p("Gerade für Menschen mit zukünftigen finanziellen Verpflichtungen ist es deshalb wichtig, diese Unterschiede vor einer Anlageentscheidung genau zu verstehen."),
    ],
  },
  {
    id: "sechs-fragen",
    heading: "Sechs Fragen, die Sie vor einer Immobilieninvestition klären sollten",
    blocks: [
      {
        kind: "points",
        items: [
          {
            title: "Welches Kapital steht tatsächlich zur Verfügung?",
            text: "Berücksichtigen Sie notwendige Rücklagen, laufende Verpflichtungen und mögliche größere Ausgaben in den kommenden Jahren.",
          },
          {
            title: "Wie lange können Sie auf das Geld verzichten?",
            text: "Eine Investition sollte zum persönlichen Zeithorizont passen. Mindestlaufzeiten und Kündigungsfristen müssen dabei gemeinsam betrachtet werden.",
          },
          {
            title: "Möchten Sie selbst Eigentümer werden?",
            text: "Der direkte Wohnungskauf und eine Beteiligung über Genossenschaftsanteile unterscheiden sich rechtlich, wirtschaftlich und organisatorisch erheblich.",
          },
          {
            title: "Wie viel Zeit möchten Sie investieren?",
            text: "Mieterkommunikation, Instandhaltung und Verwaltung können Aufwand verursachen, auch wenn einzelne Aufgaben ausgelagert werden.",
          },
          {
            title: "Welche wirtschaftlichen Risiken können Sie tragen?",
            text: "Immobilienwerte und Erträge können schwanken. Bei unternehmerischen Beteiligungen ist auch ein teilweiser oder vollständiger Kapitalverlust möglich.",
          },
          {
            title: "Verstehen Sie das Geschäftsmodell und die Bedingungen?",
            text: "Prüfen Sie die Verwendung des Kapitals, die Beteiligungsrechte, die wirtschaftliche Strategie sowie alle Laufzeit-, Kündigungs- und Rückzahlungsregelungen.",
          },
        ],
      },
    ],
  },
  {
    id: "fazit",
    heading: "Fazit: Die passende Immobilieninvestition beginnt mit den richtigen Fragen",
    blocks: [
      p("Ob eine Eigentumswohnung, eine Immobilienbeteiligung oder eine andere Anlageform infrage kommt, hängt nicht allein vom verfügbaren Kapital ab."),
      p("Ebenso wichtig sind die persönlichen Ziele, der gewünschte Zeitaufwand, die finanzielle Flexibilität und die Bereitschaft, wirtschaftliche Risiken zu übernehmen."),
      p("Wer diese Faktoren berücksichtigt, kann verschiedene Möglichkeiten besser miteinander vergleichen."),
      { kind: "highlight", text: "Denn eine Immobilieninvestition sollte sich in die Lebensplanung einfügen und nicht umgekehrt." },
    ],
  },
];

// Call to action placed at the end of the "praxis" section.
export const modelCta = {
  heading: "Mehr über das Beteiligungsmodell erfahren",
  text: "Wie funktioniert die Immobilienstrategie? Welche Beteiligungsbedingungen gelten? Und welche Chancen und Risiken sollten Anleger kennen?",
  note: "Das kostenlose Infopaket der Hanseatischen Invest eG erklärt das Modell und seine Rahmenbedingungen.",
  button: "Beteiligungsmodell und Konditionen ansehen",
};

// Closing box after the Fazit.
export const closingCta = {
  heading: "Immobilienbeteiligung näher kennenlernen",
  paragraphs: [
    "Sie interessieren sich für Immobilien, möchten aber nicht unbedingt selbst Eigentümer und Vermieter werden?",
    "Die Hanseatische Invest eG bietet die Möglichkeit, sich über Genossenschaftsanteile an einer professionell organisierten Immobilienstrategie zu beteiligen.",
    "Im kostenlosen Infopaket erfahren Sie mehr über die Beteiligungsmöglichkeiten, die Immobilienstrategie, die geltenden Konditionen sowie die Chancen und Risiken.",
  ],
  button: "Kostenloses Infopaket anfordern",
};

export const riskNotice =
  "Der Erwerb von Genossenschaftsanteilen ist eine unternehmerische Beteiligung mit Verlustrisiken bis hin zum vollständigen Verlust des eingesetzten Kapitals. Angestrebte Erträge und Rückzahlungen sind nicht garantiert. Maßgeblich sind die geltende Satzung und die vollständigen Beteiligungsunterlagen.";
