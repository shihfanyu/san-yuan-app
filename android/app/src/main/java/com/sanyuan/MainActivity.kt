package com.sanyuan

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sanyuan.api.GasApiClient
import com.sanyuan.api.SaveRequest
import com.sanyuan.calculator.*
import com.sanyuan.databinding.ActivityMainBinding
import com.sanyuan.db.AppDatabase
import com.sanyuan.model.Record
import kotlinx.coroutines.launch
import java.util.UUID

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val dao by lazy { AppDatabase.getInstance(this).recordDao() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupSpinners()
        setupButtons()

        // 從 SearchActivity 載入紀錄時（若有 intent extras）
        intent?.let { loadFromIntent(it) }
    }

    private fun setupSpinners() {
        binding.spinnerYun.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, YUN_LABELS)
            .also { it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }
        binding.spinnerYun.setSelection(8) // 預設九運

        binding.spinnerMountain.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, MOUNTAINS)
            .also { it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }

        binding.spinnerShijiao.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, SHIJIAO_OPTIONS)
            .also { it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }
    }

    private fun setupButtons() {
        binding.btnChart.setOnClickListener { startChart() }
        binding.btnSave.setOnClickListener { saveRecord() }
        binding.btnSearch.setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }
    }

    private fun getFormValues(): Triple<Int, String, String> {
        val yun = binding.spinnerYun.selectedItemPosition + 1
        val mountain = MOUNTAINS[binding.spinnerMountain.selectedItemPosition]
        val shijiao = SHIJIAO_OPTIONS[binding.spinnerShijiao.selectedItemPosition]
        return Triple(yun, mountain, shijiao)
    }

    private fun startChart() {
        val (yun, mountain, shijiao) = getFormValues()
        val isFire = binding.checkFire.isChecked
        val isQiXing = binding.checkQiXing.isChecked

        val intent = Intent(this, ChartActivity::class.java).apply {
            putExtra("yun", yun)
            putExtra("mountain", mountain)
            putExtra("shijiao", shijiao)
            putExtra("fire", isFire)
            putExtra("qiXing", isQiXing)
            putExtra("owner", binding.etOwner.text.toString())
            putExtra("address", binding.etAddress.text.toString())
            putExtra("angle", binding.etAngle.text.toString())
            putExtra("notes", binding.etNotes.text.toString())
            putExtra("date", binding.etDate.text.toString())
        }
        startActivity(intent)
    }

    private fun saveRecord() {
        val (yun, mountain, shijiao) = getFormValues()
        val record = Record(
            id        = UUID.randomUUID().toString(),
            date      = binding.etDate.text.toString(),
            owner     = binding.etOwner.text.toString(),
            address   = binding.etAddress.text.toString(),
            angle     = binding.etAngle.text.toString(),
            yun       = yun,
            mountain  = mountain,
            shijiao   = shijiao,
            firePit   = binding.checkFire.isChecked,
            qiXing    = binding.checkQiXing.isChecked,
            notes     = binding.etNotes.text.toString(),
            createdAt = System.currentTimeMillis().toString(),
            synced    = false
        )

        lifecycleScope.launch {
            dao.insert(record)
            // 嘗試同步至 GAS
            try {
                val res = GasApiClient.api.saveRecord(
                    SaveRequest(
                        date     = record.date,
                        owner    = record.owner,
                        address  = record.address,
                        angle    = record.angle,
                        yun      = record.yun,
                        mountain = record.mountain,
                        shijiao  = record.shijiao,
                        firePit  = record.firePit,
                        qiXing   = record.qiXing,
                        notes    = record.notes
                    )
                )
                if (res.success) dao.markSynced(record.id)
                runOnUiThread { Toast.makeText(this@MainActivity, "儲存並同步成功", Toast.LENGTH_SHORT).show() }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this@MainActivity, "已儲存本機，同步失敗：${e.message}", Toast.LENGTH_LONG).show() }
            }
        }
    }

    private fun loadFromIntent(intent: Intent) {
        val mountain = intent.getStringExtra("mountain") ?: return
        val mountainIdx = MOUNTAINS.indexOf(mountain)
        if (mountainIdx >= 0) binding.spinnerMountain.setSelection(mountainIdx)

        val yun = intent.getIntExtra("yun", 9)
        binding.spinnerYun.setSelection(yun - 1)

        val shijiao = intent.getStringExtra("shijiao") ?: SHIJIAO_OPTIONS[0]
        val shijiaoIdx = SHIJIAO_OPTIONS.indexOf(shijiao)
        if (shijiaoIdx >= 0) binding.spinnerShijiao.setSelection(shijiaoIdx)

        binding.etOwner.setText(intent.getStringExtra("owner") ?: "")
        binding.etAddress.setText(intent.getStringExtra("address") ?: "")
        binding.etAngle.setText(intent.getStringExtra("angle") ?: "")
        binding.etNotes.setText(intent.getStringExtra("notes") ?: "")
        binding.etDate.setText(intent.getStringExtra("date") ?: "")
        binding.checkFire.isChecked = intent.getBooleanExtra("fire", false)
        binding.checkQiXing.isChecked = intent.getBooleanExtra("qiXing", false)
    }
}
