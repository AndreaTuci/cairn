# Brief — la guida di cairn

> Contenuti pronti per la sessione di design. Copia questo file dentro `design/` dopo il kickoff:
> è la cartella che l'agente vede, e da lì può leggerlo.
>
> Il testo qui sotto è **copy vero, da usare così com'è**. Non è un promemoria di argomenti: se
> l'agente si mette a riscriverlo, digli di usare questo. Serve a testare il tool, non a testare
> quanto bene inventa contenuti.
>
> Questo file è in italiano perché la pagina è per il team. Tutto il resto del repo resta in
> inglese.

---

## 1. Indicazioni visive

Da usare quando l'agente chiede la direzione visiva (step 2 di `design-workflow`).

**Cos'è**: una guida interna. Deve sembrare uno strumento di lavoro di cui ci si fida, non una
landing di prodotto. Niente entusiasmo commerciale, niente "rivoluziona il tuo workflow".

**Il soggetto**: gli ometti di pietra sulla montagna. Segni lasciati da chi è passato prima,
perché chi viene dopo trovi la via senza bisogno di una guida presente. Da lì può venire tutto:
il colore della pietra, la sensazione di qualcosa costruito a mano e messo lì per durare, il
ritmo di segni che si susseguono lungo un percorso.

**Chi legge**: designer che non scrivono codice e sviluppatori. Due pubblici sulla stessa pagina.
Devono capire subito quale parte è la loro.

**Registro**: asciutto, concreto, con i numeri veri. Il pezzo più convincente della pagina sono i
dati di un progetto reale, non gli aggettivi.

**Una richiesta precisa**: la pagina deve poter essere letta bene anche stampata o su uno schermo
condiviso in riunione. Corpo testo generoso, contrasto pieno, niente grigio su grigio.

**Libertà**: colori, caratteri, e l'elemento signature decidili tu con l'agente. Non ho preferenze
e non è il punto del test.

---

## 2. Struttura

**Due pagine.** Non una, non cinque.

| Pagina | Percorso | A cosa serve |
|---|---|---|
| Guida | `/` | Cos'è, perché, e cosa fa ciascun ruolo |
| Riferimento | `/riferimento` | Le cinque skill, le regole, cosa controlla il gate |

Due pagine servono a far comparire una navigazione e un layout condivisi: è lì che si vede se il
tool estrae davvero i componenti invece di duplicarli.

---

## 3. Pagina "Guida"

### 3.1 Apertura

**Titolo**
> Segni sul percorso

**Sottotitolo**
> cairn è l'insieme di regole e strumenti che permette a chi progetta di scrivere frontend che chi
> sviluppa vuole ereditare.

**Paragrafo**
> I designer producono codice. Quel codice diventa il punto di partenza degli sviluppatori — e il
> contesto che leggono i loro agenti. Se è disordinato, il disordine si paga due volte. cairn
> mette i binari prima, non le pezze dopo.

### 3.2 Il problema

**Titolo**
> Un progetto non si rompe di colpo

**Paragrafo**
> Si rompe per accumulo. Un `13px` scritto a mano, un componente copiato e ritoccato, un colore
> che era più veloce incollare che nominare. Ognuno difendibile da solo. Insieme producono un
> progetto dove niente si cambia in un punto solo, e dove chi arriva dopo — persona o agente — non
> ha modo di distinguere la regola dall'eccezione.

**I numeri.** Misurati su un nostro progetto vero, scritto da sviluppatori bravi, senza designer
di mezzo. Vanno mostrati come dati, non come testo. Sono la parte più convincente della pagina.

| Cosa | Quante volte |
|---|---|
| `text-[13px]` scritto a mano | 27 |
| `rounded-[8px]`, mentre `--radius-lg` esisteva inutilizzato | 14 |
| Un'ombra riscritta per esteso | 12 |
| Due form di autenticazione strutturalmente identici | 85% |
| Componenti importati da nessuno | 2 |

**Chiusura della sezione**
> Nessuna di queste è incompetenza. È l'assenza di una regola.

### 3.3 Come funziona

**Titolo**
> Una cartella che gira da sola

**Paragrafo**
> I designer lavorano in `design/`, un progetto autonomo che parte con un comando: niente backend,
> niente database, niente docker. Gli sviluppatori portano quei componenti nel progetto vero.
> Entrambi seguono le stesse regole di composizione, perché stanno costruendo la stessa cosa.

**Paragrafo**
> `design/` non è una fase, è permanente. I designer continuano a correggere mentre lo sviluppo
> va avanti — funziona così, ed è inutile fingere il contrario. Quindi è una sorgente viva, e la
> produzione è una copia che se ne allontana. Uno script dice di quanto. Nessuno lo cerca a occhio.

**I tre comandi** (mostrali come blocco di codice):
```
npm run design         # lo vedi nel browser, si aggiorna mentre lavori
npm run design:check   # lo controlla contro le regole di casa
npm run design:build   # HTML statico da mandare a un cliente
```

### 3.4 Se progetti

**Titolo**
> Se progetti

**Paragrafo**
> Apri la cartella `design/` e scrivi `/design-workflow`. Descrivi cosa vuoi. Ti verranno fatte
> domande a cui sai rispondere — a cosa serve la schermata, cosa dice, cosa si vede quando non c'è
> ancora niente — e mai domande sul codice.

**Elenco: cosa non ti serve sapere**
> Come si chiama un componente. Dove va un file. Cos'è un token, una prop, una variante. Git.
> Niente di tutto questo è tuo, e nessuno te lo chiederà.

**Elenco: cosa ti viene chiesto invece**
> A cosa serve questa schermata. Chi la apre e cosa sta cercando di fare. Le parole vere sui
> bottoni. Cosa succede al click. Cosa si vede quando la lista è vuota, mentre carica, e quando
> qualcosa va storto.

**Paragrafo di chiusura**
> Tutto quello che sta fuori da `design/` è degli sviluppatori. Se ti serve qualcosa là fuori è
> una conversazione di due minuti, non un problema da aggirare.

### 3.5 Se sviluppi

**Titolo**
> Se sviluppi

**Paragrafo**
> Il design non è un'immagine: è codice che gira, che non hai scritto tu e che non sei libero di
> ignorare. È questo che rende il flusso più veloce dei mockup — e resta più veloce solo finché le
> due copie continuano a corrispondere.

**Tre comandi prima di scrivere qualsiasi cosa** (blocco di codice):
```
cat design/HANDOFF.md                        # cosa è vero e cosa è finto
node design/.ui/ui-drift.mjs --root design   # cosa si è mosso dall'ultima volta
node design/.ui/ui-audit.mjs --root design --all
```

**Paragrafo**
> Poi il triage, prima di toccare niente: tieni, normalizza, riscrivi. È una tabella da due minuti
> ed è il momento più economico per scoprire che quattro file vanno riscritti.

**Paragrafo — la parte che si salta sempre**
> Quello che la produzione impara torna indietro. Un campo che può essere vuoto, contenuti reali
> più lunghi di qualsiasi dato di prova, uno stato che nessuno aveva disegnato. Se non torna,
> `design/` diventa finzione in due mesi — e un workbench di cui nessuno si fida è un workbench
> che nessuno mantiene.

### 3.6 Come si parte

**Titolo**
> Come si parte

**Paragrafo**
> Uno sviluppatore lancia `ui-kickoff` una volta, all'inizio del progetto. Quattro domande, poi
> prepara `design/`, imposta i colori veri del progetto, scrive le istruzioni per Claude e per
> Copilot, installa il controllo e verifica che tutto compili. Da quel momento chi progetta apre la
> cartella e lavora.

---

## 4. Pagina "Riferimento"

### 4.1 Le cinque skill

Introduzione breve:
> Cinque skill. Una la leggono entrambi i ruoli, ed è quella che tiene insieme il resto.

Questi sono dati, non testo — vanno in una fixture tipizzata e resi con un componente riusato
cinque volte.

| Skill | Chi la legge | Quando |
|---|---|---|
| `ui-kickoff` | sviluppatore | una volta, all'inizio del progetto |
| `ui-composition` | **entrambi** | ogni volta che si scrive o si rivede UI |
| `design-workflow` | designer | ogni sessione di design |
| `dev-workflow` | sviluppatore | quando si implementa UI prototipata da un designer |
| `ui-sync` | **entrambi** | il designer scrive la consegna, lo sviluppatore la usa e promuove |

Nota sotto la tabella:
> `ui-composition` è condivisa apposta. Due copie della stessa legge divergerebbero entro un mese,
> e le regole che divergono sono il problema che questo sistema esiste per risolvere.

### 4.2 Le regole

Titolo:
> Le regole, in quattro righe

Quattro voci, con lo stesso peso visivo:
> Ogni colore, misura, raggio e ombra viene dal file dei token. Ce n'è uno per progetto.
>
> Un valore usato due volte è un token. Una forma usata due volte è un componente.
>
> Ogni schermata risponde per i suoi quattro stati: pronta, vuota, in caricamento, in errore.
>
> Il controllo è bloccante. Una deroga richiede una motivazione scritta sulla riga sopra.

### 4.3 Cosa controlla il gate

Introduzione:
> Il controllo non ha opinioni sul bello. Vede solo quello che è meccanico — ed è già abbastanza.

Anche questi sono dati, resi con un componente riusato.

| Regola | Cosa intercetta |
|---|---|
| `raw-color` | un colore scritto a mano fuori dal file dei token, attributi SVG compresi |
| `default-palette` | le scale di Tailwind al posto dei token semantici |
| `arbitrary-scale` | un valore arbitrario su una proprietà di scala: uno step che nessuno ha dichiarato |
| `arbitrary-color` | un colore nascosto dentro un valore arbitrario |
| `arbitrary-repeated` | un valore scritto a mano usato più di una volta |
| `inline-style` | uno stile inline statico, invisibile al sistema dei token |
| `file-budget` | un componente oltre 150 righe, una pagina oltre 250 |
| `duplicate-block` | due file strutturalmente quasi identici |
| `unused-component` | definito, importato da nessuno, mostrato da nessuna parte |
| `a11y` | alt mancante, controllo senza nome accessibile, gerarchia dei titoli rotta, focus rimosso |

Esempio di output (blocco di codice, va mostrato così com'è):
```
  arbitrary-scale - 135 in 43 places
  An arbitrary value on a scale property. It is a scale step nobody declared.
   27 x  text-[13px]        components/AppSidebarItem.astro:34 +26
   14 x  rounded-[8px]      components/AppSidebarItem.astro:34 +13
  -> Add it to the theme scale, then use the named step.
```

Nota sotto:
> 135 segnalazioni sono in realtà 43 decisioni. Il report raggruppa apposta: una lista lunga si
> ignora, una lista di quaranta scelte si affronta in un pomeriggio.

### 4.4 Quando una regola è sbagliata

Titolo:
> Quando una regola è sbagliata

**Paragrafo**
> Prima o poi lo sarà. Si prende la deroga, si scrive il motivo sulla riga sopra, e si registra nel
> contratto del progetto. Se la stessa deroga viene presa una terza volta, è sbagliata la regola,
> non il codice — lo si dice, e la regola cambia.

**Blocco di codice**
```html
<!-- ui-audit-allow: inline-style — embed di terze parti, lo stile lo mette il fornitore -->
```

**Chiusura della pagina**
> *Errors should never pass silently. Unless explicitly silenced.*

---

## 5. Dati per le fixture

Due entità, entrambe già nelle tabelle qui sopra:

- **Skill** — `name`, `readBy` (`designer` · `developer` · `both`), `when`
- **AuditRule** — `id`, `catches`

Includi anche il caso scomodo: `ui-composition` ha `readBy: 'both'` e va reso in modo diverso
dalle altre. È lì che si vede se il tool fa una variante o un secondo componente.

---

## 6. Cosa NON mettere nella pagina

- Niente installazione passo-passo né comandi di setup: la guida racconta il flusso, il README
  racconta come si installa.
- Niente roadmap, niente "prossimamente".
- Niente screenshot: non ce ne sono ancora, e inventarli falsa il test.
- Niente sezione sul backend: per ora il punto di contatto è una sezione della consegna, e
  scriverne di più significherebbe promettere qualcosa che non esiste.
