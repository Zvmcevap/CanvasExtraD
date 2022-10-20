import { Oglisce } from "./Oglisce.js";

export class Aplikacija {
  constructor() {
    /************************************** **********************************/
    // Platno na katerega zlivamo dušo
    /************************************** **********************************/

    this.canvas = document.getElementById("myCanvas");
    this.canvasContext = this.canvas.getContext("2d"); //Ta kontekst je bistven za risanje, nevem kako to točno deluje

    // Za svaki slučaj če bomo hotl to spreminjat
    this.canvasHeight = 700;
    this.canvasWidth = 1400;

    this.canvas.height = this.canvasHeight;
    this.canvas.width = this.canvasWidth;

    //CSS sj nevem a je bolš kle al v datoteko to dt....
    this.canvas.style.border = "2px solid black";
    this.canvas.style.width = "" + this.canvasWidth + "px";
    this.canvas.style.height = "" + this.canvasHeight + "px";

    /************************************** **********************************/
    // Text Datoteka (V prvi nalogi je blo rečen da more bit na tipa .obj datoteke narejena... in tko bo)
    /************************************** **********************************/
    this.imeTextDatoteke = "kvadrat.txt";
    this.prebranaDatoteka = "";
    // Ob zagonu
    const preberi = async (datoteka) => {
      let response = await fetch(datoteka);
      this.prebranaDatoteka = await response.text();
      this.ustvariSeznamOglisc();
      this.getTransformacijskaMatrika();
      this.posodobiKoordinateOglisc();
    };
    preberi(this.imeTextDatoteke);

    // Ob spremembi datoteke
    document
      .getElementById("inputFile")
      .addEventListener("change", function () {
        preberi(this.files[0]["name"]);
      });

    /************************************** **********************************/
    // Raznorazni Seznami in Matrike
    /************************************** **********************************/
    this.seznamOglisc = [];
    this.seznamPovezav = [];
    this.ustvariSeznamOglisc();

    // indexi 0, 1, 2 so x, y, z, w
    // Enotska Matrika je kinda big deal, to nariše točke, črte, objekt brez kakršne koli transformacije, pač najbl vanilla, dolgčas 1:1 preslikava možna
    this.enotskaMatrika = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    // Če hočemo 3+ dimenzije spakirat v 2 dimenzionalni prostor brez perspektive pomnožimo vektor s spodnjo matriko
    // Ubistvu ne rabmo, lahk sam vzamemo x in y vektorja in je isti k.... perspektivna projekcija bo večji zaplet.

    // --Ubistvu-- rabmo za tako imenovani "clipping plane", do kam rišemo oglišča - čez določeno točko jih naj ne bi več... ampak bože, nevem če se mi da to implementirat..
    this.ortografskaMatrika = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    /************************************** **********************************/
    // Perspektiva - Mozak pored kompa, i nezdrava klopa... -
    /************************************** **********************************/
    // Ta je kr zapletus maximus, ker moramo vzet v upoštev cel kp stari.

    // Stvar #1:
    // aspect ratio -- višina versus dolžina ali dolžina versus višina (16:9 za monitorje naprimer,
    // 2:1 (oz. 1:2) za ta canvas k sm ga jst kle narisu).

    this.aspectRatio = 1;

    // Stvar #2:
    // Field of View (Polje Pogleda??) - to je kot, s katerim večamo polje našega pogleda.. večji kot, bolj širok je
    // pogled (fish-eye fora), manjši je kot bl je zoom-iran..
    // Se prav, večji kot, večji je naš pogled in posamezen objekt je manjši.. manjši kot vidimo manj in so objekti večji.
    // Povezan je z aspect ratiom - če vzamemo višino/dolžino  gledamo fov kot po vertikali -- fovY,
    // če vzamemo dolžino/višino pa po horizontali -- fovX.... se mi zdi... bom najprej fovY dal da vidm če dela

    this.fov = 45;

    // Stvar #3:
    // far plane pa near plane -- to določa kok daleč pa kok blizu lahk vidmo (po z-osi kamere ponavad)
    // vse kar ma večji z od far-ja je predaleč od oči in izgine, vse kar ma z manj on near-ja je preblizu nosa dab vidl..
    // (emm sidenote, obrni "večji" in "manjši", odvisno od tega a je levi ali desni koordinatni sistem)

    this.zNear = 3;
    this.zFar = 10;

    this.perspektivnaMatrika = [
      ["Naumo se kle matral s tem, glej funkcijo k jo ustvar"],
    ];
    //          .-----------------------To funkcijo-------------------------------'
    //          v
    this.getPerspektivnoMatriko();

    /************************************** **********************************/
    // Perspektiva - Kokr jo naredijo na RGTI predmetu... TA MI JE FUL BL VŠEČ... AMPAK FOV NIČE NE DELA!!!
    /************************************** **********************************/

    // Testiram kle kera bolj dela, oziroma kera je bol samoumevna... (spoiler alert: nobena ni samoumevna.)

    // Potrebujemo razdaljo od kamere do projekcijske ravnine - npr. naš uč je kamera, html canvas v browserju je projekcijska daljina
    // Da ne delam 1000 kontrol v htmlju bo naš this.zNear služil kot this.d

    this.perspektivnaMatrikaRGTI = [["Kle se tud ne bomo borile s tem"]];
    this.getPerspektivnoMatrikoRGTI(); // Kle se bomo :)

    // Transformacijska Matrika začne svojo avanturo kot enotska matrika,
    // ki jo potem popačimo (pomnožimo) s skalarno, rotacijsko in nenazadnje (ampak ubistvu nujno nazadnje) s premično matriko
    this.transformacijskaMatrika = [...this.enotskaMatrika];

    // Različni seznami s katerimi bomo ustvarjal transformacijsko matriko
    this.skalarSeznam = [1, 1, 1, 1];
    this.rotacijaSeznam = [0, 0, 0, 0];
    this.premikSeznam = [0, 0, 3, 1];

    /************************************** **********************************/
    // Kontrole, različni inputi etc etc
    /************************************** **********************************/

    // Kaj rišemo na platno - true/false
    this.aliNarisemOglisca = true;
    this.ogliscaCheckbox = document.getElementById("narisiOglisce");
    this.ogliscaCheckbox.checked = true;
    this.ogliscaCheckbox.addEventListener("change", function () {
      document.app.aliNarisemOglisca = this.checked;
    });

    this.aliNarisemPovezave = true;
    this.povezaveCheckbox = document.getElementById("narisiPovezave");
    this.povezaveCheckbox.checked = true;
    this.povezaveCheckbox.addEventListener("change", function () {
      document.app.aliNarisemPovezave = this.checked;
    });

    this.aliNarisemKoordinateOglisc = true;
    this.koordinateCheckbox = document.getElementById("narisiKoordinate");
    this.koordinateCheckbox.checked = true;
    this.koordinateCheckbox.addEventListener("change", function () {
      document.app.aliNarisemKoordinateOglisc = this.checked;
    });

    // Perspektiva
    this.aliNarisemSPerspektivo = false;
    this.perspektivaCheckbox = document.getElementById("perspektiva");
    this.perspektivaCheckbox.checked = false;
    this.perspektivaCheckbox.addEventListener("change", function () {
      document.app.aliNarisemSPerspektivo = this.checked;
      document.app.getPerspektivnoMatriko();
      document.app.getPerspektivnoMatrikoRGTI()
      document.app.posodobiKoordinateOglisc();
    });

    // FOV kot v stopinjah po x koordinati (okol 85 stopinj imajo igrice +-20 stopinj)
    this.fieldFov = document.getElementById("fov");
    this.fieldFov.value = this.fov;
    this.fieldFov.addEventListener("change", function () {
      document.app.fov = this.valueAsNumber;
      document.app.getPerspektivnoMatriko();
      document.app.getPerspektivnoMatrikoRGTI()
      document.app.posodobiKoordinateOglisc();
    });
    this.fieldFov.addEventListener("mouseover", function () {
      this.focus();
    });

    this.fieldZNear = document.getElementById("zNear");
    this.fieldZNear.value = this.zNear;
    this.fieldZNear.addEventListener("change", function () {
      document.app.zNear = this.valueAsNumber;
      document.app.getPerspektivnoMatriko();
      document.app.getPerspektivnoMatrikoRGTI()
      document.app.posodobiKoordinateOglisc();
    });
    this.fieldZNear.addEventListener("mouseover", function () {
      this.focus();
    });

    this.fieldZFar = document.getElementById("zFar");
    this.fieldZFar.value = this.zFar;
    this.fieldZFar.addEventListener("change", function () {
      document.app.zFar = this.valueAsNumber;
      document.app.getPerspektivnoMatriko();
      document.app.posodobiKoordinateOglisc();
    });
    this.fieldZFar.addEventListener("mouseover", function () {
      this.focus();
    });

    // Tipke na tipkovnici (Zmešnjava je ta JS)
    document.app = this;
    document.addEventListener("keydown", function (event) {
      const key = event.key;
      this.app.wasdButtonClick(key);
    });

    // Gumbi v HTMLju, na browserju, v zaslonu...
    this.buttonW = document.getElementById("w");
    this.buttonW.app = this;
    this.buttonW.addEventListener("click", this.wasdButtonClick);

    this.buttonS = document.getElementById("s");
    this.buttonS.app = this;
    this.buttonS.addEventListener("click", this.wasdButtonClick);

    this.buttonA = document.getElementById("a");
    this.buttonA.app = this;
    this.buttonA.addEventListener("click", this.wasdButtonClick);

    this.buttonD = document.getElementById("d");
    this.buttonD.app = this;
    this.buttonD.addEventListener("mousedown", this.wasdButtonClick);

    this.buttonQ = document.getElementById("q");
    this.buttonQ.app = this;
    this.buttonQ.addEventListener("click", this.wasdButtonClick);

    this.buttonE = document.getElementById("e");
    this.buttonE.app = this;
    this.buttonE.addEventListener("click", this.wasdButtonClick);

    // Baby, round, round...
    this.spinXYeah = false;
    this.buttonSpinX = document.getElementById("spinx");
    this.buttonSpinX.app = this;
    this.buttonSpinX.addEventListener("click", this.spinXToggle);

    this.spinYYeah = false;
    this.buttonSpinY = document.getElementById("spiny");
    this.buttonSpinY.app = this;
    this.buttonSpinY.addEventListener("click", this.spinYToggle);

    this.spinZYeah = false;
    this.buttonSpinZ = document.getElementById("spinz");
    this.buttonSpinZ.app = this;
    this.buttonSpinZ.addEventListener("click", this.spinZToggle);

    // Številčna Polja
    this.fieldScaleX = document.getElementById("scale-x");
    this.fieldScaleX.valueAsNumber = this.skalarSeznam[0];
    this.fieldScaleX.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldScaleX.app = this;
    this.fieldScaleX.addEventListener("change", this.numberFieldOnChange);

    this.fieldScaleY = document.getElementById("scale-y");
    this.fieldScaleY.valueAsNumber = this.skalarSeznam[1];
    this.fieldScaleY.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldScaleY.app = this;
    this.fieldScaleY.addEventListener("change", this.numberFieldOnChange);

    this.fieldScaleZ = document.getElementById("scale-z");
    this.fieldScaleZ.valueAsNumber = this.skalarSeznam[2];
    this.fieldScaleZ.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldScaleZ.app = this;
    this.fieldScaleZ.addEventListener("change", this.numberFieldOnChange);

    this.fieldRotateX = document.getElementById("rotate-x");
    this.fieldRotateX.valueAsNumber = this.rotacijaSeznam[0];
    this.fieldRotateX.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldRotateX.app = this;
    this.fieldRotateX.addEventListener("change", this.numberFieldOnChange);

    this.fieldRotateY = document.getElementById("rotate-y");
    this.fieldRotateY.valueAsNumber = this.rotacijaSeznam[1];
    this.fieldRotateY.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldRotateY.app = this;
    this.fieldRotateY.addEventListener("change", this.numberFieldOnChange);

    this.fieldRotateZ = document.getElementById("rotate-z");
    this.fieldRotateZ.valueAsNumber = this.rotacijaSeznam[2];
    this.fieldRotateZ.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldRotateZ.app = this;
    this.fieldRotateZ.addEventListener("change", this.numberFieldOnChange);

    this.fieldTranslateX = document.getElementById("translate-x");
    this.fieldTranslateX.valueAsNumber = this.premikSeznam[0];
    this.fieldTranslateX.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldTranslateX.app = this;
    this.fieldTranslateX.addEventListener("change", this.numberFieldOnChange);

    this.fieldTranslateY = document.getElementById("translate-y");
    this.fieldTranslateY.valueAsNumber = this.premikSeznam[1];
    this.fieldTranslateY.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldTranslateY.app = this;
    this.fieldTranslateY.addEventListener("change", this.numberFieldOnChange);

    this.fieldTranslateZ = document.getElementById("translate-z");
    this.fieldTranslateZ.valueAsNumber = this.premikSeznam[2];
    this.fieldTranslateZ.addEventListener("mouseover", function () {
      this.focus();
    });
    this.fieldTranslateZ.app = this;
    this.fieldTranslateZ.addEventListener("change", this.numberFieldOnChange);

    // Radio Batn
    this.tranformationType = "scale";
    this.radioButtons = document.querySelectorAll(
      'input[name="transformation-type"]'
    );
    for (let i = 0; i < this.radioButtons.length; i++) {
      const radioButton = this.radioButtons[i];
      radioButton.app = this;
      radioButton.addEventListener("change", this.radioOnChange);
      if (radioButton.checked) {
        this.tranformationType = radioButton.value;
      }
    }

    // JAVASCRIPT JE SMOTAN
    this.app = this; // reference thyself whynot
  }

  /************************************** **********************************/
  // Funkcije za kontrole
  /************************************** **********************************/

  // Radio gumbi določajo na katero obliko transformacije WASD gumbi vplivajo
  radioOnChange() {
    this.app.tranformationType = this.value;
  }

  // S temi tremi togli bom vrtel objekt konstantno med frame-i, yeah?
  spinXToggle() {
    this.app.spinXYeah = !this.app.spinXYeah;
  }
  spinYToggle() {
    this.app.spinYYeah = !this.app.spinYYeah;
  }
  spinZToggle() {
    this.app.spinZYeah = !this.app.spinZYeah;
  }

  // Polja s številkami posodobijo sezname transformacij (indeksi 0, 1, 2, 3 so x, y, z, w (w zaenkrat skos 1))
  numberFieldOnChange() {
    this.app.premikSeznam = [
      this.app.fieldTranslateX.valueAsNumber,
      -this.app.fieldTranslateY.valueAsNumber,
      this.app.fieldTranslateZ.valueAsNumber,
      1,
    ];
    this.app.skalarSeznam = [
      this.app.fieldScaleX.valueAsNumber,
      this.app.fieldScaleY.valueAsNumber,
      this.app.fieldScaleZ.valueAsNumber,
      1,
    ];
    this.app.rotacijaSeznam = [
      (this.app.fieldRotateX.valueAsNumber * Math.PI) / 180,
      (this.app.fieldRotateY.valueAsNumber * Math.PI) / 180,
      (this.app.fieldRotateZ.valueAsNumber * Math.PI) / 180,
      1,
    ];
    this.app.getTransformacijskaMatrika();
  }

  // wasd gumbi in v browserju, in na tipkovnici
  wasdButtonClick(key) {
    let switchable = "";
    if (this.id !== undefined) {
      switchable = this.id;
    } else {
      switchable = key;
    }
    switch (switchable) {
      case "a":
        this.app.incrementXMinus();
        break;
      case "d":
        this.app.incrementXPlus();
        break;
      case "w":
        this.app.incrementYPlus();
        break;
      case "s":
        this.app.incrementYMinus();
        break;
      case "q":
        this.app.incrementZMinus();
        break;
      case "e":
        this.app.incrementZPlus();
        break;
      default:
        break;
    }
  }

  incrementXPlus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateX.valueAsNumber += 2;
        break;
      case "scale":
        this.fieldScaleX.valueAsNumber += 0.1;
        break;
      case "translation":
        this.fieldTranslateX.valueAsNumber += 0.1;
        break;
    }
    this.numberFieldOnChange();
  }
  incrementXMinus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateX.valueAsNumber -= 2;
        break;
      case "scale":
        this.fieldScaleX.valueAsNumber -= 0.1;
        break;
      case "translation":
        this.fieldTranslateX.valueAsNumber -= 0.1;
        break;
    }
    this.numberFieldOnChange();
  }

  incrementYPlus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateY.valueAsNumber += 2;
        break;
      case "scale":
        this.fieldScaleY.valueAsNumber += 0.1;
        break;
      case "translation":
        this.fieldTranslateY.valueAsNumber += 0.1;
        break;
    }
    this.numberFieldOnChange();
  }
  incrementYMinus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateY.valueAsNumber -= 2;
        break;
      case "scale":
        this.fieldScaleY.valueAsNumber -= 0.1;
        break;
      case "translation":
        this.fieldTranslateY.valueAsNumber -= 0.1;
        break;
    }
    this.numberFieldOnChange();
  }

  incrementZPlus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateZ.valueAsNumber += 2;
        break;
      case "scale":
        this.fieldScaleZ.valueAsNumber += 0.1;
        break;
      case "translation":
        this.fieldTranslateZ.valueAsNumber += 0.1;
        break;
    }
    this.numberFieldOnChange();
  }
  incrementZMinus() {
    switch (this.tranformationType) {
      case "rotation":
        this.fieldRotateZ.valueAsNumber -= 2;
        break;
      case "scale":
        this.fieldScaleZ.valueAsNumber -= 0.1;
        break;
      case "translation":
        this.fieldTranslateZ.valueAsNumber -= 0.1;
        break;
    }
    this.numberFieldOnChange();
  }

  /************************************** **********************************/
  // Pridobivanje Oglišč
  /************************************** **********************************/

  ustvariSeznamOglisc() {
    const tekstovnaLista = this.prebranaDatoteka.split("\n");

    this.seznamOglisc = [];
    this.seznamPovezav = [];

    for (let i = 0; i < tekstovnaLista.length; i++) {
      const element = tekstovnaLista[i].split(" ");
      // Ustvarimo Oglišča
      if (element[0] === "v") {
        const listaKoordinat = [];
        for (let j = 1; j < element.length; j++) {
          listaKoordinat.push(Number(element[j]) * 2 - 1);
        }
        const novoOglisce = new Oglisce(listaKoordinat);
        this.seznamOglisc.push(novoOglisce);
      }

      // In povezave med oglišči
      if (element[0] === "f") {
        const krogPovezav = [];
        for (let j = 1; j < element.length; j++) {
          krogPovezav.push(Number(element[j]));
        }
        this.seznamPovezav.push(krogPovezav);
      }
    }
  }

  /************************************** **********************************/
  // Množenje dveh Matrik poljubne velikosti (upam)
  /************************************** **********************************/
  zmnoziMatrike(matrikaLevo, matrikaDesno) {
    let rezultat = [];

    // Ustvari rezultat
    for (let p = 0; p < matrikaDesno.length; p++) {
      let kolona = [];
      for (let m = 0; m < matrikaLevo[0].length; m++) {
        kolona.push(0);
      }
      rezultat.push(kolona);
    }

    // MATRIKA1(mxn) * MATRIKA2 (nxp)
    for (let p = 0; p < matrikaDesno.length; p++) {
      // za vsako kolono v desni matriki
      for (let m = 0; m < matrikaLevo[0].length; m++) {
        //za vsako vrstico v levi matriki
        for (let n = 0; n < matrikaDesno[0].length; n++) {
          // Vsako vrstico v desni matriki
          rezultat[p][m] += matrikaLevo[n][m] * matrikaDesno[p][n];
        }
      }
    }
    return rezultat;
  }
  /************************************** **********************************/
  // Ustvarjanje Transformacijske Matrike (s katero potem pomnožimo vektor da dobimo projekcijo na zaslon bla bla)
  /************************************** **********************************/

  // PREMIK - TRANSLACIJA
  // Razlog zakaj imamo 4x4 (4D) matrike povsod - seštevanje je odd man out, povsod drugje je množenje,
  // Da spremenimo še to v množenje smo dodali 3D (3x3) matrikam še eno dimenzijo, tako da lahko zmnožimo vse 3 transformacije med sabo
  // Za predstavo, dejansko delamo "shear" v 4ti dimenziji, ki izgleda kot premik v 3D svetu, enako bi bilo če bi "shear" naredili v 2D svetu in
  // projektiral v 1 dimenzijo, 3D "shear" projektiral v 2 dimenziji, itd, idk, bmk

  getTranslacijskaMatrika() {
    let translacijskaMatrika = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      this.premikSeznam,
    ];
    return translacijskaMatrika;
  }

  // POVECAVA - SKALAR
  // Ta je dost samoumeven, po glavni diagonali zapišemo večkratnike za x, y, z, ...

  getSkalarnaMatrika() {
    let skalarnaMatrika = [
      [this.skalarSeznam[0], 0, 0, 0],
      [0, this.skalarSeznam[1], 0, 0],
      [0, 0, this.skalarSeznam[2], 0],
      [0, 0, 0, 1],
    ];
    return skalarnaMatrika;
  }

  // OBRAT - ROTACIJA
  // Ta je zabavno zapletena - zarad trigonometričnih razlogov uporabljamo cosinuse in sinuse, zato ker pač \o/
  // Glede na random Youtube komentar je pa treba vedt:
  // Za rotacijo potrebujemo 2D prostor (na 1D črti mamo lahko samo premik in povečavo), se pravi površino (XY, XZ, YZ, ....),
  // na kateri vrtimo točke tako da jih množimo s cos(x) po glavni diagonali matrike in sin(x), -sin(x) po emm "neglavni diagonali"(? ... zihr obstaja beseda za to)
  // Smer vrtenja določa kam damo sin(x) kam pa -sin(x), kar pride tud iz tega da je transpondenta rotacijske matrike njen inverz.

  // Da ustvarmo potem določeno rotacijsko matriko, vzamemo enotsko matriko, in zamenjamo enke s cos(x) in ničle z +-sin(x) na tistih dveh oseh
  // ki bosta predstavljalo površino na katerih bomo vrteli.
  // Število različnih načinov kako lahko obračamo objekt je kombinacija 2 osi izmed vseh osi (n nad 2, kjer je n število dimenzij, če to okrajšamo
  // dobimo n*(n-1)/2, zato je na 2D ploskev samo ena rotacija možna, v 3D so 3, v 4D jih je 6).

  //LAHKO bi si sicer NAČELOMA zamislil v 3D svetu tud,da se vrtimo okol neke osi (če bi hotel delat matematične zločine),
  //  ampak ta logika drži samo v 3 dimenzionalnem prostoru
  //(v 2D naprimer se vrtimo kao okoli z-osi ki pa sploh ne obstaja, v 4D se vrtimo okoli dveh pravokotno na sebe osi, objasn mi to kako deluje pol???)

  // Uglavnem kle spodi so rotacijske matrike naš 3D prostor

  getRotacijskaMatrikaYZ() {
    let rotMatrikaYZ = [
      [1, 0, 0, 0],
      [
        0,
        Math.cos(this.rotacijaSeznam[0]),
        Math.sin(this.rotacijaSeznam[0]),
        0,
      ],
      [
        0,
        -Math.sin(this.rotacijaSeznam[0]),
        Math.cos(this.rotacijaSeznam[0]),
        0,
      ],
      [0, 0, 0, 1],
    ];
    return rotMatrikaYZ;
  }
  getRotacijskaMatrikaXZ() {
    let rotMatrikaXZ = [
      [
        Math.cos(this.rotacijaSeznam[1]),
        0,
        -Math.sin(this.rotacijaSeznam[1]),
        0,
      ],
      [0, 1, 0, 0],
      [
        Math.sin(this.rotacijaSeznam[1]),
        0,
        Math.cos(this.rotacijaSeznam[1]),
        0,
      ],
      [0, 0, 0, 1],
    ];
    return rotMatrikaXZ;
  }
  getRotacijskaMatrikaXY() {
    let rotMatrikaXY = [
      [
        Math.cos(this.rotacijaSeznam[2]),
        -Math.sin(this.rotacijaSeznam[2]),
        0,
        0,
      ],
      [
        Math.sin(this.rotacijaSeznam[2]),
        Math.cos(this.rotacijaSeznam[2]),
        0,
        0,
      ],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return rotMatrikaXY;
  }

  // Na srečo matrike zgubijo samo komu- komuta- komutitativnost(???), obdržijo pa aso-ermm
  // V glavnem mormo pazt na keri strani jih množimo, ne pa kdaj jih množimo, tko da lahko iz treh različnih rot. matrik dobimo eno,
  // na isti način bomo dobil transformacijsko matriko potem ko dodamo povečavo in premik.

  getRotacijskaMatrika() {
    let rm = this.zmnoziMatrike(
      this.getRotacijskaMatrikaXZ(),
      this.getRotacijskaMatrikaYZ()
    );
    rm = this.zmnoziMatrike(this.getRotacijskaMatrikaXY(), rm);
    return rm;
  }

  // Kle bo sam testna rotacijska matrika, ker me ferbc matra kaj se zgodi če nobene osi ne držimo pr miru
  getRotacijskaMatrikaXYZLOL() {
    let rotMatrikaXYZ = [
      [
        Math.cos(this.rotacijaSeznam[0]),
        Math.sin(this.rotacijaSeznam[0]),
        Math.sin(this.rotacijaSeznam[0]),
        0,
      ],
      [
        -Math.sin(this.rotacijaSeznam[0]),
        Math.cos(this.rotacijaSeznam[0]),
        Math.sin(this.rotacijaSeznam[0]),
        0,
      ],
      [
        -Math.sin(this.rotacijaSeznam[0]),
        -Math.sin(this.rotacijaSeznam[0]),
        Math.cos(this.rotacijaSeznam[0]),
        0,
      ],
      [0, 0, 0, 1],
    ];
    return rotMatrikaXYZ;
  }

  // Transformacijska matrika je nš bread n butter, vso kompliciranje do zdej je blo samo za to da lahko enotsko matriko spremenimo v transformacijsko
  // Ko jo enkrat izračunamo lahko vsako točko pomnožimo z njo da ugotovimo kje v 3D svetu se nahaja ta točka trenutno.
  // Sevede moramo potem pri izrisu to pomnožit še s projekcijsko matriko haha nikad kraja tem matrikam
  // Vrstni red je baje najprej povečava, potem rotacija in nazadnje premik

  getTransformacijskaMatrika() {
    // Prvo Množenja
    /* Preveri še kaj se dogaja če NAJPREJ premaknemo in potem skal, rot... -- Ne pozabi začet z enotsko matriko
    this.transformacijskaMatrika = this.zmnoziMatrike(
        this.getTranslacijskaMatrika(),
        this.enotskaMatrika
    );
  */
    this.transformacijskaMatrika = this.zmnoziMatrike(
      this.getSkalarnaMatrika(),
      this.enotskaMatrika
    );

    // Drugo Množenje
    // getRotacijskaMatrika() vs getRotacijskaMatrikaXYZLOL() - z rot. matrikami ni šale
    this.transformacijskaMatrika = this.zmnoziMatrike(
      this.getRotacijskaMatrika(),
      this.transformacijskaMatrika
    );

    /* Tretje Množenje*/
    this.transformacijskaMatrika = this.zmnoziMatrike(
      this.getTranslacijskaMatrika(),
      this.transformacijskaMatrika
    );

    // Posodobi koordinate vsakega oglišča
    this.posodobiKoordinateOglisc();
  }

  /************************************** **********************************/
  // Nadaljevanje Perspektivne Matrike
  /************************************** **********************************/

  getPerspektivnoMatriko() {
    // Na voljo imamo aspect ratio, fov, zNear in zFar clipping plane, zdej pa:

    // Vzamemo inverz tangens polovice kota fov -- zato ker emm pravokotni trikotnik... trigonometrija.. pitajgoro...
    let f = 1 / Math.tan((this.fov * Math.PI) / 360);

    // zNear pa zFar mal množimo, mal odštevamo, mal čirule čarule med sabo (ta je res zapletena matrika, kaj naj ti jst XD)
    let lambdaSimbol = this.zFar / (this.zFar - this.zNear);

    this.perspektivnaMatrika = [
      [f * this.aspectRatio, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, lambdaSimbol, 1],
      [0, 0, lambdaSimbol * (-this.zNear), 0],
    ];

    /* Okej zgornja celotna neokrajšana matrika naj bi bla:

    [(višina/dolžina)*(1/tan(fov/2)),              0,                   0,                          0]
    [                              0, (1/tan(fov/2)),                   0,                          0]
    [                              0,              0, (zFar/(zFar-ZNear)), (-zFar*zNear/(zFar-zNear))]
    [                              0,              0,                   1,                          0]  // Lol, I like this last row the most..

    (če je to bl human readable haha. Ha.. Ha... )
    k to množimo z  vektorjem [x1, y1, z1, 1] v w column shranimo z, in potem x y z delimo z w spet da dobimo vektor oblike [x2/z1, y2/z1, z2/z1, 1]
    kjer sta z1 - originalni z, in z2 - spremenjeni s perspektivo z...zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
    */
  }

  /********************************* ***************************************/
  // Perspektiva the RGTI way
  /********************************* **************************************/
  getPerspektivnoMatrikoRGTI() {
    this.perspektivnaMatrikaRGTI = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1,( 1 / this.zNear)],
      [0, 0, 0, 0]
    ];
  }

  /************************************** **********************************/
  // Funkcije za risanje po platnu
  /************************************** **********************************/

  narisiOglisca() {
    for (let i = 0; i < this.seznamOglisc.length; i++) {
      // prever clipping plane, če rabaš to sploh risat
      if (
        !(this.seznamOglisc[i].risaniVektor[2] < this.zNear) ||
        !(this.seznamOglisc[i].risaniVektor[2] > this.zFar)
      ) {
        this.seznamOglisc[i].narisiOglisce(this.canvasContext);
      }
    }
  }
  narisiPovezave() {
    const context = this.canvasContext; // da ne pišem this. skos

    for (let i = 0; i < this.seznamPovezav.length; i++) {
      for (let j = 0; j < this.seznamPovezav[i].length; j++) {
        let zacetnoOglisceIndeks = this.seznamPovezav[i][j] - 1; //oglišče pri kerem začnemo

        // Oglišče pri katerem končamo -- nardi wrap around če smo na zadnjem indeksu
        let koncnoOglisceIndeks =
          this.seznamPovezav[i].length === j + 1
            ? this.seznamPovezav[i][0]
            : this.seznamPovezav[i][j + 1];
        koncnoOglisceIndeks -= 1; // Oglisca v seznamu se začnejo z 1 zato odštejem kle

        context.beginPath();
        context.moveTo(
          700 + this.seznamOglisc[zacetnoOglisceIndeks].risaniVektor[0] * 100,
          350 + this.seznamOglisc[zacetnoOglisceIndeks].risaniVektor[1] * 100
        );
        context.lineTo(
          700 + this.seznamOglisc[koncnoOglisceIndeks].risaniVektor[0] * 100,
          350 + this.seznamOglisc[koncnoOglisceIndeks].risaniVektor[1] * 100
        );
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }

  narisiKoordinate() {
    for (let i = 0; i < this.seznamOglisc.length; i++) {
      this.seznamOglisc[i].narisiKoordinateOglisc(this.canvasContext);
    }
  }

  // Posodobi Koordinate Oglišč samo ko se spremeni Tranformacijska Matrika ali Perspektiva

  posodobiKoordinateOglisc() {
    for (const oglisce of this.seznamOglisc) {
      // Ortografsko
      let vektor = this.zmnoziMatrike(this.transformacijskaMatrika, [
        oglisce.zacetneKoordinate,
      ]);

      // Dodaj Perspektivo PLACDRŽAČ
      if (this.aliNarisemSPerspektivo) {
        vektor = this.zmnoziMatrike(this.perspektivnaMatrikaRGTI, vektor);
        if (vektor[0][3] !== 0) {
          vektor[0][0] /= vektor[0][3];
          vektor[0][1] /= vektor[0][3];
          vektor[0][2] /= vektor[0][3];
        }
      }

      oglisce.risaniVektor = vektor[0];
    }
  }

  /************************************** **********************************/
  // Update Function?! -- To bomo klicali vsakih 33 milisekund (30fps oziroma herzou)
  /************************************** **********************************/

  update(app) {
    app.canvasContext.clearRect(0, 0, app.canvas.width, app.canvas.height);

    // Vrtenje
    if (app.spinXYeah) {
      app.incrementXPlus();
    }
    if (app.spinYYeah) {
      app.incrementYPlus();
    }
    if (app.spinZYeah) {
      app.incrementZPlus();
    }

    // Risanje
    if (app.aliNarisemPovezave) {
      app.narisiPovezave();
    }
    if (app.aliNarisemOglisca) {
      app.narisiOglisca();
    }
    if (app.aliNarisemKoordinateOglisc) {
      app.narisiKoordinate();
    }
  }
}
