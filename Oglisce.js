export class Oglisce {
  constructor(seznamKoordinat) {
    this.r = 1;
    this.zacetneKoordinate = [...seznamKoordinat];
    this.oglisceColor =
      "rgb(" +
      (240 *
        ((this.zacetneKoordinate[0] + 1) / 2 +
          (this.zacetneKoordinate[3] + 1) / 2)) /
        2 +
      "," +
      (240 *
        ((this.zacetneKoordinate[1] + 1) / 2 +
          (this.zacetneKoordinate[3] + 1) / 2)) /
        2 +
      "," +
      (240 *
        ((this.zacetneKoordinate[2] + 1) / 2 +
          (this.zacetneKoordinate[3] + 1) / 2)) /
        2 +
      ")";
    if (this.zacetneKoordinate.length < 4) {
      this.zacetneKoordinate.push(0.5);
    }
    this.zacetneKoordinate.push(1);
    this.risaniVektor = [
      this.zacetneKoordinate[0],
      this.zacetneKoordinate[1],
      this.zacetneKoordinate[2],
      1,
    ];
  }

  // Rišemo tako, da najdemo sredino (x je 700, y pa 350), prištejemo lokacijo točke, in pomnožimo z magar 100, tako da je 100px razlike med najbolj desno
  // najbol levo- oziroma najbolj gor in najbolj dol, oziroma kvadratnikoren od dva od najbolj desnogor do najbolj desnodol itd itd...
  // Nariše okrogla vozlišča
  // arc(x, y, r, začetni kot, končni kot) --- x, y sta središčne koordinate krogota, r je polmer, kot povek kok kroga nariše 2 pija je cel krog
  narisiOglisce(ctx) {
    ctx.beginPath();
    ctx.arc(
      700 + this.risaniVektor[0] * 100,
      350 + this.risaniVektor[1] * 100,
      20 / this.r,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = this.oglisceColor;
    ctx.fill();
  }

  narisiKoordinateOglisc(ctx) {
    ctx.fillStyle = "black";
    ctx.fillText(
      "x: " +
        this.risaniVektor[0].toFixed(3) +
        " y: " +
        this.risaniVektor[1].toFixed(3) +
        " z: " +
        this.risaniVektor[2].toFixed(3) +
        " w: " +
        this.risaniVektor[3].toFixed(3),
      680 + this.risaniVektor[0] * 100,
      340 + this.risaniVektor[1] * 100
    );
  }

  // Kvadratki so hitrejši za narisat, sam krogci so lepši
  narisiKvadratnoOglisce(ctx, vektor) {
    ctx.fillStyle = "rgb(140,0," + Math.floor(0) + ")";
    ctx.fillRect(
      700 + vektor[0] * 100,
      350 + vektor[1] * 100,
      10 + vektor[2],
      10 + vektor[2]
    );
  }
}
