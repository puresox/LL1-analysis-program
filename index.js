const LL1Judgement = require('./LL1Judgement');
const LL1Analysis = require('./LL1Analysis');

/** 非终结符 */
const Vn = new Set();
/** 终结符 */
const Vt = new Set();
/** 规则 */
const unformattedP = new Set(['E->TA', 'A->+TA|ε', 'T->FB', 'B->*FB|ε', 'F->i|(E)']);
const P = new Set();
/** 开始符 */
const S = 'E';
/** 输入串 */
const input = 'i+i*i';

// TODO:非LL（1）等价位LL（1）
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

/** 判断文法是否为LL(1)文法 */
const {
  Vn2null, FIRST, FOLLOW, SELECT, isLL1,
} = LL1Judgement(Vn, Vt, P, S);
/** 构造预测分析表和生成对符号串的分析过程 */
let LL1AnalysisTable = [];
let inputAnalysisTable = [];
if (isLL1) {
  ({ LL1AnalysisTable, inputAnalysisTable } = LL1Analysis(Vn, Vt, S, input, SELECT));
}
console.log(Vn2null, FIRST, FOLLOW, SELECT, isLL1, LL1AnalysisTable, inputAnalysisTable);

// TODO:界面
