package com.sanyuan

import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.sanyuan.calculator.*
import com.sanyuan.databinding.ActivityChartBinding

class ChartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChartBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val yun      = intent.getIntExtra("yun", 9)
        val mountain = intent.getStringExtra("mountain") ?: "子山"
        val shijiao  = intent.getStringExtra("shijiao")  ?: "背坎向離"
        val isFire   = intent.getBooleanExtra("fire", false)
        val isQiXing = intent.getBooleanExtra("qiXing", false)
        val owner    = intent.getStringExtra("owner") ?: ""
        val address  = intent.getStringExtra("address") ?: ""
        val angle    = intent.getStringExtra("angle") ?: ""
        val notes    = intent.getStringExtra("notes") ?: ""

        supportActionBar?.title = "${YUN_LABELS[yun - 1]} · $mountain"

        val charts = getThreeCharts(yun, mountain, shijiao, isFire, isQiXing)
        val labels = listOf("前運", "當運", "後運")

        // 顯示三個星盤
        for ((i, chart) in charts.withIndex()) {
            val container = when (i) {
                0 -> binding.chartPrev
                1 -> binding.chartCurrent
                else -> binding.chartNext
            }
            val label = when (i) {
                0 -> binding.labelPrev
                1 -> binding.labelCurrent
                else -> binding.labelNext
            }
            label.text = "${labels[i]}（${YUN_LABELS[chart.yun - 1]}）"
            if (i == 1) label.setTextColor(ContextCompat.getColor(this, R.color.amber_700))
            renderChart(container, chart)
        }

        // 附加資訊
        val info = buildString {
            if (owner.isNotEmpty()) append("屋主：$owner　")
            if (address.isNotEmpty()) append("地址：$address\n")
            if (angle.isNotEmpty()) append("角度：${angle}°　")
            if (notes.isNotEmpty()) append("備註：$notes")
        }.trim()
        if (info.isNotEmpty()) {
            binding.tvInfo.text = info
            binding.tvInfo.visibility = View.VISIBLE
        }
    }

    private fun renderChart(grid: GridLayout, chart: StarChartResult) {
        grid.removeAllViews()
        grid.columnCount = 3
        grid.rowCount = 3

        for ((i, cell) in chart.cells.withIndex()) {
            val cellView = layoutInflater.inflate(R.layout.item_palace, grid, false)

            cellView.findViewById<TextView>(R.id.tvPalaceLabel).text = PALACE_LABEL[cell.palace]
            cellView.findViewById<TextView>(R.id.tvDirection).text = PALACE_DIRECTION[cell.palace]
            cellView.findViewById<TextView>(R.id.tvMountStar).text = cell.mountStar.toString()
            cellView.findViewById<TextView>(R.id.tvPeriodStar).text = cell.periodStar.toString()
            cellView.findViewById<TextView>(R.id.tvFacingStar).text = cell.facingStar.toString()
            cellView.findViewById<TextView>(R.id.tvFireMark).visibility =
                if (cell.isFire) View.VISIBLE else View.GONE

            if (cell.isFire) {
                cellView.setBackgroundColor(ContextCompat.getColor(this, R.color.fire_bg))
            } else if (i == 4) {
                cellView.setBackgroundColor(ContextCompat.getColor(this, R.color.center_bg))
            }

            val params = GridLayout.LayoutParams(
                GridLayout.spec(i / 3, GridLayout.FILL, 1f),
                GridLayout.spec(i % 3, GridLayout.FILL, 1f)
            ).apply {
                width = 0
                height = 0
            }
            cellView.layoutParams = params
            grid.addView(cellView)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
