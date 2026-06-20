import { MonthlyTrend, SectorAllocation } from '@/types/portfolio';

export interface AdviceItem {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface PortfolioAnalysis {
  score: number; // 0-100
  advice: AdviceItem[];
  summary: string;
}

/**
 * ポートフォリオを分析してアドバイスを生成
 */
export function analyzePortfolio(
  monthlyTrends: MonthlyTrend[],
  sectorAllocations: SectorAllocation[]
): PortfolioAnalysis {
  const advice: AdviceItem[] = [];
  let score = 100;

  // 最新データ
  const latest = monthlyTrends[0];
  const previous = monthlyTrends[1];
  const oneYearAgo = monthlyTrends[12];
  const threeYearsAgo = monthlyTrends[36];

  // 1. 資産成長率の分析
  if (previous) {
    const monthlyGrowth = ((latest.total - previous.total) / previous.total) * 100;
    if (monthlyGrowth > 3) {
      advice.push({
        type: 'success',
        title: '優れた成長率',
        description: `前月比 +${monthlyGrowth.toFixed(1)}% の成長。順調に資産が増加しています。`,
      });
    } else if (monthlyGrowth < -3) {
      advice.push({
        type: 'warning',
        title: '資産減少傾向',
        description: `前月比 ${monthlyGrowth.toFixed(1)}% の減少。市場の変動に注意が必要です。`,
      });
      score -= 5;
    }
  }

  if (oneYearAgo) {
    const yearlyGrowth = ((latest.total - oneYearAgo.total) / oneYearAgo.total) * 100;
    advice.push({
      type: 'info',
      title: '年間成長率',
      description: `過去1年間で ${yearlyGrowth > 0 ? '+' : ''}${yearlyGrowth.toFixed(1)}% の成長。`,
    });
  }

  // 2. 資産配分の分析
  const trustRatio = (latest.trust / latest.total) * 100;
  const cashRatio = (latest.cash / latest.total) * 100;
  const stockRatio = (latest.stock / latest.total) * 100;
  const pensionRatio = (latest.pension / latest.total) * 100;

  // 投資信託が主力（良い）
  if (trustRatio > 70) {
    advice.push({
      type: 'success',
      title: '投資信託中心のポートフォリオ',
      description: `投資信託が ${trustRatio.toFixed(1)}% を占めています。分散投資が実現できています。`,
    });
  }

  // 現金比率のチェック
  if (cashRatio < 5) {
    advice.push({
      type: 'warning',
      title: '緊急資金の確保',
      description: `現金比率が ${cashRatio.toFixed(1)}% と低めです。生活費の3〜6ヶ月分の現金確保を推奨します。`,
    });
    score -= 10;
  } else if (cashRatio > 20) {
    advice.push({
      type: 'info',
      title: '現金比率が高い',
      description: `現金比率が ${cashRatio.toFixed(1)}% です。余剰資金があれば投資を検討してもよいでしょう。`,
    });
  }

  // 3. セクター集中リスク
  if (sectorAllocations.length > 0) {
    const topSector = sectorAllocations[0];
    if (topSector.percentage > 35) {
      advice.push({
        type: 'warning',
        title: 'セクター集中リスク',
        description: `${topSector.sector.replace('(not essential)', '').replace('(essential)', '').trim()} セクターが ${topSector.percentage.toFixed(1)}% を占めています。特定セクターへの依存度が高いため、リスク分散を検討してください。`,
      });
      score -= 8;
    }

    // Technology集中の警告
    const techSector = sectorAllocations.find(s => s.sector.includes('Technor') || s.sector.includes('Technology'));
    if (techSector && techSector.percentage > 30) {
      advice.push({
        type: 'info',
        title: 'テクノロジーセクターの比重',
        description: `テクノロジーセクターが ${techSector.percentage.toFixed(1)}% を占めています。成長性は高いですが、ボラティリティにも注意が必要です。`,
      });
    }
  }

  // 4. 長期的な成長トレンド
  if (threeYearsAgo) {
    const threeYearGrowth = ((latest.total - threeYearsAgo.total) / threeYearsAgo.total) * 100;
    const annualizedReturn = (Math.pow(latest.total / threeYearsAgo.total, 1/3) - 1) * 100;

    if (annualizedReturn > 10) {
      advice.push({
        type: 'success',
        title: '優秀な長期パフォーマンス',
        description: `過去3年間の年率換算リターン: ${annualizedReturn.toFixed(1)}%。市場平均を上回る成長を実現しています。`,
      });
    } else if (annualizedReturn > 5) {
      advice.push({
        type: 'info',
        title: '堅実な長期パフォーマンス',
        description: `過去3年間の年率換算リターン: ${annualizedReturn.toFixed(1)}%。着実に資産が増加しています。`,
      });
    }
  }

  // 5. 年金・老後資産
  if (pensionRatio > 0) {
    advice.push({
      type: 'success',
      title: '老後資産の準備',
      description: `年金資産が ${pensionRatio.toFixed(1)}% (¥${latest.pension.toLocaleString('ja-JP')}) あります。老後資金の確保が進んでいます。`,
    });
  }

  // スコア調整
  score = Math.max(0, Math.min(100, score));

  // サマリー生成
  const summary = generateSummary(score, latest, trustRatio, cashRatio);

  return {
    score,
    advice,
    summary,
  };
}

function generateSummary(
  score: number,
  latest: MonthlyTrend,
  trustRatio: number,
  cashRatio: number
): string {
  if (score >= 90) {
    return `総合評価: 優秀（${score}点）。ポートフォリオは非常にバランスが良く、長期的な資産形成が順調に進んでいます。`;
  } else if (score >= 80) {
    return `総合評価: 良好（${score}点）。ポートフォリオは概ね健全です。一部改善の余地がありますが、全体的には良好な状態です。`;
  } else if (score >= 70) {
    return `総合評価: 普通（${score}点）。いくつかの改善点があります。リスク分散と資産配分の見直しを検討してください。`;
  } else {
    return `総合評価: 要改善（${score}点）。ポートフォリオの再構築を推奨します。ファイナンシャルアドバイザーへの相談も検討してください。`;
  }
}
