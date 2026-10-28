// Advertorial article for the Hansea Invest Taboola campaign
// (/hansea-invest/ratgeber/). Text as supplied by the client; only the
// editorial extras (pull quote, diagram labels, checklist) are derived from it.

export const article = {
  kicker: "Ratgeber Vermögensplanung",
  title: "Immobilieninvestitionen müssen zur Lebensplanung passen",
  dek: "Kapital und Interesse am Immobilienmarkt sind vorhanden. Ob ein Investment trotzdem passt, entscheidet vor allem eine Frage: Wie lange soll das Geld gebunden sein?",
  readingMinutes: 4,
};

export type Section = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export const sections: Section[] = [
  {
    id: "interesse",
    heading: "Interesse allein entscheidet noch nicht über den Kauf",
    paragraphs: [
      "Eine vermietete Eigentumswohnung kann als Kapitalanlage interessant sein. Dennoch passt der Kauf nicht automatisch zur persönlichen Situation. Wer eine Wohnung erwirbt, entscheidet sich für Eigentum, übernimmt Verantwortung und plant häufig über viele Jahre.",
      "Genau diese Bindung kann gegen einen Kauf sprechen, obwohl Kapital vorhanden ist und Interesse am Immobilienmarkt besteht. Die entscheidende Frage lautet deshalb: Über welchen Zeitraum soll das Geld investiert werden, und welche Aufgaben soll es danach erfüllen?",
      "Eine wirtschaftlich sinnvolle Anlageentscheidung beginnt mit dieser Einordnung.",
    ],
  },
  {
    id: "unternehmer",
    heading: "Unternehmerische Vorhaben bestimmen den Zeithorizont",
    paragraphs: [
      "Gerade bei Unternehmern und Freiberuflern steht privates Vermögen häufig in Verbindung mit beruflichen Plänen. Kapital kann heute für eine Anlage zur Verfügung stehen und später für ein konkretes Vorhaben benötigt werden.",
      "Ein Unternehmer plant beispielsweise, in einigen Jahren einen weiteren Standort aufzubauen. Eine Ärztin erwägt die Übernahme einer Praxis, möchte sich aber zunächst beruflich weiter orientieren. In beiden Fällen beeinflusst der mögliche spätere Kapitalbedarf bereits die heutige Entscheidung.",
      "Daraus entsteht der Wunsch nach einer überschaubareren Bindung. Entscheidend bleibt, ob die Bedingungen einer Investition mit den eigenen Vorhaben vereinbar sind. Ein kürzerer Anlagehorizont bedeutet schließlich noch keine jederzeitige Verfügbarkeit.",
    ],
  },
  {
    id: "prioritaeten",
    heading: "Mit aufgebautem Vermögen verändern sich die Prioritäten",
    paragraphs: [
      "Auch Menschen, die bereits Vermögen aufgebaut haben, bewerten neue Investitionen möglicherweise anders als früher. Ab etwa 50 können die Gestaltung der nächsten Lebensphase und der gewünschte persönliche Aufwand stärker in den Vordergrund rücken.",
      "Eine weitere Eigentumswohnung kann weiterhin sinnvoll erscheinen. Sie kann aber ebenso zusätzliche Verpflichtungen mit sich bringen, die jemand bewusst nicht mehr übernehmen möchte.",
      "Ein überschaubarerer Anlagehorizont ist deshalb zunächst eine persönliche Präferenz. Ob eine Investition dazu passt, hängt von ihren tatsächlichen Bedingungen ab. Eine kurze beworbene Laufzeit allein beantwortet diese Frage noch nicht.",
    ],
  },
  {
    id: "anlageformen",
    heading: "Immobilienwirtschaft umfasst unterschiedliche Anlageformen",
    paragraphs: [
      "Wer sich mit Immobilien beschäftigt, begegnet unterschiedlichen wirtschaftlichen Ansätzen. Neben dem langfristigen Halten und Vermieten steht die Entwicklung von Bestandsobjekten: Immobilien werden angekauft, modernisiert, neu vermietet oder anschließend verkauft.",
      "Beteiligungen an Unternehmen, die solche Vorhaben umsetzen, unterscheiden sich wesentlich vom eigenen Wohnungskauf. Anleger übernehmen eine andere rechtliche und wirtschaftliche Rolle.",
      "Dabei sind zwei Zeiträume auseinanderzuhalten: die Dauer eines Immobilienprojekts und die Bindung des angelegten Kapitals. Auch wenn ein Objekt verkauft wurde, muss daraus kein unmittelbarer Rückzahlungsanspruch für den Anleger entstehen.",
    ],
  },
  {
    id: "bedingungen",
    heading: "Beteiligungsbedingungen entscheiden über die Einordnung",
    paragraphs: [
      "Ein Beispiel für diesen Zugang ist die Hanseatische Invest eG. Anleger erwerben Genossenschaftsanteile; das Kapital wird gemeinsam mit der Gerlach Immobilien Gruppe für Wohnimmobilienprojekte eingesetzt. Sie kaufen damit keine eigene Wohnung, sondern beteiligen sich unternehmerisch an einer Genossenschaft.",
      "Für die persönliche Planung sind insbesondere Mindestlaufzeit, Kündigungsfristen und Rückzahlungsbedingungen relevant. Die Rückzahlung hängt auch von der wirtschaftlichen Lage der Genossenschaft ab; Kapitalverluste sind möglich.",
      "Ob ein solches Modell zum eigenen Zeithorizont passt, lässt sich deshalb erst anhand der konkreten Bedingungen beurteilen. Kapital, das zu einem festen Termin benötigt wird, stellt andere Anforderungen als Vermögen, dessen Einsatz zeitlich offenbleiben kann.",
    ],
  },
  {
    id: "fazit",
    heading: "Fazit: Lebensplanung gibt den zeitlichen Rahmen vor",
    paragraphs: [
      "Eine Immobilieninvestition sollte sich in die persönliche Vermögensplanung einfügen. Dazu gehören berufliche Vorhaben ebenso wie gewünschte Freiräume, verfügbare Reserven und die Bereitschaft, wirtschaftliche Risiken zu tragen.",
      "Ein kürzerer Anlagehorizont ist dabei weder grundsätzlich vorteilhaft noch nachteilig. Entscheidend ist, welche Bindung tatsächlich entsteht und ob sie zu den eigenen Plänen passt.",
    ],
  },
];

export const pullQuote = "Ein kürzerer Anlagehorizont bedeutet noch keine jederzeitige Verfügbarkeit.";

export const closingQuestion =
  "Passt der Zeithorizont meiner Investition zu dem meiner persönlichen Ziele?";

// Questions drawn from the article, shown as a checklist before the Fazit.
export const checklist = [
  "Wann benötige ich das Kapital voraussichtlich wieder?",
  "Brauche ich es zu einem festen Termin, oder kann sein Einsatz zeitlich offenbleiben?",
  "Welche Mindestlaufzeit und welche Kündigungsfristen gelten?",
  "Unter welchen Bedingungen wird das Kapital zurückgezahlt?",
  "Welche Reserven bleiben mir unabhängig von dieser Anlage verfügbar?",
  "Welche wirtschaftlichen Risiken bin ich bereit zu tragen?",
];
