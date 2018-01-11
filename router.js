const Router = require('koa-router');
const LL1 = require('./LL1');

const router = new Router();

router
  .get('/', async (ctx) => {
    await ctx.render('index');
  })
  .post('/result', async (ctx) => {
    let { input, PText } = ctx.request.body;
    let unformattedP;
    if (!input || !PText) {
      PText = '';
      unformattedP = new Set(['S->TA', 'A->+TA|ε', 'T->FB', 'B->*FB|ε', 'F->i|(S)']);
      input = 'i+i*i';
    } else {
      unformattedP = new Set(PText.split('\r\n'));
    }
    let error;
    let Vn;
    let Vt;
    let P;
    let Vn2null;
    let FIRST;
    let FOLLOW;
    let SELECT;
    let isLL1;
    let LL1AnalysisTable;
    let isSentence;
    let inputAnalysisTable;
    try {
      ({
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
      } = LL1(unformattedP, input));
    } catch (err) {
      // TODO: 错误处理
      if (!err.message.includes('无法识别') && !err.message.includes('进制转换溢出')) {
        error = '请提交规范代码！';
      } else {
        error = err.message;
      }
    }
    await ctx.render('result', {
      Vn,
      Vt,
      P,
      error,
      Vn2null,
      FIRST,
      FOLLOW,
      SELECT,
      isLL1,
      LL1AnalysisTable,
      isSentence,
      inputAnalysisTable,
    });
  });

module.exports = router;
