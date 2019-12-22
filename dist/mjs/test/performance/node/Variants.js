/* tslint:disable:no-empty no-identical-functions max-line-length no-construct use-primitive-type */
// @ts-ignore
import { calcPerformance } from 'rdtsc';
import { calcMemAllocate, CalcType } from '../../../main/common/test/Calc';
import { describe, it } from '../../../main/common/test/Mocha';
import { treeToSequenceVariants } from '../../../main/common/test/Variants';
describe('common > performance > Variants', function () {
  this.timeout(300000);
  const tree = [1, [2, 3], [4, 5, [6, 7]]];

  function iterateIterables(iterables) {
    for (const iterable of iterables) {
      for (const item of iterable) {}
    }
  }

  it('mem', function () {
    calcMemAllocate(CalcType.Min, 10000, () => {
      iterateIterables(treeToSequenceVariants(tree));
    });
  });
  it('perf', function () {
    const result = calcPerformance(10000, () => {// no operations
    }, () => iterateIterables(treeToSequenceVariants(tree)));
    console.log(result);
  });
});