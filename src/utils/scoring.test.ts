import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateListeningBandScore,
  calculateReadingBandScore,
  calculateOverallBandScore,
  calculateWritingBandScore,
  calculateSpeakingBandScore,
  getCEFRLevel,
  roundToIELTSBand
} from './scoring.ts';

test('calculateListeningBandScore maps raw scores to accurate IELTS bands', () => {
  assert.equal(calculateListeningBandScore(40), 9.0);
  assert.equal(calculateListeningBandScore(39), 9.0);
  assert.equal(calculateListeningBandScore(35), 8.0);
  assert.equal(calculateListeningBandScore(30), 7.0);
  assert.equal(calculateListeningBandScore(23), 6.0);
  assert.equal(calculateListeningBandScore(16), 5.0);
});

test('calculateReadingBandScore maps raw Academic scores accurately', () => {
  assert.equal(calculateReadingBandScore(39), 9.0);
  assert.equal(calculateReadingBandScore(35), 8.0);
  assert.equal(calculateReadingBandScore(30), 7.0);
  assert.equal(calculateReadingBandScore(23), 6.0);
  assert.equal(calculateReadingBandScore(15), 5.0);
});

test('calculateWritingBandScore weights Task 2 double Task 1 with official half-band rounding', () => {
  // Task 1 = 6.0, Task 2 = 7.0 -> (6.0 + 2*7.0)/3 = 20/3 = 6.666... -> frac 0.666 >= 0.25 and < 0.75 -> 6.5
  assert.equal(calculateWritingBandScore(6.0, 7.0), 6.5);

  // Task 1 = 7.0, Task 2 = 7.0 -> (7.0 + 14.0)/3 = 7.0
  assert.equal(calculateWritingBandScore(7.0, 7.0), 7.0);

  // Task 1 = 6.0, Task 2 = 7.5 -> (6.0 + 15.0)/3 = 7.0
  assert.equal(calculateWritingBandScore(6.0, 7.5), 7.0);

  // Task 1 = 7.0, Task 2 = 8.0 -> (7.0 + 16.0)/3 = 23/3 = 7.666... -> 7.5
  assert.equal(calculateWritingBandScore(7.0, 8.0), 7.5);
});

test('calculateSpeakingBandScore averages 4 criteria and rounds to half band', () => {
  // FC=7.0, LR=7.5, GRA=7.0, PR=7.5 -> avg 7.25 -> rounds to 7.5
  assert.equal(calculateSpeakingBandScore(7.0, 7.5, 7.0, 7.5), 7.5);

  // FC=6.0, LR=6.0, GRA=6.5, PR=6.0 -> avg 6.125 -> rounds to 6.0
  assert.equal(calculateSpeakingBandScore(6.0, 6.0, 6.5, 6.0), 6.0);
});

test('calculateOverallBandScore implements official IELTS rounding rules', () => {
  // 6.5, 6.5, 6.0, 6.0 = 25.0 / 4 = 6.25 -> rounds up to 6.5
  assert.equal(calculateOverallBandScore(6.5, 6.5, 6.0, 6.0), 6.5);

  // 6.5, 6.5, 5.5, 6.0 = 24.5 / 4 = 6.125 -> rounds down to 6.0
  assert.equal(calculateOverallBandScore(6.5, 6.5, 5.5, 6.0), 6.0);

  // 6.5, 7.0, 7.0, 6.5 = 27.0 / 4 = 6.75 -> rounds up to 7.0
  assert.equal(calculateOverallBandScore(6.5, 7.0, 7.0, 6.5), 7.0);

  // 7.5, 8.0, 7.0, 7.5 = 30.0 / 4 = 7.5 -> stays 7.5
  assert.equal(calculateOverallBandScore(7.5, 8.0, 7.0, 7.5), 7.5);
});

test('getCEFRLevel returns correct CEFR mapping', () => {
  assert.equal(getCEFRLevel(8.5), 'C2 (Mastery)');
  assert.equal(getCEFRLevel(7.5), 'C1 (Effective Operational Proficiency)');
  assert.equal(getCEFRLevel(6.5), 'B2 (Vantage)');
  assert.equal(getCEFRLevel(4.5), 'B1 (Threshold)');
});
