/**
 * 构造预测分析表
 */

/**
 * 构造预测分析表
 *
 * @returns
 */
function getLL1AnalysisTable() {
  const { Vn, Vt, SELECT } = this;
  const LL1AnalysisTable = [];
  /** 生成表头 */
  const LL1AnalysisTableHead = [...Vt];
  LL1AnalysisTableHead.push('#');
  LL1AnalysisTableHead.unshift('');
  LL1AnalysisTable.push(LL1AnalysisTableHead);
  /** 生成表体 */
  Vn.forEach((vn) => {
    const LL1AnalysisTableBody = [];
    LL1AnalysisTableHead.forEach(() => {
      LL1AnalysisTableBody.push('');
    });
    LL1AnalysisTableBody[0] = vn;
    const SELECTv = SELECT[vn];
    const rules = Object.keys(SELECTv);
    rules.forEach((rule) => {
      LL1AnalysisTableHead.forEach((v, index) => {
        if (SELECTv[rule].has(v)) {
          LL1AnalysisTableBody[index] = rule;
        }
      });
    });
    LL1AnalysisTable.push(LL1AnalysisTableBody);
  });
  return LL1AnalysisTable;
}

/**
 * 输入串分析过程
 *
 * @returns
 */
function getinputAnalysisTable() {
  const { S, input, SELECT } = this;
  const inputAnalysisTable = [];
  inputAnalysisTable.push(['步骤', '分析栈', '剩余输入串', '推导所用产生式或匹配']);
  inputAnalysisTable.push(['1', `#${S}`, `${input}#`, '']);
  for (let index = 1; index < 100; index += 1) {
    /** 一行 */
    const line = inputAnalysisTable[index];
    /** 分析栈,剩余输入串 */
    const [stack, left] = [line[1].split(''), line[2].split('')];
    /** 分析栈最后一个符号,剩余输入串的第一个符号 */
    const [lastOfStack, firstOfLeft] = [stack.pop(), left[0]];

    if (lastOfStack === '#' && firstOfLeft === '#') {
      inputAnalysisTable[index][3] = '接受';
      break;
    } else if (lastOfStack === firstOfLeft) {
      inputAnalysisTable[index][3] = `${lastOfStack}匹配`;
      left.shift();
      inputAnalysisTable.push([index + 1, stack.join(''), left.join(''), '']);
    } else {
      /** 分析栈最后一个符号的产生式 */
      const rules = Object.keys(SELECT[lastOfStack]);
      let includeV = false;
      for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];
        if (SELECT[lastOfStack][rule].has(firstOfLeft)) {
          inputAnalysisTable[index][3] = rule;
          const [, r] = rule.split('->');
          const Vr = r.split('');
          for (let j = Vr.length - 1; j >= 0; j -= 1) {
            if (Vr[j] !== 'ε') {
              stack.push(Vr[j]);
            }
          }
          inputAnalysisTable.push([index + 1, stack.join(''), line[2], '']);
          includeV = true;
          break;
        }
      }
      if (includeV === false) {
        inputAnalysisTable[index][3] = '出错';
        return {
          isSentence: false,
          inputAnalysisTable,
        };
      }
    }
  }
  return {
    isSentence: true,
    inputAnalysisTable,
  };
}

/**
 * 构造预测分析表和生成对符号串的分析过程
 *
 * @param {any} Vn 非终结符集合
 * @param {any} Vt 终结符集合
 * @param {any} S 开始符
 * @param {any} input 输入串
 * @param {any} SELECT 非终结符的SELECT集合
 * @returns
 */
function LL1Analysis(Vn, Vt, S, input, SELECT) {
  [this.Vn, this.Vt, this.S, this.input, this.SELECT] = [Vn, Vt, S, input, SELECT];
  const LL1AnalysisTable = getLL1AnalysisTable();
  const { isSentence, inputAnalysisTable } = getinputAnalysisTable();
  return { LL1AnalysisTable, isSentence, inputAnalysisTable };
}

module.exports = LL1Analysis;
