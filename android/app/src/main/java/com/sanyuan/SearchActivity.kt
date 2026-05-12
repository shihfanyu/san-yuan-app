package com.sanyuan

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sanyuan.api.GasApiClient
import com.sanyuan.calculator.YUN_LABELS
import com.sanyuan.databinding.ActivitySearchBinding
import com.sanyuan.db.AppDatabase
import com.sanyuan.model.Record
import kotlinx.coroutines.launch

class SearchActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySearchBinding
    private val dao by lazy { AppDatabase.getInstance(this).recordDao() }
    private val adapter = RecordAdapter(::onLoadRecord, ::onDeleteRecord)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySearchBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.apply {
            title = "查詢紀錄"
            setDisplayHomeAsUpEnabled(true)
        }

        binding.rvRecords.layoutManager = LinearLayoutManager(this)
        binding.rvRecords.adapter = adapter

        binding.btnSearch.setOnClickListener { doSearch() }
        doSearch() // 初始載入所有
    }

    private fun doSearch() {
        val q = binding.etSearch.text.toString().trim()
        lifecycleScope.launch {
            try {
                // 先嘗試從 GAS 查詢
                val res = GasApiClient.api.listRecords(q = q)
                val records = res.records ?: emptyList()
                updateList(records)
            } catch (e: Exception) {
                // 無網路時回落到本機 Room DB
                val records = dao.search(q)
                updateList(records)
            }
        }
    }

    private fun updateList(records: List<Record>) {
        runOnUiThread {
            adapter.submitList(records)
            binding.tvCount.text = "共 ${records.size} 筆"
        }
    }

    private fun onLoadRecord(record: Record) {
        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra("yun", record.yun)
            putExtra("mountain", record.mountain)
            putExtra("shijiao", record.shijiao)
            putExtra("owner", record.owner)
            putExtra("address", record.address)
            putExtra("angle", record.angle)
            putExtra("fire", record.firePit)
            putExtra("qiXing", record.qiXing)
            putExtra("notes", record.notes)
            putExtra("date", record.date)
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        startActivity(intent)
    }

    private fun onDeleteRecord(record: Record) {
        AlertDialog.Builder(this)
            .setTitle("刪除紀錄")
            .setMessage("確定刪除「${record.owner.ifEmpty { record.address }}」的紀錄？")
            .setPositiveButton("刪除") { _, _ ->
                lifecycleScope.launch {
                    dao.delete(record)
                    try { GasApiClient.api.deleteRecord(
                        com.sanyuan.api.DeleteRequest(id = record.id)
                    ) } catch (_: Exception) {}
                    doSearch()
                }
            }
            .setNegativeButton("取消", null)
            .show()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}

class RecordAdapter(
    private val onLoad: (Record) -> Unit,
    private val onDelete: (Record) -> Unit
) : RecyclerView.Adapter<RecordAdapter.VH>() {

    private var list = emptyList<Record>()

    fun submitList(new: List<Record>) {
        list = new
        notifyDataSetChanged()
    }

    override fun getItemCount() = list.size

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_record, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.bind(list[position])
    }

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        private val tvOwner:   TextView = view.findViewById(R.id.tvOwner)
        private val tvAddress: TextView = view.findViewById(R.id.tvAddress)
        private val tvMeta:    TextView = view.findViewById(R.id.tvMeta)
        private val tvNotes:   TextView = view.findViewById(R.id.tvNotes)

        fun bind(record: Record) {
            tvOwner.text = record.owner.ifEmpty { "（無屋主）" }
            tvAddress.text = record.address.ifEmpty { "（無地址）" }
            val yunLabel = YUN_LABELS.getOrElse(record.yun - 1) { "?" }
            tvMeta.text = "$yunLabel ／ ${record.mountain} ／ ${record.date}" +
                (if (record.firePit) " 🔥" else "") +
                (if (record.qiXing) " ⭐" else "")
            tvNotes.text = record.notes
            tvNotes.visibility = if (record.notes.isEmpty()) View.GONE else View.VISIBLE

            itemView.findViewById<View>(R.id.btnLoad).setOnClickListener { onLoad(record) }
            itemView.findViewById<View>(R.id.btnDelete).setOnClickListener { onDelete(record) }
        }
    }
}
