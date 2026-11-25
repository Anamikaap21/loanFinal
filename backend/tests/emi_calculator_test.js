import test from 'node:test';
import assert from 'node:assert';

// Formula mirroring EMICalculator.jsx
function calculateEMI({ loanAmount, interestRate, tenure, tenureUnit }) {
  const rawP = parseFloat(String(loanAmount).replace(/,/g, ''));
  const P = !isNaN(rawP) && rawP > 0 ? rawP : 0;

  const rawRate = parseFloat(String(interestRate));
  const annualRate = !isNaN(rawRate) && rawRate >= 0 ? rawRate : 0;
  const monthlyRate = annualRate / 12 / 100;

  const rawTenure = parseFloat(String(tenure));
  const validTenure = !isNaN(rawTenure) && rawTenure > 0 ? rawTenure : 0;
  const N = tenureUnit === 'Years' ? Math.round(validTenure * 12) : Math.round(validTenure);

  let emi = 0;
  let totalPayable = 0;
  let totalInterest = 0;

  if (P > 0 && N > 0) {
    if (monthlyRate === 0) {
      emi = Math.round(P / N);
      totalPayable = P;
      totalInterest = 0;
    } else {
      const factor = Math.pow(1 + monthlyRate, N);
      if (isFinite(factor) && factor > 1) {
        emi = Math.round((P * monthlyRate * factor) / (factor - 1));
        totalPayable = Math.round(emi * N);
        totalInterest = Math.max(0, totalPayable - P);
      } else {
        emi = Math.round(P / N);
        totalPayable = P;
        totalInterest = 0;
      }
    }
  }

  return { P, N, emi, totalPayable, totalInterest };
}

test('REALCRED EMI Calculator - Mathematical Accuracy & Safety Verification', async (t) => {
  await t.test('1. Standard loan calculation (₹25,00,000 @ 8.75% for 15 Years)', () => {
    const res = calculateEMI({
      loanAmount: '2500000',
      interestRate: '8.75',
      tenure: '15',
      tenureUnit: 'Years',
    });

    assert.strictEqual(res.P, 2500000);
    assert.strictEqual(res.N, 180);
    // Formula verification: 25,00,000 * 0.0072916667 * (1.0072916667)^180 / ((1.0072916667)^180 - 1) = 25000 approx
    assert.ok(res.emi >= 24900 && res.emi <= 25100, `Expected ~25000 EMI, got ${res.emi}`);
    assert.strictEqual(res.totalPayable, res.emi * 180);
    assert.strictEqual(res.totalInterest, res.totalPayable - res.P);
    assert.ok(!isNaN(res.emi));
    assert.ok(isFinite(res.emi));
  });

  await t.test('2. Month-based tenure input (₹10,00,000 @ 10.5% for 60 Months)', () => {
    const resYears = calculateEMI({
      loanAmount: '1000000',
      interestRate: '10.5',
      tenure: '5',
      tenureUnit: 'Years',
    });

    const resMonths = calculateEMI({
      loanAmount: '1000000',
      interestRate: '10.5',
      tenure: '60',
      tenureUnit: 'Months',
    });

    assert.strictEqual(resYears.N, 60);
    assert.strictEqual(resMonths.N, 60);
    assert.strictEqual(resYears.emi, resMonths.emi);
    assert.strictEqual(resYears.totalPayable, resMonths.totalPayable);
    assert.strictEqual(resYears.totalInterest, resMonths.totalInterest);
  });

  await t.test('3. Zero-Interest calculation (0% interest rate does not throw division-by-zero or NaN)', () => {
    const resZero = calculateEMI({
      loanAmount: '1200000',
      interestRate: '0',
      tenure: '12',
      tenureUnit: 'Months',
    });

    assert.strictEqual(resZero.P, 1200000);
    assert.strictEqual(resZero.N, 12);
    assert.strictEqual(resZero.emi, 100000);
    assert.strictEqual(resZero.totalPayable, 1200000);
    assert.strictEqual(resZero.totalInterest, 0);
    assert.ok(!isNaN(resZero.emi));
    assert.ok(isFinite(resZero.emi));
  });

  await t.test('4. Boundary and invalid inputs safety (Empty strings, zeroes, invalid numbers)', () => {
    const resEmpty = calculateEMI({
      loanAmount: '',
      interestRate: '',
      tenure: '',
      tenureUnit: 'Years',
    });
    assert.strictEqual(resEmpty.emi, 0);
    assert.strictEqual(resEmpty.totalPayable, 0);
    assert.strictEqual(resEmpty.totalInterest, 0);
    assert.ok(!isNaN(resEmpty.emi));

    const resNegative = calculateEMI({
      loanAmount: '-500000',
      interestRate: '-5',
      tenure: '-2',
      tenureUnit: 'Years',
    });
    assert.strictEqual(resNegative.emi, 0);
    assert.ok(!isNaN(resNegative.emi));

    const resAlpha = calculateEMI({
      loanAmount: 'abc',
      interestRate: 'xyz',
      tenure: 'ten',
      tenureUnit: 'Years',
    });
    assert.strictEqual(resAlpha.emi, 0);
    assert.ok(!isNaN(resAlpha.emi));
  });

  await t.test('5. High precision decimal interest rate (₹50,00,000 @ 8.65% for 20 Years)', () => {
    const resDecimal = calculateEMI({
      loanAmount: '5000000',
      interestRate: '8.65',
      tenure: '20',
      tenureUnit: 'Years',
    });

    assert.strictEqual(resDecimal.N, 240);
    assert.ok(resDecimal.emi > 40000 && resDecimal.emi < 50000);
    assert.strictEqual(resDecimal.totalPayable, resDecimal.emi * 240);
    assert.ok(resDecimal.totalInterest > 0);
    assert.ok(!isNaN(resDecimal.emi));
  });
});
