const LL1Judgement = require('./LL1Judgement');
const LL1Analysis = require('./LL1Analysis');

/**
 * LL(1)方法的语法分析
 *
 * @param {any} unformattedP 不规范的规则集合
 * @param {any} input 输入串
 */
function LL1(unformattedP, input) {
  /** 非终结符 */
  const Vn = new Set();
  /** 终结符 */
  const Vt = new Set();
  /** 规则 */
  const P = new Set();
  /** 开始符 */
  const S = 'S';

  /** 标准化P */
  unformattedP.forEach((rule) => {
    const [l, r] = rule.split('->');
    l.trim();
    r.trim();
    if (r.includes('|')) {
      const rrules = r.split('|');
      rrules.forEach((rrule) => {
        P.add(`${l}->${rrule.trim()}`);
      });
    } else {
      P.add(rule);
    }
  });
  /** 获取非终结符 */
  P.forEach((rule) => {
    const [l] = rule.split('->');
    Vn.add(l.trim());
  });
  /** 获取终结符 */
  P.forEach((rule) => {
    const [, r] = rule.split('->');
    r.trim();
    const Vr = r.split('');
    Vr.forEach((v) => {
      if (!Vn.has(v) && v !== 'ε' && v !== ' ') {
        Vt.add(v);
      }
    });
  });
  /** 判断是否含有左公因子 */
  let hasLCF = false;
  Vn.forEach((vn) => {
    const LCFArray = [];
    const LCFSet = new Set();
    P.forEach((rule) => {
      const [l, r] = rule.split('->');
      l.trim();
      r.trim();
      const Vr = r.split('');
      const firstv = Vr[0];
      if (l === vn && firstv !== 'ε') {
        LCFArray.push(firstv);
        LCFSet.add(firstv);
      }
    });
    if (LCFArray.length !== [...LCFSet].length) {
      hasLCF = true;
    }
  });
  /** 判断是否有左递归 */
  let hasLRecursion = false;
  Vn.forEach((v) => {
    const VRecursion = new Set();
    function recursion(vn) {
      P.forEach((rule) => {
        const [l, r] = rule.split('->');
        l.trim();
        r.trim();
        if (l === vn) {
          const Vr = r.split('');
          const firstv = Vr[0];
          if (Vn.has(firstv)) {
            if (VRecursion.has(firstv)) {
              hasLRecursion = true;
            } else {
              VRecursion.add(firstv);
              recursion(firstv);
            }
          }
        }
      });
    }
    VRecursion.add(v);
    recursion(v);
  });

  let Vn2null;
  let FIRST;
  let FOLLOW;
  let SELECT;
  let isLL1;
  let LL1AnalysisTable = [];
  let isSentence = false;
  let inputAnalysisTable = [];

  if (hasLCF || hasLRecursion) {
    isLL1 = false;
  } else {
    /** 判断文法是否为LL(1)文法 */
    ({
      Vn2null, FIRST, FOLLOW, SELECT, isLL1,
    } = LL1Judgement(Vn, Vt, P, S));
    /** 构造预测分析表和生成对符号串的分析过程 */
    if (isLL1) {
      ({ LL1AnalysisTable, isSentence, inputAnalysisTable } = LL1Analysis(
        Vn,
        Vt,
        S,
        input,
        SELECT,
      ));
    }
  }

  return {
    hasLCF,
    hasLRecursion,
    Vn,
    Vt,
    P,
    Vn2null,
    FIRST,
    FOLLOW,
    SELECT,
    isLL1,
    LL1AnalysisTable,
    isSentence,
    inputAnalysisTable,
  };
}

module.exports = LL1;
