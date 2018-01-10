/**
 * 判断文法是否为LL(1)文法
 */

/**
 * 求能推出ε的非终结符
 *
 * @returns
 */
function getVn2null() {
  const { Vn, Vt, P } = this;
  const Vn2null = {};
  /** 对于每一个非终结符置初值为“未定”（0） */
  Vn.forEach((v) => {
    Vn2null[v] = 0;
  });
  /** 删除所有右部含有终结符的产生式 */
  const PWithoutVt = new Set(P);
  P.forEach((rule) => {
    const [, r] = rule.split('->');
    r.trim();
    const Vr = r.split('');
    for (let index = 0; index < Vr.length; index += 1) {
      const rv = Vr[index];
      if (Vt.has(rv)) {
        PWithoutVt.delete(rule);
        break;
      }
    }
  });
  /** 获取删除后产生式集合的非终结符 */
  const VnWithoutVt = new Set();
  PWithoutVt.forEach((rule) => {
    const [l] = rule.split('->');
    VnWithoutVt.add(l.trim());
  });
  /** 将缺失的非终结符置为否（false） */
  Vn.forEach((v) => {
    if (!VnWithoutVt.has(v)) {
      Vn2null[v] = false;
    }
  });
  /** 若某一非终结符的某一产生式右部为空，则将该非终结符置为是（true） */
  const PWithoutVtAndNull = new Set(PWithoutVt);
  const VnWithoutVtAndNull = new Set(VnWithoutVt);
  PWithoutVt.forEach((rule) => {
    const [l, r] = rule.split('->');
    l.trim();
    r.trim();
    if (r === 'ε') {
      VnWithoutVtAndNull.delete(l);
      Vn2null[l] = true;
    }
  });
  /** 从文法中删除该非终结符的所有产生式 */
  VnWithoutVt.forEach((v) => {
    if (!VnWithoutVtAndNull.has(v)) {
      PWithoutVt.forEach((rule) => {
        const [l] = rule.split('->');
        l.trim();
        if (l === v) {
          PWithoutVtAndNull.delete(rule);
        }
      });
    }
  });
  /** 存储每次循环结束的的规则集合 */
  const POutLoop = new Set(PWithoutVtAndNull);
  const VnOutLoop = new Set(VnWithoutVtAndNull);
  /**
   * 判断循环结束
   *
   * @returns
   */
  function finishLoop() {
    const Vn2nullValues = Object.values(Vn2null);
    if (Vn2nullValues.includes(0) && [...POutLoop].length !== 0) {
      return false;
    }
    return true;
  }
  /** 循环扫描产生式右部的每一个符号 */
  for (let index = 0; index < 100; index += 1) {
    if (finishLoop()) {
      break;
    }
    let PInLoop = new Set(POutLoop);
    /** 扫描每一个产生式 */
    PInLoop.forEach((rule) => {
      const [l, r] = rule.split('->');
      l.trim();
      r.trim();
      if (VnOutLoop.has(l)) {
        const Vr = r.split('');
        /** 扫描产生式的每一个符号 */
        for (let i = 0; i < Vr.length; i += 1) {
          const v = Vr[i];
          if (Vn.has(v)) {
            if (Vn2null[v] === true) {
              /** 若扫描到的非终结符对应的标识是true，删去该非终结符 */
              Vr[i] = '';
              if (i === Vr.length - 1) {
                const newRRule = Vr.join('');
                if (newRRule.trim()) {
                  POutLoop.delete(rule);
                  POutLoop.add(`${l}->${newRRule.trim()}`);
                } else {
                  /** 若这使产生式右部为空，则将左部非终结符对应标志改为是，并删除以该非终结符为左部的所有产生式 */
                  Vn2null[l] = true;
                  VnOutLoop.delete(l);
                }
              }
            } else if (Vn2null[v] === false) {
              /** 扫描到的非终结符对应的标识是false，则删去该产生式 */
              POutLoop.delete(rule);
              break;
            }
          } else if (v === ' ') {
            Vr[i] = '';
          }
        }
      }
    });
    /** 获取删除后产生式集合的非终结符 */
    const VnInLoop = new Set();
    POutLoop.forEach((rule) => {
      const [l] = rule.split('->');
      VnInLoop.add(l.trim());
    });
    /** 若左部失去某非终结符的所有产生式，则将该非终结符对应的标志改为否 */
    VnOutLoop.forEach((v) => {
      if (!VnInLoop.has(v)) {
        Vn2null[v] = false;
      }
    });
    /** 删去所有应该被删去的产生式 */
    PInLoop = new Set(POutLoop);
    PInLoop.forEach((rule) => {
      const [l] = rule.split('->');
      l.trim();
      if (!VnOutLoop.has(l)) {
        POutLoop.delete(rule);
      }
    });
  }
  return Vn2null;
}

/**
 * 获取某非终结符的FIRST集合
 *
 * @param {String} vn 某非终结符
 * @param {Set} Vn 非终结符集合
 * @param {Set} Vt 终结符集合
 * @param {Set} P 规则集合
 * @param {Object} Vn2null 非终结符能否推出空
 * @returns
 */
function getFIRSTSet(vn, Vn, Vt, P, Vn2null) {
  const FIRSTSet = new Set();
  const Vnstack = new Set();
  /**
   * 递归获取符号v的FIRST集合
   *
   * @param {String} lvn 产生式左部的非终结符
   */
  function getFIRSTv(lvn) {
    /** 防止无限递归 */
    if (Vnstack.has(lvn)) {
      return;
    }
    Vnstack.add(lvn);
    P.forEach((rule) => {
      const [l, r] = rule.split('->');
      l.trim();
      r.trim();
      if (l === lvn) {
        const Vr = r.split('');
        for (let i = 0; i < Vr.length; i += 1) {
          const rv = Vr[i];
          if (Vt.has(rv)) {
            FIRSTSet.add(rv);
            break;
          } else if (Vn.has(rv)) {
            getFIRSTv(rv);
            if (Vn2null[rv] === false) {
              break;
            }
          }
        }
      }
    });
    if (Vn2null[lvn] === true) {
      FIRSTSet.add('ε');
    } else {
      FIRSTSet.delete('ε');
    }
  }
  getFIRSTv(vn);
  return FIRSTSet;
}

/**
 * 获取所有非终结符的FIRST集合
 *
 * @returns
 */
function getFIRSTSets() {
  const {
    Vn, Vt, P, Vn2null,
  } = this;
  const FIRSTSets = {};
  Vn.forEach((v) => {
    FIRSTSets[v] = getFIRSTSet(v, Vn, Vt, P, Vn2null);
  });
  return FIRSTSets;
}

/**
 * 获取某非终结符的FOLLOW集合
 *
 * @param {String} vn 非终结符
 * @param {Set} Vn 非终结符集合
 * @param {Set} Vt 终结符集合
 * @param {Set} P 规则集合
 * @param {String} S 开始符
 * @param {Object} Vn2null 非终结符能否推出空
 * @param {Object} FIRST 非终结符的FIRST集合
 * @returns
 */
function getFOLLOWSet(vn, Vn, Vt, P, S, Vn2null, FIRST) {
  const FOLLOWSet = new Set();
  const Vnstack = new Set();
  /**
   * 递归获取符号v的FOLLOW集合
   *
   * @param {String} lvn 产生式左部的非终结符
   */
  function getFOLLOWv(lvn) {
    /** 防止无限递归 */
    if (Vnstack.has(lvn)) {
      return;
    }
    Vnstack.add(lvn);
    if (lvn === S) {
      FOLLOWSet.add('#');
    }
    P.forEach((rule) => {
      const [l, r] = rule.split('->');
      l.trim();
      r.trim();
      if (r.includes(lvn)) {
        const VrAll = r.split('');
        const Vr = VrAll.slice(VrAll.indexOf(lvn) + 1);
        if (!Vr[0]) {
          getFOLLOWv(l);
        } else {
          for (let i = 0; i < Vr.length; i += 1) {
            const rv = Vr[i];
            if (Vt.has(rv)) {
              FOLLOWSet.add(rv);
              break;
            } else if (Vn.has(rv)) {
              FIRST[rv].forEach((v) => {
                if (v !== 'ε') {
                  FOLLOWSet.add(v);
                }
              });
              if (Vn2null[rv] === true && i === Vr.length - 1) {
                getFOLLOWv(l);
              } else if (Vn2null[rv] === false) {
                break;
              }
            }
          }
        }
      }
    });
  }
  getFOLLOWv(vn);
  return FOLLOWSet;
}

/**
 * 获取所有非终结符的FOLLOW集合
 *
 * @returns
 */
function getFOLLOWSets() {
  const {
    Vn, Vt, P, S, Vn2null, FIRST,
  } = this;
  const FOLLOWSets = {};
  Vn.forEach((v) => {
    FOLLOWSets[v] = getFOLLOWSet(v, Vn, Vt, P, S, Vn2null, FIRST);
  });
  return FOLLOWSets;
}

/**
 * 产生式右部能否推出空
 *
 * @param {Array} Vr 产生式右部字符串
 * @param {Set} Vt 终结符集合
 * @param {Object} Vn2null 非终结符能否推出空
 * @returns
 */
function Vr2null(Vr, Vt, Vn2null) {
  if (Vr.join('') === 'ε') {
    return true;
  }
  for (let index = 0; index < Vr.length; index += 1) {
    const rv = Vr[index];
    if (Vn2null[rv] === true && index === Vr.length - 1) {
      return true;
    } else if (Vt.has(rv) || Vn2null[rv] === false) {
      return false;
    }
  }
  return false;
}

/**
 * 获取字符串的FIRST集合
 *
 * @param {Array} Vr 字符串
 * @param {Set} Vn 非终结符集合
 * @param {Set} Vt 终结符集合
 * @param {Object} Vn2null 非终结符能否推出空
 * @param {Object} FIRST 非终结符FIRST集合
 * @returns
 */
function FIRSTVr(Vr, Vn, Vt, Vn2null, FIRST) {
  const FIRSTVrSet = new Set();
  if (Vr.join('') === 'ε') {
    FIRSTVrSet.add('ε');
  } else {
    for (let index = 0; index < Vr.length; index += 1) {
      const rv = Vr[index];
      if (Vt.has(rv)) {
        FIRSTVrSet.add(rv);
        break;
      } else if (Vn.has(rv)) {
        FIRST[rv].forEach((v) => {
          if (v !== 'ε') {
            FIRSTVrSet.add(v);
          }
        });
        if (Vn2null[rv] === true && index === Vr.length - 1) {
          FIRSTVrSet.add('ε');
        } else if (Vn2null[rv] === false) {
          break;
        }
      }
    }
  }
  return FIRSTVrSet;
}

/**
 * 获取所有非终结符的SELECT集合
 *
 * @returns
 */
function getSELECTSets() {
  const {
    Vn, Vt, P, Vn2null, FIRST, FOLLOW,
  } = this;
  const SELECTSetsObject = {};
  Vn.forEach((v) => {
    SELECTSetsObject[v] = {};
  });
  P.forEach((rule) => {
    let SELECTSet;
    const [l, r] = rule.split('->');
    l.trim();
    r.trim();
    const Vr = r.split('');
    if (Vr2null(Vr, Vt, Vn2null)) {
      SELECTSet = FOLLOW[l];
      const FIRSTSet = FIRSTVr(Vr, Vn, Vt, Vn2null, FIRST);
      FIRSTSet.forEach((v) => {
        if (v !== 'ε') {
          SELECTSet.add(v);
        }
      });
    } else {
      SELECTSet = FIRSTVr(Vr, Vn, Vt, Vn2null, FIRST);
    }
    SELECTSetsObject[l][rule] = SELECTSet;
  });
  return SELECTSetsObject;
}

/**
 * 判断是否是LL(1)文法
 *
 * @returns
 */
function getIsLL1() {
  const { SELECT } = this;
  const SELECTSetsObjectArray = Object.values(SELECT);
  for (let index = 0; index < SELECTSetsObjectArray.length; index += 1) {
    const SELECTSetsObject = SELECTSetsObjectArray[index];
    const SELECTSets = Object.values(SELECTSetsObject);
    const SELECTArray = [];
    SELECTSets.forEach((SELECTSet) => {
      SELECTSet.forEach((v) => {
        SELECTArray.push(v);
      });
    });
    const SELECTSet = new Set(SELECTArray);
    if (SELECTArray.length !== [...SELECTSet].length) {
      return false;
    }
  }
  return true;
}

module.exports = function LL1Judgement(Vn, Vt, P, S) {
  [this.Vn, this.Vt, this.P, this.S] = [Vn, Vt, P, S];
  const Vn2null = getVn2null();
  this.Vn2null = Vn2null;
  const FIRST = getFIRSTSets();
  this.FIRST = FIRST;
  const FOLLOW = getFOLLOWSets();
  this.FOLLOW = FOLLOW;
  const SELECT = getSELECTSets();
  this.SELECT = SELECT;
  const isLL1 = getIsLL1();
  return {
    Vn2null,
    FIRST,
    FOLLOW,
    SELECT,
    isLL1,
  };
};
