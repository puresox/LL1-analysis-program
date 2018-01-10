/**
 * 构造预测分析表
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

function getinputAnalysisTable() {
  // TODO:输入串分析过程
}

module.exports = function LL1Analysis(Vn, Vt, P, S, input, SELECT) {
  [this.Vn, this.Vt, this.P, this.S, this.input, this.SELECT] = [Vn, Vt, P, S, input, SELECT];
  const LL1AnalysisTable = getLL1AnalysisTable();
  const inputAnalysisTable = getinputAnalysisTable();
  return { LL1AnalysisTable, inputAnalysisTable };
};
