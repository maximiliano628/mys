import Mexp from "math-expression-evaluator";

export const helper = {
  integral(min, max, equationLatex, num) {
    min = +min;
    max = +max;
    num = +num;
    let equation = this.latexToNormal(equationLatex);
    console.log(equation);
    let x = [];
    let y = [];
    let result = 0;
    let x1 = min;
    let y1 = this.func(equation, min);
    let x2, y2;
    let dx = (max - min) / num;
    for (let i = 0; i < num; i++) {
      x2 = +x1 + dx;
      y2 = this.func(equation, x2.toFixed(5));
      let area = ((y1 + y2) * dx) / 2;
      result += area;
      x1 = x2;
      y1 = y2;
      x.push(x2);
      y.push(y2);
    }

    result = +result.toFixed(4);

    return {
      x,
      y,
      result,
    };
  },

  areaRectangle(min, max, equationLatex, N) {
    min = +min;
    max = +max;
    N = +N;
    let equation = this.latexToNormal(equationLatex);
    let h = (max - min) / N;
    let x = [];
    let y = [];
    let result = 0;
    for (let i = 0; i < N; i++) {
      let xLeft = min + i * h;
      let xRight = xLeft + h;
      let xMid = (xLeft + xRight) / 2;
      let res = helper.func(equation, xMid);
      result += res;
      x.push(xMid);
      y.push(res);
    }
    result = (h * result).toFixed(4);

    return {
      x,
      y,
      result,
    };
  },

  func(ecuation, x) {
    try {
      //   console.log(
      //     ecuation.replaceAll("x", `(${x.toFixed(5)})`),
      //     Mexp.eval(ecuation.replaceAll("x", `(${x.toFixed(5)})`))
      //   );
      let ec = this.prepareEcuation(ecuation, x);
      //   console.log(ecuation, ec);
      return Mexp.eval(ec);
      // return eval(
      //   expNormal
      //     .replaceAll("x", `(${x.toFixed(5)})`)
      //     .replaceAll("^", "**")
      //     .replaceAll("{", "")
      //     .replaceAll("}", "")
      // );
    } catch (e) {
      //   console.log(e);
    }
  },

  //TODO: Calcular primero lo que está en parentesis más chicos
  prepareEcuation(ec, x) {
    ec = ec.replaceAll("x", `(${x})`);
    ec = this.replaceSqrts(ec);
    ec = this.replaceTrigFunc(ec, "\\sin");
    ec = this.replaceTrigFunc(ec, "\\cos");
    ec = this.replaceTrigFunc(ec, "\\tan");
    ec = this.replaceTrigFunc(ec, "\\arcsin");
    ec = this.replaceTrigFunc(ec, "\\arccos");
    ec = this.replaceTrigFunc(ec, "\\arctan");
    ec = this.replaceExtraParenthesis(ec);
    ec = ec.replaceAll("{", "(");
    ec = ec.replaceAll("}", ")");
    return ec;
  },

  //TOOD: Si tiene un número a la izquierda multiplicarlo por la func para que no se rompa (ej 3cos(x))
  replaceTrigFunc(str, func) {
    let i = str.indexOf(func);
    while (i >= 0) {
      let param = this.getGroup(str, i + func.length + 1, "(", ")");
      let res = 0;
      switch (func) {
        case "\\sin":
          res = Math.sin(Mexp.eval(param.content));
          break;
        case "\\cos":
          res = Math.cos(Mexp.eval(param.content));
          break;
        case "\\tan":
          res = Math.tan(Mexp.eval(param.content));
          break;
        case "\\arcsin":
          res = Math.asin(Mexp.eval(param.content));
          break;
        case "\\arccos":
          res = Math.acos(Mexp.eval(param.content));
          break;
        case "\\arctan":
          res = Math.atan(Mexp.eval(param.content));
          break;
        default:
          break;
      }
      str = `${str.substring(0, param.start - func.length - 1)}${res}${str.substring(param.end + 1)}`;
      i = str.indexOf(func);
    }
    return str;
  },

  replaceSqrts(str) {
    let i = str.indexOf("\\sqrt");
    while (i >= 0) {
      let param = this.getGroup(str, i + 6, "{", "}");
      let val = Math.sqrt(Mexp.eval(param.content));
      str = `${str.substring(0, param.start - 6)}${val}${str.substring(param.end + 1)}`;
      i = str.indexOf("\\sqrt");
    }
    return str;
  },

  replaceExtraParenthesis(str) {
    let prev = "";
    do {
      prev = str;
      str = str
        .replace(/(\([.0-9]*\))/g, "leftdel$1rightdel")
        .replaceAll("leftdel(", "")
        .replaceAll(")rightdel", "");
    } while (prev !== str);
    return str;
  },

  latexToNormal(equation) {
    let eq = equation
      .replaceAll("\\left", "(")
      .replaceAll("\\right", ")")
      .replaceAll("\\cdot", "*")
      .replaceAll("\\pi", Math.PI);
    eq = this.replaceFracs(eq);
    return eq;
  },

  replaceFracs(str) {
    let i = str.indexOf("\\frac{");
    while (i >= 0) {
      let left = this.getGroup(str, i + 6, "{", "}");
      let right = this.getGroup(str, left.end + 2, "{", "}");
      str = `${str.substring(0, left.start - 6)}(${left.content})/(${right.content})${str.substring(right.end + 1)}`;
      i = str.indexOf("\\frac{");
    }
    return str;
  },

  getGroup(str, start, charOpen, charClose) {
    let count = 1;
    let i = start;
    for (; count > 0 && i < str.length; i++) {
      const char = str[i];
      if (char === charOpen) count++;
      else if (char === charClose) count--;
    }
    return {
      start,
      end: i - 1,
      content: str.substring(start, i - 1),
    };
  },
};

export default helper;