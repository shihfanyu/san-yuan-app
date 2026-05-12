package com.sanyuan.calculator

/**
 * 三元玄空挨星排盤核心演算法（Kotlin 離線版）
 * 與 web/lib/sanyuan.ts 邏輯完全相同
 */

// ── 常數 ──────────────────────────────────────────────────

private val FLY_ORDER = intArrayOf(5, 6, 7, 8, 9, 1, 2, 3, 4)

private val PALACE_IDX = mapOf(
    4 to 0, 9 to 1, 2 to 2,
    3 to 3, 5 to 4, 7 to 5,
    8 to 6, 1 to 7, 6 to 8
)

private val MOUNTAIN_PALACE = mapOf(
    "壬" to 1, "子" to 1, "癸" to 1,
    "丑" to 8, "艮" to 8, "寅" to 8,
    "甲" to 3, "卯" to 3, "乙" to 3,
    "辰" to 4, "巽" to 4, "巳" to 4,
    "丙" to 9, "午" to 9, "丁" to 9,
    "未" to 2, "坤" to 2, "申" to 2,
    "庚" to 7, "酉" to 7, "辛" to 7,
    "戌" to 6, "乾" to 6, "亥" to 6
)

private val MOUNTAIN_YANG = mapOf(
    "壬" to true,  "子" to true,  "癸" to true,
    "丑" to false, "艮" to false, "寅" to false,
    "甲" to true,  "卯" to true,  "乙" to true,
    "辰" to false, "巽" to false, "巳" to false,
    "丙" to true,  "午" to true,  "丁" to true,
    "未" to false, "坤" to false, "申" to false,
    "庚" to true,  "酉" to true,  "辛" to true,
    "戌" to false, "乾" to false, "亥" to false
)

private val OPPOSITE = mapOf(
    "壬" to "丙", "子" to "午", "癸" to "丁",
    "丑" to "未", "艮" to "坤", "寅" to "申",
    "甲" to "庚", "卯" to "酉", "乙" to "辛",
    "辰" to "戌", "巽" to "乾", "巳" to "亥",
    "丙" to "壬", "午" to "子", "丁" to "癸",
    "未" to "丑", "坤" to "艮", "申" to "寅",
    "庚" to "甲", "酉" to "卯", "辛" to "乙",
    "戌" to "辰", "乾" to "巽", "亥" to "巳"
)

val SHIJIAO_DISPLAY = mapOf(
    "背坎向離" to intArrayOf(4, 9, 2, 3, 5, 7, 8, 1, 6),
    "背離向坎" to intArrayOf(6, 1, 8, 7, 5, 3, 2, 9, 4),
    "背震向兌" to intArrayOf(2, 7, 6, 9, 5, 1, 4, 3, 8),
    "背兌向震" to intArrayOf(8, 3, 4, 1, 5, 9, 6, 7, 2),
    "背艮向坤" to intArrayOf(9, 2, 7, 4, 5, 6, 3, 8, 1),
    "背坤向艮" to intArrayOf(1, 8, 3, 6, 5, 4, 7, 2, 9),
    "背乾向巽" to intArrayOf(3, 4, 9, 8, 5, 2, 1, 6, 7),
    "背巽向乾" to intArrayOf(7, 6, 1, 2, 5, 8, 9, 4, 3)
)

val PALACE_LABEL = mapOf(
    1 to "坎", 2 to "坤", 3 to "震", 4 to "巽",
    5 to "中", 6 to "乾", 7 to "兌", 8 to "艮", 9 to "離"
)

val PALACE_DIRECTION = mapOf(
    1 to "北", 2 to "西南", 3 to "東", 4 to "東南",
    5 to "中", 6 to "西北", 7 to "西", 8 to "東北", 9 to "南"
)

val MOUNTAINS = listOf(
    "壬山", "子山", "癸山", "丑山", "艮山", "寅山",
    "甲山", "卯山", "乙山", "辰山", "巽山", "巳山",
    "丙山", "午山", "丁山", "未山", "坤山", "申山",
    "庚山", "酉山", "辛山", "戌山", "乾山", "亥山"
)

val SHIJIAO_OPTIONS = listOf(
    "背坎向離", "背離向坎", "背震向兌", "背兌向震",
    "背艮向坤", "背坤向艮", "背乾向巽", "背巽向乾"
)

val YUN_LABELS = listOf(
    "一運", "二運", "三運", "四運", "五運",
    "六運", "七運", "八運", "九運"
)

// ── 資料模型 ──────────────────────────────────────────────

data class PalaceCell(
    val palace: Int,
    val periodStar: Int,
    val mountStar: Int,
    val facingStar: Int,
    val isFire: Boolean
)

data class StarChartResult(
    val yun: Int,
    val cells: List<PalaceCell>
)

// ── 工具函式 ─────────────────────────────────────────────

private fun mod9(n: Int): Int = ((n - 1 + 900) % 9) + 1

private fun buildChart(center: Int, forward: Boolean): IntArray {
    val result = IntArray(9)
    for (i in 0 until 9) {
        val palace = FLY_ORDER[i]
        val star = if (forward) mod9(center + i) else mod9(center - i)
        result[PALACE_IDX[palace]!!] = star
    }
    return result
}

private fun getFromChart(chart: IntArray, palace: Int): Int =
    chart[PALACE_IDX[palace]!!]

// ── 主計算函式 ───────────────────────────────────────────

fun computeChart(
    yun: Int,
    mountain: String,
    shijiao: String,
    isFire: Boolean,
    isQiXing: Boolean
): StarChartResult {
    val mtn = mountain.replace("山", "")
    val opp = OPPOSITE[mtn] ?: "午"

    val sitPalace = MOUNTAIN_PALACE[mtn] ?: 1
    val facPalace = MOUNTAIN_PALACE[opp] ?: 9

    val periodChart = buildChart(yun, true)
    val sitCenter = getFromChart(periodChart, sitPalace)
    val facCenter = getFromChart(periodChart, facPalace)

    // 標準下卦法：五黃(5)永遠逆飛；其他：星與宮異陰陽→順飛，同陰陽→逆飛
    fun flyDir(star: Int, palace: Int) =
        if (star == 5) false else (star % 2 == 1) != (palace % 2 == 1)
    var sitForward = flyDir(sitCenter, sitPalace)
    var facForward = flyDir(facCenter, facPalace)

    // 起星（替星法）：改用山的固有陰陽（四正=順，四隅=逆）
    if (isQiXing) {
        sitForward = MOUNTAIN_YANG[mtn] ?: true
        facForward = MOUNTAIN_YANG[opp] ?: true
    }

    val mountChart  = buildChart(sitCenter, sitForward)
    val facingChart = buildChart(facCenter, facForward)

    val firePalaces = mutableSetOf<Int>()
    if (isFire) {
        for (p in 1..9) {
            val idx = PALACE_IDX[p]!!
            if (mountChart[idx] == 5 || facingChart[idx] == 5 ||
                (mountChart[idx] + facingChart[idx] == 10 && periodChart[idx] == 5)
            ) {
                firePalaces.add(p)
            }
        }
    }

    val displayOrder = SHIJIAO_DISPLAY[shijiao] ?: SHIJIAO_DISPLAY["背坎向離"]!!
    val cells = displayOrder.map { palace ->
        val idx = PALACE_IDX[palace]!!
        PalaceCell(
            palace      = palace,
            periodStar  = periodChart[idx],
            mountStar   = mountChart[idx],
            facingStar  = facingChart[idx],
            isFire      = firePalaces.contains(palace)
        )
    }

    return StarChartResult(yun, cells)
}

fun getThreeCharts(
    yun: Int,
    mountain: String,
    shijiao: String,
    isFire: Boolean,
    isQiXing: Boolean
): List<StarChartResult> {
    val prev = mod9(yun - 1)
    val next = mod9(yun + 1)
    return listOf(
        computeChart(prev, mountain, shijiao, isFire, isQiXing),
        computeChart(yun,  mountain, shijiao, isFire, isQiXing),
        computeChart(next, mountain, shijiao, isFire, isQiXing)
    )
}
