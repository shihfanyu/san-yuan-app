/**
 * 三元玄空挨星排盤核心演算法
 *
 * 洛書九宮標準排列（南在上）：
 *   巽(4) 離(9) 坤(2)
 *   震(3) 中(5) 兌(7)
 *   艮(8) 坎(1) 乾(6)
 *
 * 飛布順序：中→乾→兌→艮→離→坎→坤→震→巽
 */

// ── 常數 ──────────────────────────────────────────────────

/** 飛布路徑（宮位編號，共9步） */
const FLY_ORDER = [5, 6, 7, 8, 9, 1, 2, 3, 4] as const;

/** 宮位 → 網格索引 (row*3+col)，row0=上，col0=左 */
const PALACE_IDX: Record<number, number> = {
  4: 0, 9: 1, 2: 2,  // 上排: 巽 離 坤
  3: 3, 5: 4, 7: 5,  // 中排: 震 中 兌
  8: 6, 1: 7, 6: 8,  // 下排: 艮 坎 乾
};

/** 24 山 → 所在宮位編號 */
const MOUNTAIN_PALACE: Record<string, number> = {
  壬: 1, 子: 1, 癸: 1,  // 坎 (N)
  丑: 8, 艮: 8, 寅: 8,  // 艮 (NE)
  甲: 3, 卯: 3, 乙: 3,  // 震 (E)
  辰: 4, 巽: 4, 巳: 4,  // 巽 (SE)
  丙: 9, 午: 9, 丁: 9,  // 離 (S)
  未: 2, 坤: 2, 申: 2,  // 坤 (SW)
  庚: 7, 酉: 7, 辛: 7,  // 兌 (W)
  戌: 6, 乾: 6, 亥: 6,  // 乾 (NW)
};

/**
 * 24 山陰陽：四正山（坎/離/震/兌 三山）= 陽 → 順飛
 *             四隅山（艮/巽/坤/乾 三山）= 陰 → 逆飛
 */
const MOUNTAIN_YANG: Record<string, boolean> = {
  壬: true,  子: true,  癸: true,
  丑: false, 艮: false, 寅: false,
  甲: true,  卯: true,  乙: true,
  辰: false, 巽: false, 巳: false,
  丙: true,  午: true,  丁: true,
  未: false, 坤: false, 申: false,
  庚: true,  酉: true,  辛: true,
  戌: false, 乾: false, 亥: false,
};

/** 坐山 → 朝向（對宮） */
const OPPOSITE: Record<string, string> = {
  壬:'丙', 子:'午', 癸:'丁',
  丑:'未', 艮:'坤', 寅:'申',
  甲:'庚', 卯:'酉', 乙:'辛',
  辰:'戌', 巽:'乾', 巳:'亥',
  丙:'壬', 午:'子', 丁:'癸',
  未:'丑', 坤:'艮', 申:'寅',
  庚:'甲', 酉:'卯', 辛:'乙',
  戌:'辰', 乾:'巽', 亥:'巳',
};

/**
 * 視角 → 顯示宮位排列（9個宮位編號，從左上到右下）
 * 每種視角讓朝向方向顯示在格子頂端
 */
export const SHIJIAO_OPTIONS = [
  '背坎向離', '背離向坎',
  '背震向兌', '背兌向震',
  '背艮向坤', '背坤向艮',
  '背乾向巽', '背巽向乾',
] as const;

export type ShijiaoType = typeof SHIJIAO_OPTIONS[number];

const SHIJIAO_DISPLAY: Record<ShijiaoType, number[]> = {
  '背坎向離': [4, 9, 2, 3, 5, 7, 8, 1, 6],  // 標準：南在上
  '背離向坎': [6, 1, 8, 7, 5, 3, 2, 9, 4],  // 北在上
  '背震向兌': [2, 7, 6, 9, 5, 1, 4, 3, 8],  // 西在上
  '背兌向震': [8, 3, 4, 1, 5, 9, 6, 7, 2],  // 東在上
  '背艮向坤': [9, 2, 7, 4, 5, 6, 3, 8, 1],  // 西南在上
  '背坤向艮': [1, 8, 3, 6, 5, 4, 7, 2, 9],  // 東北在上
  '背乾向巽': [3, 4, 9, 8, 5, 2, 1, 6, 7],  // 東南在上
  '背巽向乾': [7, 6, 1, 2, 5, 8, 9, 4, 3],  // 西北在上
};

/** 宮位顯示名稱 */
export const PALACE_LABELS: Record<number, string> = {
  1: '坎', 2: '坤', 3: '震', 4: '巽',
  5: '中', 6: '乾', 7: '兌', 8: '艮', 9: '離',
};

/** 宮位方向 */
export const PALACE_DIRECTION: Record<number, string> = {
  1: '北', 2: '西南', 3: '東', 4: '東南',
  5: '中', 6: '西北', 7: '西', 8: '東北', 9: '南',
};

// ── 24 山與運別清單 ──────────────────────────────────────

export const MOUNTAINS = [
  '壬山', '子山', '癸山',
  '丑山', '艮山', '寅山',
  '甲山', '卯山', '乙山',
  '辰山', '巽山', '巳山',
  '丙山', '午山', '丁山',
  '未山', '坤山', '申山',
  '庚山', '酉山', '辛山',
  '戌山', '乾山', '亥山',
] as const;

export const YUN_LABELS = ['一運', '二運', '三運', '四運', '五運', '六運', '七運', '八運', '九運'] as const;

// ── 工具函式 ─────────────────────────────────────────────

/** 安全模 9，結果範圍 1-9 */
function mod9(n: number): number {
  return ((n - 1 + 9 * 100) % 9) + 1;
}

/**
 * 建立一個飛星盤（9格，以 grid index 0-8 為 key）
 * @param center 中宮起始星數 (1-9)
 * @param forward true=順飛, false=逆飛
 */
function buildChart(center: number, forward: boolean): number[] {
  const result = new Array(9).fill(0);
  for (let i = 0; i < 9; i++) {
    const palace = FLY_ORDER[i];
    const star = forward ? mod9(center + i) : mod9(center - i);
    result[PALACE_IDX[palace]] = star;
  }
  return result;
}

/** 從 chart 陣列取出指定宮位的星數 */
function getFromChart(chart: number[], palace: number): number {
  return chart[PALACE_IDX[palace]];
}

// ── 主計算函式 ───────────────────────────────────────────

export interface PalaceCell {
  palace: number;     // 宮位編號 1-9
  periodStar: number; // 元旦盤星
  mountStar: number;  // 山星
  facingStar: number; // 向星
  isFire: boolean;    // 是否為火坑宮位
}

export interface StarChartResult {
  yun: number;
  cells: PalaceCell[]; // 9格，依視角排列（TL→BR）
}

/**
 * 計算單一運別的挨星盤
 * @param yun     運別 1-9
 * @param mountain 坐山（含「山」字，如「子山」）
 * @param shijiao 視角
 * @param isFire  是否標示火坑
 * @param isQiXing 是否啟用起星（替星法）
 */
export function computeChart(
  yun: number,
  mountain: string,
  shijiao: ShijiaoType,
  isFire: boolean,
  isQiXing: boolean
): StarChartResult {
  // 去掉「山」字取得山名
  const mtn = mountain.replace('山', '');
  const opp = OPPOSITE[mtn];

  const sitPalace = MOUNTAIN_PALACE[mtn];
  const facPalace = MOUNTAIN_PALACE[opp];

  // 元旦盤（以運別為中宮，順飛）
  const periodChart = buildChart(yun, true);

  // 山星/向星中宮值
  const sitCenter = getFromChart(periodChart, sitPalace);
  const facCenter = getFromChart(periodChart, facPalace);

  // 標準下卦法：飛行方向由期星奇偶決定（奇數=陽=順飛，偶數=陰=逆飛）
  let sitForward = sitCenter % 2 === 1;
  let facForward = facCenter % 2 === 1;

  // 起星（替星法）：改用山的固有陰陽決定飛行方向（四正=陽=順，四隅=陰=逆）
  if (isQiXing) {
    sitForward = MOUNTAIN_YANG[mtn];
    facForward = MOUNTAIN_YANG[opp];
  }

  const mountChart  = buildChart(sitCenter, sitForward);
  const facingChart = buildChart(facCenter, facForward);

  // 火坑：五黃（5）出現在中宮或坐山/朝向宮位時標記
  const firePalaces = new Set<number>();
  if (isFire) {
    for (let p = 1; p <= 9; p++) {
      const pidx = PALACE_IDX[p];
      if (
        mountChart[pidx] === 5 ||
        facingChart[pidx] === 5 ||
        (mountChart[pidx] + facingChart[pidx] === 10 && periodChart[pidx] === 5)
      ) {
        firePalaces.add(p);
      }
    }
  }

  // 依視角排列格子
  const displayOrder = SHIJIAO_DISPLAY[shijiao];
  const cells: PalaceCell[] = displayOrder.map((palace) => {
    const idx = PALACE_IDX[palace];
    return {
      palace,
      periodStar: periodChart[idx],
      mountStar:  mountChart[idx],
      facingStar: facingChart[idx],
      isFire:     firePalaces.has(palace),
    };
  });

  return { yun, cells };
}

/**
 * 計算三個連續運別的挨星盤（前運、當運、後運）
 */
export function getThreeCharts(
  yun: number,
  mountain: string,
  shijiao: ShijiaoType,
  isFire: boolean,
  isQiXing: boolean
): StarChartResult[] {
  const prev = mod9(yun - 1);
  const next = mod9(yun + 1);
  return [
    computeChart(prev, mountain, shijiao, isFire, isQiXing),
    computeChart(yun,  mountain, shijiao, isFire, isQiXing),
    computeChart(next, mountain, shijiao, isFire, isQiXing),
  ];
}
